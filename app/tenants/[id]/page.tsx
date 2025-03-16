"use client";

import {
  getTenantDetailsAction,
  inviteUserToTenantAction,
  removeUserFromTenantAction,
  updateTenantAction,
  updateUserRoleAction,
} from "@/app/actions/tenant";
import MainLayout from "@components/layout/MainLayout";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as LucideIcons from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// テナント情報編集フォームのスキーマ
const tenantFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "テナント名は2文字以上である必要があります" })
    .max(50, { message: "テナント名は50文字以内である必要があります" }),
  description: z
    .string()
    .max(200, { message: "説明は200文字以内である必要があります" })
    .optional(),
  plan: z.enum(["basic", "standard", "premium"], {
    required_error: "プランを選択してください",
  }),
});

// ユーザー招待フォームのスキーマ
const inviteFormSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください" }),
  role: z.enum(["admin", "manager", "user", "guest"], {
    required_error: "役割を選択してください",
  }),
});

// ユーザー役割変更フォームのスキーマ
const roleFormSchema = z.object({
  role: z.enum(["admin", "manager", "user", "guest"], {
    required_error: "役割を選択してください",
  }),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;
type InviteFormValues = z.infer<typeof inviteFormSchema>;
type RoleFormValues = z.infer<typeof roleFormSchema>;

interface Tenant {
  id: string;
  name: string;
  description: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

interface TenantUser {
  id: string;
  role: string;
  joined_at: string;
  users: {
    id: string;
    email: string;
    profiles:
      | {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string;
        }[]
      | null;
  };
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // 各種モーダルの状態
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    token: string;
    email: string;
  } | null>(null);

  // フォームの初期化
  const tenantForm = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: "",
      description: "",
      plan: "basic",
    },
  });

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "user",
    },
  });

  const roleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      role: "user",
    },
  });

  // テナント詳細データの取得
  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getTenantDetailsAction(tenantId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.data) {
        setTenant(result.data.tenant);
        // usersデータを正しい形式に変換
        const formattedUsers = result.data.users.map((user: any) => ({
          id: user.id,
          role: user.role,
          joined_at: user.joined_at,
          users: {
            id: user.users[0]?.id || "",
            email: user.users[0]?.email || "",
            profiles: user.users[0]?.profiles || null,
          },
        }));
        setUsers(formattedUsers);

        // テナント編集フォームの初期値を設定
        tenantForm.reset({
          name: result.data.tenant.name,
          description: result.data.tenant.description || "",
          plan: result.data.tenant.plan as "basic" | "standard" | "premium",
        });
      }
    } catch (error: any) {
      console.error("テナント詳細取得エラー:", error);
      setError(error.message || "テナント詳細の取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantDetails();
  }, [tenantId]);

  // テナント情報更新
  const handleTenantUpdate = async (values: TenantFormValues) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("plan", values.plan);

      const result = await updateTenantAction(tenantId, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsEditModalOpen(false);
      fetchTenantDetails();
    } catch (error: any) {
      console.error("テナント更新エラー:", error);
      setError(error.message || "テナントの更新中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // ユーザー招待
  const handleInviteUser = async (values: InviteFormValues) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("role", values.role);

      const result = await inviteUserToTenantAction(tenantId, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setInviteResult(result.data);
      inviteForm.reset({ email: "", role: "user" });
    } catch (error: any) {
      console.error("ユーザー招待エラー:", error);
      setError(error.message || "ユーザーの招待中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // ユーザー役割変更
  const handleRoleChange = async (values: RoleFormValues) => {
    try {
      if (!selectedUser) return;

      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("role", values.role);

      const result = await updateUserRoleAction(selectedUser.id, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsRoleModalOpen(false);
      fetchTenantDetails();
    } catch (error: any) {
      console.error("役割変更エラー:", error);
      setError(error.message || "役割の変更中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // ユーザー削除
  const handleUserRemove = async () => {
    try {
      if (!selectedUser) return;

      setLoading(true);
      setError(null);

      const result = await removeUserFromTenantAction(selectedUser.id);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsDeleteModalOpen(false);
      fetchTenantDetails();
    } catch (error: any) {
      console.error("ユーザー削除エラー:", error);
      setError(error.message || "ユーザーの削除中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 役割に応じたバッジのスタイルを返す
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      case "guest":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 役割の日本語名を返す
  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "管理者";
      case "manager":
        return "マネージャー";
      case "user":
        return "ユーザー";
      case "guest":
        return "ゲスト";
      default:
        return role;
    }
  };

  // プランのバッジスタイルを返す
  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "standard":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // プラン名を日本語に変換
  const getPlanName = (plan: string) => {
    switch (plan) {
      case "premium":
        return "プレミアム";
      case "standard":
        return "スタンダード";
      default:
        return "ベーシック";
    }
  };

  if (loading && !tenant) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <LucideIcons.Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </MainLayout>
    );
  }

  if (error && !tenant) {
    return (
      <MainLayout>
        <div className="bg-red-50 p-6 rounded-lg text-red-600">
          <div className="flex items-center">
            <LucideIcons.AlertCircle className="w-6 h-6 mr-2" />
            <p>{error}</p>
          </div>
          <div className="mt-4 flex space-x-4">
            <Button variant="outline" onClick={() => fetchTenantDetails()}>
              再試行
            </Button>
            <Button variant="outline" onClick={() => router.push("/tenants")}>
              テナント一覧に戻る
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tenant?.name}</h1>
            <p className="text-gray-600 mt-1">{tenant?.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/tenants")}>
              <LucideIcons.ArrowLeft className="w-4 h-4 mr-2" />
              テナント一覧
            </Button>
            <Button onClick={() => setIsEditModalOpen(true)}>
              <LucideIcons.Edit className="w-4 h-4 mr-2" />
              テナント編集
            </Button>
          </div>
        </div>

        {/* タブ */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="users">ユーザー管理</TabsTrigger>
            <TabsTrigger value="test-suites">テストスイート</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>テナント概要</CardTitle>
                <CardDescription>
                  テナントの基本情報を確認できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        テナント名
                      </h3>
                      <p className="text-lg text-gray-900">{tenant?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        プラン
                      </h3>
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPlanBadgeStyle(
                            tenant?.plan || "basic"
                          )}`}
                        >
                          {getPlanName(tenant?.plan || "basic")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      説明
                    </h3>
                    <p className="text-gray-900">
                      {tenant?.description || "説明なし"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        作成日
                      </h3>
                      <p className="text-gray-900">
                        {tenant?.created_at
                          ? formatDate(tenant.created_at)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        最終更新日
                      </h3>
                      <p className="text-gray-900">
                        {tenant?.updated_at
                          ? formatDate(tenant.updated_at)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        ユーザー数
                      </h3>
                      <p className="text-gray-900">{users.length}人</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ユーザー管理タブ */}
          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  ユーザー管理
                </h2>
                <Button onClick={() => setIsInviteModalOpen(true)}>
                  <LucideIcons.UserPlus className="w-4 h-4 mr-2" />
                  ユーザー招待
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ユーザー</TableHead>
                        <TableHead>メールアドレス</TableHead>
                        <TableHead>役割</TableHead>
                        <TableHead>参加日</TableHead>
                        <TableHead className="text-right">アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-gray-500"
                          >
                            ユーザーがいません
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                  {user.users.profiles?.[0]?.full_name?.[0] ||
                                    user.users.email[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {user.users.profiles?.[0]?.full_name ||
                                      "名前未設定"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {user.users.profiles?.[0]?.username || ""}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.users.email}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeStyle(
                                  user.role
                                )}`}
                              >
                                {getRoleName(user.role)}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(user.joined_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    roleForm.reset({
                                      role: user.role as
                                        | "admin"
                                        | "manager"
                                        | "user"
                                        | "guest",
                                    });
                                    setIsRoleModalOpen(true);
                                  }}
                                >
                                  <LucideIcons.UserCog className="w-4 h-4 mr-1" />
                                  役割変更
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  <LucideIcons.UserMinus className="w-4 h-4 mr-1" />
                                  削除
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* テストスイートタブ（未実装） */}
          <TabsContent value="test-suites">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <LucideIcons.ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                テストスイート管理
              </h2>
              <p className="text-gray-600 mb-6">
                このテナントに関連付けられたテストスイート管理機能は現在開発中です
              </p>
              <Button variant="outline">
                <LucideIcons.ExternalLink className="w-4 h-4 mr-2" />
                テストスイート一覧へ
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* テナント編集モーダル */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>テナント情報編集</DialogTitle>
            <DialogDescription>
              テナントの基本情報を編集できます
            </DialogDescription>
          </DialogHeader>

          <Form {...tenantForm}>
            <form
              onSubmit={tenantForm.handleSubmit(handleTenantUpdate)}
              className="space-y-6 pt-2"
            >
              <FormField
                control={tenantForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>テナント名 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="テナント名を入力"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tenantForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="テナントの説明を入力（オプション）"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tenantForm.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>プラン *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="プランを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">ベーシック</SelectItem>
                        <SelectItem value="standard">スタンダード</SelectItem>
                        <SelectItem value="premium">プレミアム</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={loading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LucideIcons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    "保存"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ユーザー招待モーダル */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>ユーザー招待</DialogTitle>
            <DialogDescription>
              メールアドレスを入力して、テナントにユーザーを招待します
            </DialogDescription>
          </DialogHeader>

          {inviteResult ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-md text-green-800 flex items-start">
                <LucideIcons.Check className="w-5 h-5 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">招待が作成されました</p>
                  <p className="text-sm">
                    以下のリンクを {inviteResult.email} に送信してください。
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md text-gray-600 break-all text-sm">
                https://yourdomain.com/invitation/accept?token=
                {inviteResult.token}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  onClick={() => {
                    setInviteResult(null);
                    setIsInviteModalOpen(false);
                  }}
                >
                  閉じる
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <Form {...inviteForm}>
              <form
                onSubmit={inviteForm.handleSubmit(handleInviteUser)}
                className="space-y-6 pt-2"
              >
                <FormField
                  control={inviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@company.com"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        招待するユーザーのメールアドレスを入力してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inviteForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>役割 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="役割を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">
                            管理者（テナント設定の変更可能）
                          </SelectItem>
                          <SelectItem value="manager">
                            マネージャー（テストスイート管理可能）
                          </SelectItem>
                          <SelectItem value="user">
                            ユーザー（テスト実行可能）
                          </SelectItem>
                          <SelectItem value="guest">
                            ゲスト（閲覧のみ）
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteModalOpen(false)}
                    disabled={loading}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LucideIcons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        招待中...
                      </>
                    ) : (
                      "招待を送信"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* 役割変更モーダル */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ユーザー役割変更</DialogTitle>
            <DialogDescription>
              {selectedUser?.users.email} の役割を変更します
            </DialogDescription>
          </DialogHeader>

          <Form {...roleForm}>
            <form
              onSubmit={roleForm.handleSubmit(handleRoleChange)}
              className="space-y-6 pt-2"
            >
              <FormField
                control={roleForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>役割 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="役割を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">
                          管理者（テナント設定の変更可能）
                        </SelectItem>
                        <SelectItem value="manager">
                          マネージャー（テストスイート管理可能）
                        </SelectItem>
                        <SelectItem value="user">
                          ユーザー（テスト実行可能）
                        </SelectItem>
                        <SelectItem value="guest">
                          ゲスト（閲覧のみ）
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleModalOpen(false)}
                  disabled={loading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LucideIcons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    "役割を変更"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ユーザー削除確認モーダル */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ユーザー削除の確認</DialogTitle>
            <DialogDescription>
              本当にこのユーザーをテナントから削除しますか？
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700">
              <span className="font-medium">
                {selectedUser?.users.profiles?.[0]?.full_name ||
                  selectedUser?.users.email}
              </span>{" "}
              をテナントから削除します。
            </p>
            <p className="text-sm text-gray-500 mt-2">
              この操作は取り消せません。ユーザーはテナントへのアクセス権を失います。
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleUserRemove}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LucideIcons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  削除中...
                </>
              ) : (
                "削除する"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
