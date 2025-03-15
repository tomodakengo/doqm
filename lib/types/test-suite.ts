export type TestSuite = {
    id: string
    name: string
    description: string | null
    parent_id: string | null
    created_by: string
    created_at: string
    updated_at: string
    version: string
    status: 'active' | 'archived' | 'draft'
}

export type CreateTestSuiteInput = {
    name: string
    description?: string
    parent_id?: string
    version?: string
    status?: 'active' | 'archived' | 'draft'
}

export type UpdateTestSuiteInput = Partial<CreateTestSuiteInput> & {
    id: string
} 