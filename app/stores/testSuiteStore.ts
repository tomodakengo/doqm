import { create } from "zustand";

export interface TestCase {
	id: number;
	name: string;
	description: string;
	priority: "high" | "medium" | "low";
	status:
		| "not_started"
		| "in_progress"
		| "completed"
		| "failed"
		| "pending"
		| "skipped";
	steps: string[];
	expectedResults: string;
	lastExecuted?: string;
	executionHistory?: {
		date: string;
		status: "completed" | "failed" | "pending" | "skipped";
		comment: string;
	}[];
}

export interface TestSuiteChild {
	id: number;
	name: string;
	description: string;
	testCases?: TestCase[];
	parentId: number;
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
	selectedChildId: number | null;
	isCreateModalOpen: boolean;
	// アクション
	setTestSuites: (suites: TestSuite[]) => void;
	addTestSuite: (suite: {
		name: string;
		description: string;
		parentId?: number;
	}) => void;
	updateTestSuite: (id: number, suite: Partial<TestSuite>) => void;
	deleteTestSuite: (id: number) => void;
	selectSuite: (id: number, childId?: number) => void;
	setCreateModalOpen: (isOpen: boolean) => void;
	// テストケース関連
	addTestCase: (
		suiteId: number,
		childId: number | null,
		testCase: Omit<
			TestCase,
			"id" | "status" | "lastExecuted" | "executionHistory"
		>,
	) => void;
	updateTestCase: (
		suiteId: number,
		childId: number | null,
		testCaseId: number,
		updates: Partial<TestCase>,
	) => void;
	deleteTestCase: (
		suiteId: number,
		childId: number | null,
		testCaseId: number,
	) => void;
	executeTestCase: (
		suiteId: number,
		childId: number | null,
		testCaseId: number,
		result: {
			status: "completed" | "failed" | "pending" | "skipped";
			comment: string;
		},
	) => void;
}

const useTestSuiteStore = create<TestSuiteStore>((set) => ({
	testSuites: [],
	selectedSuiteId: null,
	selectedChildId: null,
	isCreateModalOpen: false,

	setTestSuites: (suites) => set({ testSuites: suites }),

	addTestSuite: (suite) =>
		set((state) => {
			if (suite.parentId) {
				// 親スイートの子として追加
				return {
					testSuites: state.testSuites.map((existingSuite) => {
						if (existingSuite.id === suite.parentId) {
							const newChild: TestSuiteChild = {
								id:
									Math.max(
										0,
										...existingSuite.children.map((c) => c.id),
										...state.testSuites.flatMap((s) =>
											s.children.map((c) => c.id),
										),
									) + 1,
								name: suite.name,
								description: suite.description,
								testCases: [],
								parentId: existingSuite.id,
							};
							return {
								...existingSuite,
								children: [...existingSuite.children, newChild],
							};
						}
						return existingSuite;
					}),
				};
			}

			// 新しい親スイートとして追加
			const newSuite: TestSuite = {
				id: Math.max(0, ...state.testSuites.map((s) => s.id)) + 1,
				name: suite.name,
				description: suite.description,
				children: [],
				testCases: [],
			};
			return {
				testSuites: [...state.testSuites, newSuite],
			};
		}),

	updateTestSuite: (id, updatedSuite) =>
		set((state) => ({
			testSuites: state.testSuites.map((suite) =>
				suite.id === id ? { ...suite, ...updatedSuite } : suite,
			),
		})),

	deleteTestSuite: (id) =>
		set((state) => ({
			testSuites: state.testSuites.filter((suite) => suite.id !== id),
			selectedSuiteId:
				state.selectedSuiteId === id ? null : state.selectedSuiteId,
		})),

	selectSuite: (id, childId) =>
		set({ selectedSuiteId: id, selectedChildId: childId || null }),

	setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

	addTestCase: (suiteId, childId, testCase) =>
		set((state) => ({
			testSuites: state.testSuites.map((suite) => {
				if (suite.id === suiteId) {
					if (childId) {
						return {
							...suite,
							children: suite.children.map((child) => {
								if (child.id === childId) {
									const newTestCase = {
										...testCase,
										id:
											Math.max(
												0,
												...(child.testCases?.map((tc) => tc.id) || [-1]),
											) + 1,
										status: "not_started" as const,
									};
									return {
										...child,
										testCases: [...(child.testCases || []), newTestCase],
									};
								}
								return child;
							}),
						};
					}
					const newTestCase = {
						...testCase,
						id:
							Math.max(0, ...(suite.testCases?.map((tc) => tc.id) || [-1])) + 1,
						status: "not_started" as const,
					};
					return {
						...suite,
						testCases: [...(suite.testCases || []), newTestCase],
					};
				}
				return suite;
			}),
		})),

	updateTestCase: (suiteId, childId, testCaseId, updates) =>
		set((state) => ({
			testSuites: state.testSuites.map((suite) => {
				if (suite.id === suiteId) {
					if (childId) {
						return {
							...suite,
							children: suite.children.map((child) => {
								if (child.id === childId) {
									return {
										...child,
										testCases: child.testCases?.map((tc) =>
											tc.id === testCaseId ? { ...tc, ...updates } : tc,
										),
									};
								}
								return child;
							}),
						};
					}
					return {
						...suite,
						testCases: suite.testCases?.map((tc) =>
							tc.id === testCaseId ? { ...tc, ...updates } : tc,
						),
					};
				}
				return suite;
			}),
		})),

	deleteTestCase: (suiteId, childId, testCaseId) =>
		set((state) => ({
			testSuites: state.testSuites.map((suite) => {
				if (suite.id === suiteId) {
					if (childId) {
						return {
							...suite,
							children: suite.children.map((child) => {
								if (child.id === childId) {
									return {
										...child,
										testCases: child.testCases?.filter(
											(tc) => tc.id !== testCaseId,
										),
									};
								}
								return child;
							}),
						};
					}
					return {
						...suite,
						testCases: suite.testCases?.filter((tc) => tc.id !== testCaseId),
					};
				}
				return suite;
			}),
		})),

	executeTestCase: (suiteId, childId, testCaseId, result) =>
		set((state) => ({
			testSuites: state.testSuites.map((suite) => {
				if (suite.id === suiteId) {
					if (childId) {
						return {
							...suite,
							children: suite.children.map((child) => {
								if (child.id === childId) {
									return {
										...child,
										testCases: child.testCases?.map((tc) => {
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
								return child;
							}),
						};
					}
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
