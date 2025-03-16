-- テナントテーブル
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    plan TEXT DEFAULT 'basic', -- 基本、スタンダード、プロなど
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- テナントユーザーの関連付け
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user', 'guest')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- テナントへの招待管理
CREATE TABLE tenant_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user', 'guest')),
    token TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted BOOLEAN DEFAULT FALSE
);

-- テストスイートとテナントの関連付け
ALTER TABLE test_suites ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- テストケースとテナントの関連付け（オプション - スイートから継承可能）
ALTER TABLE test_cases ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- チームとテナントの関連付け
ALTER TABLE teams ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- RLSポリシーの設定
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;

-- テナントのポリシー
CREATE POLICY "テナントの閲覧は所属ユーザーのみ"
    ON tenants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_id = tenants.id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "テナントの作成は認証ユーザーのみ"
    ON tenants FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "テナントの更新は管理者のみ"
    ON tenants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_id = tenants.id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- テナントユーザーのポリシー
CREATE POLICY "テナントユーザーの閲覧は同テナントユーザーのみ"
    ON tenant_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenant_users AS tu
            WHERE tu.tenant_id = tenant_users.tenant_id
            AND tu.user_id = auth.uid()
        )
    );

CREATE POLICY "テナントユーザーの追加は管理者のみ"
    ON tenant_users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_id = tenant_users.tenant_id
            AND user_id = auth.uid()
            AND role IN ('admin')
        )
        OR
        -- テナント作成者は最初のユーザーとして自動追加可能
        (
            NOT EXISTS (
                SELECT 1 FROM tenant_users
                WHERE tenant_id = tenant_users.tenant_id
            )
            AND 
            EXISTS (
                SELECT 1 FROM tenants
                WHERE id = tenant_users.tenant_id
                AND tenant_users.user_id = auth.uid()
            )
        )
    );

-- テナント招待のポリシー
CREATE POLICY "テナント招待の閲覧は管理者のみ"
    ON tenant_invitations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_id = tenant_invitations.tenant_id
            AND user_id = auth.uid()
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "テナント招待の作成は管理者のみ"
    ON tenant_invitations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_id = tenant_invitations.tenant_id
            AND user_id = auth.uid()
            AND role IN ('admin', 'manager')
        )
    );

-- テストスイート用のRLSポリシー更新
DROP POLICY IF EXISTS "テストスイートの閲覧は認証ユーザーのみ" ON test_suites;
CREATE POLICY "テストスイートの閲覧はテナントユーザーのみ"
    ON test_suites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_id = test_suites.tenant_id
            AND user_id = auth.uid()
        )
    );

-- テストケース用のRLSポリシー更新
DROP POLICY IF EXISTS "テストケースの閲覧は認証ユーザーのみ" ON test_cases;
CREATE POLICY "テストケースの閲覧はテナントユーザーのみ"
    ON test_cases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_id = test_cases.tenant_id
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM test_suites
            JOIN tenant_users ON tenant_users.tenant_id = test_suites.tenant_id
            WHERE test_suites.id = test_cases.suite_id
            AND tenant_users.user_id = auth.uid()
        )
    );

-- チーム用のRLSポリシー更新
DROP POLICY IF EXISTS "チームの閲覧は認証ユーザーのみ" ON teams;
CREATE POLICY "チームの閲覧はテナントユーザーのみ"
    ON teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenant_users
            WHERE tenant_id = teams.tenant_id
            AND user_id = auth.uid()
        )
    ); 