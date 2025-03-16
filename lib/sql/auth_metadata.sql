-- 認証メタデータテーブル（招待トークンなどの一時的なデータを保存）
CREATE TABLE IF NOT EXISTS auth_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLSポリシーの設定
ALTER TABLE auth_metadata ENABLE ROW LEVEL SECURITY;

-- 自分のメタデータのみ閲覧可能
DROP POLICY IF EXISTS "メタデータの閲覧は本人のみ" ON auth_metadata;
CREATE POLICY "メタデータの閲覧は本人のみ"
    ON auth_metadata FOR SELECT
    USING (
        user_id = auth.uid()
    );

-- サービス用のポリシー（サービスロールからのアクセスは制限なし）
DROP POLICY IF EXISTS "サービスからのメタデータアクセス" ON auth_metadata;
CREATE POLICY "サービスからのメタデータアクセス"
    ON auth_metadata
    USING (
        auth.role() = 'service_role'
    );

-- インデックスの作成
CREATE INDEX IF NOT EXISTS auth_metadata_user_id_idx ON auth_metadata(user_id);
CREATE INDEX IF NOT EXISTS auth_metadata_status_idx ON auth_metadata((metadata->>'status')); 