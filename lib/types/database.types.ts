export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            execution_history: {
                Row: {
                    id: string
                    test_case_id: string
                    result: string
                    executed_at: string
                    executed_by: string | null
                    notes: string | null
                    environment: string | null
                    attachments: string[] | null
                }
                Insert: {
                    id?: string
                    test_case_id: string
                    result: string
                    executed_at?: string
                    executed_by?: string | null
                    notes?: string | null
                    environment?: string | null
                    attachments?: string[] | null
                }
                Update: {
                    id?: string
                    test_case_id?: string
                    result?: string
                    executed_at?: string
                    executed_by?: string | null
                    notes?: string | null
                    environment?: string | null
                    attachments?: string[] | null
                }
                Relationships: [
                    {
                        foreignKeyName: "execution_history_executed_by_fkey"
                        columns: ["executed_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "execution_history_test_case_id_fkey"
                        columns: ["test_case_id"]
                        isOneToOne: false
                        referencedRelation: "test_cases"
                        referencedColumns: ["id"]
                    }
                ]
            }
            team_members: {
                Row: {
                    id: string
                    team_id: string
                    user_id: string
                    role: string
                    joined_at: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    user_id: string
                    role: string
                    joined_at?: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    user_id?: string
                    role?: string
                    joined_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "team_members_team_id_fkey"
                        columns: ["team_id"]
                        isOneToOne: false
                        referencedRelation: "teams"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "team_members_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            team_test_suites: {
                Row: {
                    id: string
                    team_id: string
                    test_suite_id: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    test_suite_id: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    test_suite_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "team_test_suites_team_id_fkey"
                        columns: ["team_id"]
                        isOneToOne: false
                        referencedRelation: "teams"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "team_test_suites_test_suite_id_fkey"
                        columns: ["test_suite_id"]
                        isOneToOne: false
                        referencedRelation: "test_suites"
                        referencedColumns: ["id"]
                    }
                ]
            }
            teams: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "teams_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            test_case_versions: {
                Row: {
                    id: string
                    test_case_id: string
                    version: string
                    title: string
                    description: string | null
                    preconditions: string | null
                    steps: string[] | null
                    expected_result: string | null
                    priority: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    test_case_id: string
                    version: string
                    title: string
                    description?: string | null
                    preconditions?: string | null
                    steps?: string[] | null
                    expected_result?: string | null
                    priority?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    test_case_id?: string
                    version?: string
                    title?: string
                    description?: string | null
                    preconditions?: string | null
                    steps?: string[] | null
                    expected_result?: string | null
                    priority?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "test_case_versions_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "test_case_versions_test_case_id_fkey"
                        columns: ["test_case_id"]
                        isOneToOne: false
                        referencedRelation: "test_cases"
                        referencedColumns: ["id"]
                    }
                ]
            }
            test_cases: {
                Row: {
                    id: string
                    suite_id: string
                    title: string
                    description: string | null
                    preconditions: string | null
                    steps: string[] | null
                    expected_result: string | null
                    priority: string
                    status: string
                    created_by: string | null
                    created_at: string
                    updated_at: string
                    version: string
                }
                Insert: {
                    id?: string
                    suite_id: string
                    title: string
                    description?: string | null
                    preconditions?: string | null
                    steps?: string[] | null
                    expected_result?: string | null
                    priority?: string
                    status?: string
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    version?: string
                }
                Update: {
                    id?: string
                    suite_id?: string
                    title?: string
                    description?: string | null
                    preconditions?: string | null
                    steps?: string[] | null
                    expected_result?: string | null
                    priority?: string
                    status?: string
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    version?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "test_cases_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "test_cases_suite_id_fkey"
                        columns: ["suite_id"]
                        isOneToOne: false
                        referencedRelation: "test_suites"
                        referencedColumns: ["id"]
                    }
                ]
            }
            test_suites: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    parent_id: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                    version: string
                    status: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    parent_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    version?: string
                    status?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    parent_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    version?: string
                    status?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "test_suites_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "test_suites_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "test_suites"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
} 