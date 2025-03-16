-- チームテーブル
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- チームメンバーテーブル（ユーザーとチームの関連付け）
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(team_id, user_id)
);

-- テストスイートとチームの関連付けテーブル
CREATE TABLE team_test_suites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    test_suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    UNIQUE(team_id, test_suite_id)
);

-- テストケースのバージョン履歴テーブル
CREATE TABLE test_case_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    preconditions TEXT,
    steps TEXT[],
    expected_result TEXT,
    priority TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLSポリシーの設定
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_case_versions ENABLE ROW LEVEL SECURITY;

-- チームのポリシー
CREATE POLICY "チームの閲覧は認証ユーザーのみ"
    ON teams FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "チームの作成は認証ユーザーのみ"
    ON teams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "チームの更新は作成者のみ"
    ON teams FOR UPDATE
    USING (auth.uid() = created_by);

-- チームメンバーのポリシー
CREATE POLICY "チームメンバーの閲覧は認証ユーザーのみ"
    ON team_members FOR SELECT
    USING (auth.role() = 'authenticated');

-- 修正：NEWの参照問題を解決
CREATE POLICY "チームメンバーの追加はチーム管理者のみ"
    ON team_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = team_members.team_id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
        OR 
        -- チーム作成者は最初のメンバーとして自動追加できるようにする
        (
            NOT EXISTS (
                SELECT 1 FROM team_members
                WHERE team_id = team_members.team_id
            )
            AND 
            EXISTS (
                SELECT 1 FROM teams
                WHERE id = team_members.team_id
                AND created_by = auth.uid()
            )
        )
    );

-- チームテストスイートのポリシー
CREATE POLICY "チームテストスイートの閲覧はチームメンバーのみ"
    ON team_test_suites FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id = team_test_suites.team_id
        AND user_id = auth.uid()
    ));

-- テストケースバージョンのポリシー
CREATE POLICY "テストケースバージョンの閲覧は認証ユーザーのみ"
    ON test_case_versions FOR SELECT
    USING (auth.role() = 'authenticated');