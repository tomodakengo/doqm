"use server";

import {
    createTenant,
    getTenantDetails,
    getUserTenants,
    getTenantUsers,
    updateTenant,
    addTenantUser,
    updateTenantUserRole,
    removeTenantUser,
    createTenantInvitation,
    acceptTenantInvitation,
    getUserDefaultTenant,
} from "@/lib/api/tenants";
import { createClient } from "@/lib/supabase/server";
import { encodedRedirect } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ユーザーが所属するテナント一覧を取得
export async function getUserTenantsAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: "認証が必要です",
                data: null,
            };
        }

        const tenants = await getUserTenants(user.id);
        return {
            success: true,
            data: tenants,
        };
    } catch (error: any) {
        console.error("テナント一覧取得エラー:", error);
        return {
            success: false,
            error: error.message || "テナント一覧の取得中にエラーが発生しました",
            data: null,
        };
    }
}

// テナントの詳細を取得
export async function getTenantDetailsAction(tenantId: string) {
    try {
        const tenant = await getTenantDetails(tenantId);
        const users = await getTenantUsers(tenantId);

        return {
            success: true,
            data: {
                tenant,
                users,
            },
        };
    } catch (error: any) {
        console.error("テナント詳細取得エラー:", error);
        return {
            success: false,
            error: error.message || "テナント詳細の取得中にエラーが発生しました",
            data: null,
        };
    }
}

// テナントを作成
export async function createTenantAction(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const plan = formData.get("plan") as string || "basic";

        if (!name) {
            return {
                success: false,
                error: "テナント名は必須です",
                data: null,
            };
        }

        const tenant = await createTenant({
            name,
            description,
            plan,
        });

        return {
            success: true,
            data: tenant,
        };
    } catch (error: any) {
        console.error("テナント作成エラー:", error);
        return {
            success: false,
            error: error.message || "テナントの作成中にエラーが発生しました",
            data: null,
        };
    }
}

// テナント情報を更新
export async function updateTenantAction(tenantId: string, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const plan = formData.get("plan") as string;

        if (!name) {
            return {
                success: false,
                error: "テナント名は必須です",
                data: null,
            };
        }

        await updateTenant(tenantId, {
            name,
            description,
            plan,
        });

        return {
            success: true,
            data: null,
        };
    } catch (error: any) {
        console.error("テナント更新エラー:", error);
        return {
            success: false,
            error: error.message || "テナントの更新中にエラーが発生しました",
            data: null,
        };
    }
}

// ユーザーをテナントに招待
export async function inviteUserToTenantAction(tenantId: string, formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const role = formData.get("role") as "admin" | "manager" | "user" | "guest";

        if (!email || !role) {
            return {
                success: false,
                error: "メールアドレスと役割は必須です",
                data: null,
            };
        }

        const { token } = await createTenantInvitation({
            tenantId,
            email,
            role,
        });

        // 招待メールの送信処理は別途実装が必要
        // ここでは招待トークンを返すのみ

        return {
            success: true,
            data: {
                token,
                email,
            },
        };
    } catch (error: any) {
        console.error("テナント招待エラー:", error);
        return {
            success: false,
            error: error.message || "招待の作成中にエラーが発生しました",
            data: null,
        };
    }
}

// 招待を承諾
export async function acceptInvitationAction(token: string) {
    try {
        const result = await acceptTenantInvitation(token);

        return {
            success: true,
            data: {
                tenantId: result.tenantId,
            },
        };
    } catch (error: any) {
        console.error("招待承諾エラー:", error);
        return {
            success: false,
            error: error.message || "招待の承諾中にエラーが発生しました",
            data: null,
        };
    }
}

// ユーザーの役割を更新
export async function updateUserRoleAction(tenantUserId: string, formData: FormData) {
    try {
        const role = formData.get("role") as "admin" | "manager" | "user" | "guest";

        if (!role) {
            return {
                success: false,
                error: "役割は必須です",
                data: null,
            };
        }

        await updateTenantUserRole(tenantUserId, role);

        return {
            success: true,
            data: null,
        };
    } catch (error: any) {
        console.error("役割更新エラー:", error);
        return {
            success: false,
            error: error.message || "役割の更新中にエラーが発生しました",
            data: null,
        };
    }
}

// ユーザーをテナントから削除
export async function removeUserFromTenantAction(tenantUserId: string) {
    try {
        await removeTenantUser(tenantUserId);

        return {
            success: true,
            data: null,
        };
    } catch (error: any) {
        console.error("ユーザー削除エラー:", error);
        return {
            success: false,
            error: error.message || "ユーザーの削除中にエラーが発生しました",
            data: null,
        };
    }
}

// ユーザーのデフォルトテナントを取得
export async function getUserDefaultTenantAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: "認証が必要です",
                data: null,
            };
        }

        const tenant = await getUserDefaultTenant(user.id);

        if (!tenant) {
            // デフォルトテナントがなければテナント作成ページにリダイレクト
            redirect("/tenants/new");
        }

        return {
            success: true,
            data: tenant,
        };
    } catch (error: any) {
        console.error("デフォルトテナント取得エラー:", error);
        return {
            success: false,
            error: error.message || "デフォルトテナントの取得中にエラーが発生しました",
            data: null,
        };
    }
} 