// App RouterのServer ComponentとPages Router両方で使えるクライアント取得ユーティリティ
export async function createServerSideClient() {
    // App Router Server Componentの場合
    try {
        // 動的インポートでnext/headersの直接参照を避ける
        const { createClient } = await import('./server');
        return await createClient();
    } catch (error) {
        // Pages Routerの場合
        const { createClient } = await import('./server-api');
        return createClient();
    }
} 