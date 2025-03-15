import { supabase } from '@/utils/supabase/client'
import { CreateTestSuiteInput, TestSuite, UpdateTestSuiteInput } from '@/lib/types/test-suite'

export async function getTestSuites() {
    const { data, error } = await supabase
        .from('test_suites')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as TestSuite[]
}

export async function getTestSuiteById(id: string) {
    const { data, error } = await supabase
        .from('test_suites')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as TestSuite
}

export async function createTestSuite(input: CreateTestSuiteInput) {
    const { data, error } = await supabase
        .from('test_suites')
        .insert([
            {
                ...input,
                version: input.version || '1.0',
                status: input.status || 'draft'
            }
        ])
        .select()
        .single()

    if (error) throw error
    return data as TestSuite
}

export async function updateTestSuite({ id, ...input }: UpdateTestSuiteInput) {
    const { data, error } = await supabase
        .from('test_suites')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as TestSuite
}

export async function deleteTestSuite(id: string) {
    const { error } = await supabase
        .from('test_suites')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function getTestSuiteHierarchy() {
    const { data, error } = await supabase
        .from('test_suites')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) throw error
    return buildHierarchy(data as TestSuite[])
}

function buildHierarchy(suites: TestSuite[]) {
    const suiteMap = new Map<string, TestSuite & { children: (TestSuite & { children: any[] })[] }>()
    const rootSuites: (TestSuite & { children: any[] })[] = []

    // 全てのスイートをマップに追加
    suites.forEach(suite => {
        suiteMap.set(suite.id, { ...suite, children: [] })
    })

    // 親子関係を構築
    suites.forEach(suite => {
        const suiteWithChildren = suiteMap.get(suite.id)!
        if (suite.parent_id) {
            const parent = suiteMap.get(suite.parent_id)
            if (parent) {
                parent.children.push(suiteWithChildren)
            }
        } else {
            rootSuites.push(suiteWithChildren)
        }
    })

    return rootSuites
} 