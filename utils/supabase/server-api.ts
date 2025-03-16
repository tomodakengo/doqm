import { createClient as createStandardClient } from '@supabase/supabase-js';

// Pages Router API Routes用のクライアント
export const createClient = () => {
    return createStandardClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    );
}; 