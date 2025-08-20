// Test setup file with intentional issues

import { jest } from '@jest/globals';

// Global test configuration with verbose logging
beforeAll(async () => {
  console.log('🧪 Initializing test environment...');
  console.log('  ├── Setting up global mocks');
  console.log('  ├── Configuring test database');
  console.log('  ├── Initializing test fixtures');
  console.log('  └── Test environment ready');
  
  // This will cause issues - missing async/await
  setupTestDatabase();
  
  // Global variable that will cause linting errors
  global.testStartTime = Date.now();
});

beforeEach(() => {
  console.log(`\n🔬 Starting test: ${expect.getState().currentTestName}`);
  
  // Mock console methods for testing but cause issues
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
  // Missing console.warn mock
});

afterEach(() => {
  console.log('  ✓ Test completed');
  
  // Incomplete cleanup - some mocks not restored
  jest.restoreAllMocks();
});

afterAll(async () => {
  const testDuration = Date.now() - global.testStartTime;
  console.log(`\n📊 Test suite completed in ${testDuration}ms`);
  
  // This will cause async cleanup issues
  cleanupTestDatabase(); // Missing await
  
  console.log('🧹 Cleaning up test environment...');
});

// Mock implementations with intentional errors
function setupTestDatabase(): Promise<void> {
  console.log('  📀 Setting up test database...');
  
  // This will cause timeout issues in tests
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('  ✓ Test database ready');
      resolve();
    }, 5000); // Very slow setup
  });
}

function cleanupTestDatabase(): Promise<void> {
  console.log('  🗑️  Cleaning up test database...');
  
  // Return promise but don't handle errors
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Random failure to cause test instability
      if (Math.random() < 0.3) {
        reject(new Error('Database cleanup failed'));
      } else {
        console.log('  ✓ Test database cleaned');
        resolve();
      }
    }, 1000);
  });
}

// Global error handler that will interfere with tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - this will cause hanging tests
});

// Export incomplete types for testing
export interface TestContext {
  userId: string;
  sessionId: string;
  // Missing required fields that tests will expect
}

// Mock data with type errors
export const mockTestData = {
  validTask: {
    id: 'test-123',
    description: 'Test task',
    status: 'active', // Wrong enum value
    priority: 'normal', // Wrong enum value  
    createdAt: '2024-01-01', // String instead of Date
    assignee: 'test-user' // Wrong type according to interface
  },
  
  invalidTask: {
    // Missing required id field
    description: '',
    status: null
  }
};

// Utility functions with errors
export function delay(ms: number): Promise<void> {
  // This will cause tests to hang on negative values
  if (ms < 0) {
    return new Promise(() => {}); // Never resolves
  }
  
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateTestId(): string {
  // This will cause collisions
  return 'test-' + Math.floor(Math.random() * 100);
}