"use client";

import { createTenantAction } from "@/app/actions/tenant";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
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
import { Textarea } from "@/app/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// フォームのバリデーションスキーマ
const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

export default function CreateTenantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フォームの初期化
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      plan: "basic",
    },
  });

  // フォーム送信ハンドラ
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // FormDataの作成
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.description) {
        formData.append("description", values.description);
      }
      formData.append("plan", values.plan);

      // テナント作成アクションの実行
      const result = await createTenantAction(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      // 成功時はテナント詳細ページにリダイレクト
      router.push(`/tenants/${result.data.id}`);
    } catch (error: any) {
      console.error("テナント作成エラー:", error);
      setError(error.message || "テナントの作成中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー部分 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">テナント作成</h1>
          <p className="text-gray-600 mt-1">
            新しいテナントを作成して、テストスイートの管理を始めましょう
          </p>
        </div>

        {/* メインコンテンツ */}
        <Card>
          <CardHeader>
            <CardTitle>テナント情報</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 p-4 rounded-md text-red-600 mb-6">
                <div className="flex items-center">
                  <LucideIcons.AlertCircle className="w-5 h-5 mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>テナント名 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="テナント名を入力"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        会社名や組織名を入力してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>説明</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="テナントの説明を入力（オプション）"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        テナントの簡単な説明を入力してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>プラン *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
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
                      <FormDescription>
                        利用するプランを選択してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => router.push("/tenants")}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LucideIcons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        作成中...
                      </>
                    ) : (
                      <>
                        <LucideIcons.Plus className="w-4 h-4 mr-2" />
                        テナント作成
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
