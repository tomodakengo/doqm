export type TestCase = {
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

export type CreateTestCaseInput = {
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    steps: string[];
    expectedResults: string;
}

export type UpdateTestCaseInput = Partial<CreateTestCaseInput> & {
    id: number;
} 