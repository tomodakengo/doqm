"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  checkInvitationAction,
  signUpWithInvitationAction,
} from "@/app/actions";

export default function InvitationPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const token = params.token;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<{
    email: string;
    tenantName: string;
    role: string;
  } | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 招待の有効性をチェック
  useEffect(() => {
    const checkInvitation = async () => {
      try {
        setLoading(true);
        const result = await checkInvitationAction(token);

        if (result.success && result.data) {
          setInvitation(result.data);
          setEmail(result.data.email); // 招待されたメールアドレスをセット
        } else {
          setError(result.error || "無効な招待リンクです");
        }
      } catch (err) {
        console.error("招待チェックエラー:", err);
        setError("招待情報の取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    checkInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("メールアドレスとパスワードは必須です");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("token", token);

      const result = await signUpWithInvitationAction(formData);

      if (result.success) {
        // 成功したらサインインページに移動
        router.push(
          "/sign-in?message=招待を受け付けました。メールアドレスを確認してサインインしてください。"
        );
      } else {
        setError(result.error || "サインアップに失敗しました");
      }
    } catch (err) {
      console.error("招待サインアップエラー:", err);
      setError("サインアップ中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">招待情報を確認中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>招待エラー</CardTitle>
            <CardDescription>
              招待の処理中にエラーが発生しました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/sign-in")} className="w-full">
              サインインに戻る
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>招待情報なし</CardTitle>
            <CardDescription>招待情報が見つかりませんでした</CardDescription>
          </CardHeader>
          <CardContent>
            <p>この招待リンクは無効か、期限切れの可能性があります。</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/sign-in")} className="w-full">
              サインインに戻る
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>テナント招待</CardTitle>
          <CardDescription>
            {invitation.tenantName}に{invitation.role}として招待されています
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!invitation.email}
                placeholder="招待されたメールアドレス"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="新しいパスワード"
                minLength={6}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/sign-in")}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "処理中..." : "招待を受け入れる"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
