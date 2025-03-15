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
            }
            test_suites: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    parent_id: string | null
                    created_by: string
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
                    created_by: string
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
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                    version?: string
                    status?: string
                }
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
                    created_by: string
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
                    created_by: string
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
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                    version?: string
                }
            }
            execution_history: {
                Row: {
                    id: string
                    test_case_id: string
                    result: string
                    executed_at: string
                    executed_by: string
                    notes: string | null
                    environment: string | null
                    attachments: string[] | null
                }
                Insert: {
                    id?: string
                    test_case_id: string
                    result: string
                    executed_at?: string
                    executed_by: string
                    notes?: string | null
                    environment?: string | null
                    attachments?: string[] | null
                }
                Update: {
                    id?: string
                    test_case_id?: string
                    result?: string
                    executed_at?: string
                    executed_by?: string
                    notes?: string | null
                    environment?: string | null
                    attachments?: string[] | null
                }
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
    }
} 