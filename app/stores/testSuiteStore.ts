import { create } from 'zustand';

export interface TestCase {
    id: number;
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    lastExecuted?: string;
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
    selectSuite: (id: number | null) => void;
    setCreateModalOpen: (isOpen: boolean) => void;
    // テストケース関連
    addTestCase: (suiteId: number, testCase: Omit<TestCase, 'id'>) => void;
    updateTestCase: (suiteId: number, testCaseId: number, testCase: Partial<TestCase>) => void;
    deleteTestCase: (suiteId: number, testCaseId: number) => void;
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
                        id: Math.max(0, ...(suite.testCases?.map((tc) => tc.id) || [0])) + 1,
                    };
                    return {
                        ...suite,
                        testCases: [...(suite.testCases || []), newTestCase],
                    };
                }
                return suite;
            }),
        })),

    updateTestCase: (suiteId, testCaseId, updatedTestCase) =>
        set((state) => ({
            testSuites: state.testSuites.map((suite) => {
                if (suite.id === suiteId && suite.testCases) {
                    return {
                        ...suite,
                        testCases: suite.testCases.map((tc) =>
                            tc.id === testCaseId ? { ...tc, ...updatedTestCase } : tc
                        ),
                    };
                }
                return suite;
            }),
        })),

    deleteTestCase: (suiteId, testCaseId) =>
        set((state) => ({
            testSuites: state.testSuites.map((suite) => {
                if (suite.id === suiteId && suite.testCases) {
                    return {
                        ...suite,
                        testCases: suite.testCases.filter((tc) => tc.id !== testCaseId),
                    };
                }
                return suite;
            }),
        })),
}));

export default useTestSuiteStore; 