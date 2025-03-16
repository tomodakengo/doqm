import { signUpAction } from "@/app/actions";
import { FormMessage, type Message } from "@/app/components/common/FormMessage";
import { SubmitButton } from "@/app/components/common/SubmitButton";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">アカウント作成</h1>
        <p className="text-sm text-foreground">
          すでにアカウントをお持ちですか？{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            サインイン
          </Link>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          ※アカウント登録後、テナント（組織）の作成が必要です。招待を受けている場合は招待リンクからサインアップしてください。
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">メールアドレス</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">パスワード</Label>
          <Input
            type="password"
            name="password"
            placeholder="6文字以上のパスワード"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="登録中...">
            アカウント登録
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
