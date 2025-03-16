-- 拡張機能の有効化
create extension if not exists "uuid-ossp";

-- ユーザープロフィールテーブル
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    full_name text,
    avatar_url text,
    updated_at timestamp with time zone,
    constraint username_length check (char_length(username) >= 3)
);

-- テストスイートテーブル
create table test_suites (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    parent_id uuid references test_suites(id),
    created_by uuid references auth.users(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    version text default '1.0',
    status text default 'active'
);

-- テストケーステーブル
create table test_cases (
    id uuid primary key default uuid_generate_v4(),
    suite_id uuid references test_suites(id) on delete cascade,
    title text not null,
    description text,
    preconditions text,
    steps text[],
    expected_result text,
    priority text default 'medium',
    status text default 'draft',
    created_by uuid references auth.users(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    version text default '1.0'
);

-- 実行履歴テーブル
create table execution_history (
    id uuid primary key default uuid_generate_v4(),
    test_case_id uuid references test_cases(id) on delete cascade,
    result text not null,
    executed_at timestamp with time zone default now(),
    executed_by uuid references auth.users(id),
    notes text,
    environment text,
    attachments text[]
);

-- RLSポリシーの設定
alter table profiles enable row level security;
alter table test_suites enable row level security;
alter table test_cases enable row level security;
alter table execution_history enable row level security;

-- プロフィールのポリシー
create policy "Public profiles are viewable by everyone."
    on profiles for select
    using ( true );

create policy "Users can insert their own profile."
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update own profile."
    on profiles for update
    using ( auth.uid() = id );

-- テストスイートのポリシー
create policy "テストスイートの閲覧は認証ユーザーのみ"
    on test_suites for select
    using ( auth.role() = 'authenticated' );

create policy "テストスイートの作成は認証ユーザーのみ"
    on test_suites for insert
    with check ( auth.role() = 'authenticated' );

create policy "テストスイートの更新は作成者のみ"
    on test_suites for update
    using ( auth.uid() = created_by );

-- テストケースのポリシー
create policy "テストケースの閲覧は認証ユーザーのみ"
    on test_cases for select
    using ( auth.role() = 'authenticated' );

create policy "テストケースの作成は認証ユーザーのみ"
    on test_cases for insert
    with check ( auth.role() = 'authenticated' );

create policy "テストケースの更新は作成者のみ"
    on test_cases for update
    using ( auth.uid() = created_by );

-- 実行履歴のポリシー
create policy "実行履歴の閲覧は認証ユーザーのみ"
    on execution_history for select
    using ( auth.role() = 'authenticated' );

create policy "実行履歴の作成は認証ユーザーのみ"
    on execution_history for insert
    with check ( auth.role() = 'authenticated' );