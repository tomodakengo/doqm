import { createClient as createStandardClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';

// Pages Router API Routes用のクライアント
export const createClient = () => {
    // API Routes用の標準クライアント
    return createStandardClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
            }
        }
    );
}; 