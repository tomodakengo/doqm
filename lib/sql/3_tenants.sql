-- テナントテーブル
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    plan TEXT DEFAULT 'basic', -- 基本、スタンダード、プロなど
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- テナントユーザーの関連付け
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user', 'guest')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- auth.usersへの外部キー参照を追加
DO $$ 
BEGIN
    -- 外部キー制約が存在するか確認
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tenant_users_user_id_fkey'
    ) THEN
        -- 外部キー制約を追加
        EXECUTE 'ALTER TABLE tenant_users 
                ADD CONSTRAINT tenant_users_user_id_fkey 
                FOREIGN KEY (user_id) 
                REFERENCES auth.users(id) ON DELETE CASCADE';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ユーザーIDの外部キー制約の追加に失敗しました: %', SQLERRM;
END $$;

-- テナントへの招待管理
CREATE TABLE IF NOT EXISTS tenant_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user', 'guest')),
    token TEXT NOT NULL UNIQUE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted BOOLEAN DEFAULT FALSE
);

-- created_byへの外部キー参照を追加
DO $$ 
BEGIN
    -- 外部キー制約が存在するか確認
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tenant_invitations_created_by_fkey'
    ) THEN
        -- 外部キー制約を追加
        EXECUTE 'ALTER TABLE tenant_invitations 
                ADD CONSTRAINT tenant_invitations_created_by_fkey 
                FOREIGN KEY (created_by) 
                REFERENCES auth.users(id) ON DELETE CASCADE';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '招待の作成者IDの外部キー制約の追加に失敗しました: %', SQLERRM;
END $$;

-- テストスイートとテナントの関連付け
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_suites' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE test_suites ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
END $$;

-- テストケースとテナントの関連付け（オプション - スイートから継承可能）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_cases' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE test_cases ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
END $$;

-- チームとテナントの関連付け
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE teams ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
END $$;

-- RLSポリシーの設定
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;

-- すべての既存ポリシーを一度削除
DO $$ 
BEGIN
    -- tenantsテーブルのポリシー削除
    DROP POLICY IF EXISTS "テナントの閲覧" ON tenants;
    DROP POLICY IF EXISTS "テナントの閲覧は所属ユーザーのみ" ON tenants;
    DROP POLICY IF EXISTS "テナントの作成" ON tenants;
    DROP POLICY IF EXISTS "テナントの作成は認証ユーザーのみ" ON tenants;
    DROP POLICY IF EXISTS "テナントの更新" ON tenants;
    DROP POLICY IF EXISTS "テナントの更新は管理者のみ" ON tenants;
    DROP POLICY IF EXISTS "テナントの削除" ON tenants;
    DROP POLICY IF EXISTS "テナントの削除は管理者のみ" ON tenants;

    -- tenant_usersテーブルのポリシー削除
    DROP POLICY IF EXISTS "テナントユーザーの閲覧" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの閲覧は同テナントユーザーのみ" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの閲覧は自分自身のレコードのみ" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの閲覧は管理者も可能" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの追加" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの追加は管理者のみ" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの自己追加" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの他ユーザー追加は管理者のみ" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの削除" ON tenant_users;
    DROP POLICY IF EXISTS "テナントユーザーの削除は管理者のみ" ON tenant_users;

    -- tenant_invitationsテーブルのポリシー削除
    DROP POLICY IF EXISTS "テナント招待の閲覧" ON tenant_invitations;
    DROP POLICY IF EXISTS "テナント招待の閲覧は管理者のみ" ON tenant_invitations;
    DROP POLICY IF EXISTS "テナント招待の作成" ON tenant_invitations;
    DROP POLICY IF EXISTS "テナント招待の作成は管理者のみ" ON tenant_invitations;

    -- test_suitesテーブルのポリシー削除
    DROP POLICY IF EXISTS "テストスイートの閲覧" ON test_suites;
    DROP POLICY IF EXISTS "テストスイートの閲覧は認証ユーザーのみ" ON test_suites;
    DROP POLICY IF EXISTS "テストスイートの閲覧はテナントユーザーのみ" ON test_suites;

    -- test_casesテーブルのポリシー削除
    DROP POLICY IF EXISTS "テストケースの閲覧" ON test_cases;
    DROP POLICY IF EXISTS "テストケースの閲覧は認証ユーザーのみ" ON test_cases;
    DROP POLICY IF EXISTS "テストケースの閲覧はテナントユーザーのみ" ON test_cases;

    -- teamsテーブルのポリシー削除
    DROP POLICY IF EXISTS "チームの閲覧" ON teams;
    DROP POLICY IF EXISTS "チームの閲覧は認証ユーザーのみ" ON teams;
    DROP POLICY IF EXISTS "チームの閲覧はテナントユーザーのみ" ON teams;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ポリシー削除中にエラーが発生しましたが、続行します: %', SQLERRM;
END $$;

-- テナントのポリシー
CREATE POLICY "テナントの閲覧"
    ON tenants FOR SELECT
    USING (TRUE);

CREATE POLICY "テナントの作成"
    ON tenants FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "テナントの更新"
    ON tenants FOR UPDATE
    USING (TRUE);

CREATE POLICY "テナントの削除"
    ON tenants FOR DELETE
    USING (TRUE);

-- テナントユーザーのポリシー
CREATE POLICY "テナントユーザーの閲覧"
    ON tenant_users FOR SELECT
    USING (TRUE);

CREATE POLICY "テナントユーザーの追加"
    ON tenant_users FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "テナントユーザーの削除"
    ON tenant_users FOR DELETE
    USING (TRUE);

-- テナント招待のポリシー
CREATE POLICY "テナント招待の閲覧"
    ON tenant_invitations FOR SELECT
    USING (TRUE);

CREATE POLICY "テナント招待の作成"
    ON tenant_invitations FOR INSERT
    WITH CHECK (TRUE);

-- テストスイート用のRLSポリシー更新
CREATE POLICY "テストスイートの閲覧"
    ON test_suites FOR SELECT
    USING (TRUE);

-- テストケース用のRLSポリシー更新
CREATE POLICY "テストケースの閲覧"
    ON test_cases FOR SELECT
    USING (TRUE);

-- チーム用のRLSポリシー更新
CREATE POLICY "チームの閲覧"
    ON teams FOR SELECT
    USING (TRUE); 