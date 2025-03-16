import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createAPIClient } from "@/lib/supabase/server-api";

// クライアントを適切に取得する関数
const getClientForAPI = async () => {
    try {
        // サーバーサイドでのみ実行される場合
        if (typeof window === "undefined") {
            // サーバーサイドではAPI用クライアントを使用
            return createAPIClient();
        } else {
            // クライアントサイドの場合（ブラウザ環境）
            return createBrowserClient();
        }
    } catch (error) {
        console.error("Supabaseクライアント作成エラー:", error);
        // エラーが発生した場合、APIクライアントで代替
        return createAPIClient();
    }
};

// Supabaseクライアントを取得する関数
async function getSupabaseClient() {
    return await getClientForAPI();
}

/**
 * テナント関連のAPI関数
 */

// テナント一覧を取得
export async function getTenants() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

// ユーザーが所属するテナント一覧を取得
export async function getUserTenants(userId: string) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from("tenant_users")
        .select(`
			id,
			role,
			joined_at,
			tenants:tenant_id(*)
		`)
        .eq("user_id", userId)
        .order("joined_at", { ascending: false });

    if (error) throw error;
    return data;
}

// テナントの詳細を取得
export async function getTenantDetails(tenantId: string) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

    if (error) throw error;
    return data;
}

// テナントのユーザー一覧を取得
export async function getTenantUsers(tenantId: string) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from("tenant_users")
        .select(`
			id,
			role,
			joined_at,
			users:user_id(
				id,
				email,
				profiles(
					id,
					username,
					full_name,
					avatar_url
				)
			)
		`)
        .eq("tenant_id", tenantId)
        .order("role", { ascending: true });

    if (error) throw error;
    return data;
}

// テナントの作成
export async function createTenant(data: {
    name: string;
    description?: string;
    plan?: string;
}) {
    const supabase = await getSupabaseClient();

    // テナントを作成
    const { data: tenant, error } = await supabase
        .from("tenants")
        .insert([{
            name: data.name,
            description: data.description,
            plan: data.plan || "basic"
        }])
        .select()
        .single();

    if (error) throw error;

    // 現在のユーザー情報を取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("ユーザーが認証されていません");

    // 作成者をテナント管理者として追加
    const { error: userError } = await supabase
        .from("tenant_users")
        .insert([{
            tenant_id: tenant.id,
            user_id: user.id,
            role: "admin"
        }]);

    if (userError) throw userError;

    return tenant;
}

// テナント情報の更新
export async function updateTenant(
    tenantId: string,
    data: {
        name?: string;
        description?: string;
        plan?: string;
    }
) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
        .from("tenants")
        .update({
            name: data.name,
            description: data.description,
            plan: data.plan,
            updated_at: new Date().toISOString()
        })
        .eq("id", tenantId);

    if (error) throw error;
    return true;
}

// テナントユーザーの追加
export async function addTenantUser(
    tenantId: string,
    userId: string,
    role: "admin" | "manager" | "user" | "guest"
) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
        .from("tenant_users")
        .insert([{
            tenant_id: tenantId,
            user_id: userId,
            role
        }]);

    if (error) throw error;
    return true;
}

// テナントユーザーの役割更新
export async function updateTenantUserRole(
    tenantUserId: string,
    newRole: "admin" | "manager" | "user" | "guest"
) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
        .from("tenant_users")
        .update({ role: newRole })
        .eq("id", tenantUserId);

    if (error) throw error;
    return true;
}

// テナントユーザーの削除
export async function removeTenantUser(tenantUserId: string) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
        .from("tenant_users")
        .delete()
        .eq("id", tenantUserId);

    if (error) throw error;
    return true;
}

// テナント招待の作成
export async function createTenantInvitation(data: {
    tenantId: string;
    email: string;
    role: "admin" | "manager" | "user" | "guest";
    expiresInDays?: number;
}) {
    const supabase = await getSupabaseClient();

    // 現在のユーザー情報を取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("ユーザーが認証されていません");

    // トークンを生成
    const token = crypto.randomUUID();

    // 有効期限を設定
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));

    const { error } = await supabase
        .from("tenant_invitations")
        .insert([{
            tenant_id: data.tenantId,
            email: data.email,
            role: data.role,
            token,
            created_by: user.id,
            expires_at: expiresAt.toISOString()
        }]);

    if (error) throw error;
    return { token };
}

// テナント招待の承諾
export async function acceptTenantInvitation(token: string) {
    const supabase = await getSupabaseClient();

    // トークンの有効性を確認
    const { data: invitation, error: fetchError } = await supabase
        .from("tenant_invitations")
        .select("*")
        .eq("token", token)
        .eq("accepted", false)
        .gt("expires_at", new Date().toISOString())
        .single();

    if (fetchError) throw fetchError;
    if (!invitation) throw new Error("無効な招待またはすでに期限切れです");

    // 現在のユーザー情報を取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("ユーザーが認証されていません");

    // ユーザーのメールアドレスを確認
    if (user.email !== invitation.email) {
        throw new Error("この招待は別のメールアドレス宛てです");
    }

    // トランザクション的に処理したいが、Supabaseではまだサポートされていないため順次実行
    // 1. tenant_usersにユーザーを追加
    const { error: addError } = await supabase
        .from("tenant_users")
        .insert([{
            tenant_id: invitation.tenant_id,
            user_id: user.id,
            role: invitation.role
        }]);

    if (addError) throw addError;

    // 2. 招待を承諾済みとしてマーク
    const { error: updateError } = await supabase
        .from("tenant_invitations")
        .update({ accepted: true })
        .eq("id", invitation.id);

    if (updateError) throw updateError;

    return { tenantId: invitation.tenant_id };
}

// テスト関連データのテナントIDを更新
export async function updateTestSuiteTenant(testSuiteId: string, tenantId: string) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
        .from("test_suites")
        .update({ tenant_id: tenantId })
        .eq("id", testSuiteId);

    if (error) throw error;
    return true;
}

// ユーザーのデフォルトテナントを取得
export async function getUserDefaultTenant(userId: string) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from("tenant_users")
        .select(`
			tenants:tenant_id(*)
		`)
        .eq("user_id", userId)
        .order("joined_at", { ascending: false })
        .limit(1)
        .single();

    if (error) throw error;
    return data?.tenants;
} 