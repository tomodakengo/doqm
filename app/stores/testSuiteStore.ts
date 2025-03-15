import { create } from 'zustand';

export interface TestCase {
    id: number;
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'pending' | 'skipped';
    steps: string[];
    expectedResults: string;
    lastExecuted?: string;
    executionHistory?: {
        date: string;
        status: 'completed' | 'failed' | 'pending' | 'skipped';
        comment: string;
    }[];
}

export interface TestSuiteChild {
    id: number;
    name: string;
    description: string;
    testCases: number;
}

export interface TestSuite {
    id: number;
    name: string;
    description: string;
    children: TestSuiteChild[];
    testCases?: TestCase[];
}

interface TestSuiteStore {
    testSuites: TestSuite[];
    selectedSuiteId: number | null;
    isCreateModalOpen: boolean;
    // アクション
    setTestSuites: (suites: TestSuite[]) => void;
    addTestSuite: (suite: Omit<TestSuite, 'id'>) => void;
    updateTestSuite: (id: number, suite: Partial<TestSuite>) => void;
    deleteTestSuite: (id: number) => void;
    selectSuite: (id: number) => void;
    setCreateModalOpen: (isOpen: boolean) => void;
    // テストケース関連
    addTestCase: (suiteId: number, testCase: Omit<TestCase, 'id'>) => void;
    updateTestCase: (suiteId: number, testCaseId: number, updates: Partial<TestCase>) => void;
    deleteTestCase: (suiteId: number, testCaseId: number) => void;
    executeTestCase: (
        suiteId: number,
        testCaseId: number,
        result: { status: 'completed' | 'failed'; comment: string }
    ) => void;
}

const useTestSuiteStore = create<TestSuiteStore>((set) => ({
    testSuites: [],
    selectedSuiteId: null,
    isCreateModalOpen: false,

    setTestSuites: (suites) => set({ testSuites: suites }),

    addTestSuite: (suite) =>
        set((state) => ({
            testSuites: [
                ...state.testSuites,
                {
                    ...suite,
                    id: Math.max(0, ...state.testSuites.map((s) => s.id)) + 1,
                    children: [],
                },
            ],
        })),

    updateTestSuite: (id, updatedSuite) =>
        set((state) => ({
            testSuites: state.testSuites.map((suite) =>
                suite.id === id ? { ...suite, ...updatedSuite } : suite
            ),
        })),

    deleteTestSuite: (id) =>
        set((state) => ({
            testSuites: state.testSuites.filter((suite) => suite.id !== id),
            selectedSuiteId: state.selectedSuiteId === id ? null : state.selectedSuiteId,
        })),

    selectSuite: (id) => set({ selectedSuiteId: id }),

    setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

    addTestCase: (suiteId, testCase) =>
        set((state) => ({
            testSuites: state.testSuites.map((suite) => {
                if (suite.id === suiteId) {
                    const newTestCase = {
                        ...testCase,
                        id: Math.max(0, ...(suite.testCases?.map((tc) => tc.id) || [-1])) + 1,
                        status: 'not_started' as const,
                    };
                    return {
                        ...suite,
                        testCases: [...(suite.testCases || []), newTestCase],
                    };
                }
                return suite;
            }),
        })),

    updateTestCase: (suiteId, testCaseId, updates) =>
        set((state) => ({
            testSuites: state.testSuites.map((suite) => {
                if (suite.id === suiteId) {
                    return {
                        ...suite,
                        testCases: suite.testCases?.map((tc) =>
                            tc.id === testCaseId ? { ...tc, ...updates } : tc
                        ),
                    };
                }
                return suite;
            }),
        })),

    deleteTestCase: (suiteId, testCaseId) =>
        set((state) => ({
            testSuites: state.testSuites.map((suite) => {
                if (suite.id === suiteId) {
                    return {
                        ...suite,
                        testCases: suite.testCases?.filter((tc) => tc.id !== testCaseId),
                    };
                }
                return suite;
            }),
        })),

    executeTestCase: (suiteId, testCaseId, result) =>
        set((state) => ({
            testSuites: state.testSuites.map((suite) => {
                if (suite.id === suiteId) {
                    return {
                        ...suite,
                        testCases: suite.testCases?.map((tc) => {
                            if (tc.id === testCaseId) {
                                const now = new Date().toISOString();
                                return {
                                    ...tc,
                                    status: result.status,
                                    lastExecuted: now,
                                    executionHistory: [
                                        ...(tc.executionHistory || []),
                                        {
                                            date: now,
                                            status: result.status,
                                            comment: result.comment,
                                        },
                                    ],
                                };
                            }
                            return tc;
                        }),
                    };
                }
                return suite;
            }),
        })),
}));

export default useTestSuiteStore; 