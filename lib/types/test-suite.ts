import { TestCase } from './test-case'

export type TestSuite = {
    id: number
    name: string
    description: string
    parent_id: number | null
    created_by: string
    created_at: string
    updated_at: string
    version: string
    status: 'active' | 'archived' | 'draft'
    test_cases?: TestCase[]
    children: TestSuite[]
}

export type CreateTestSuiteInput = {
    name: string
    description?: string
    parent_id?: number
    version?: string
    status?: 'active' | 'archived' | 'draft'
}

export type UpdateTestSuiteInput = Partial<CreateTestSuiteInput> & {
    id: number
} 