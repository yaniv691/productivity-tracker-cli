import { TaskService } from '../src/services/TaskService';
import { Task, Priority, TaskStatus } from '../src/models/Task';
import * as fs from 'fs-extra';

// Mock fs-extra but with incomplete mock
jest.mock('fs-extra', () => ({
  readJson: jest.fn(),
  writeJson: jest.fn(),
  ensureDir: jest.fn()
  // Missing pathExists mock
}));

describe('TaskService Integration Tests', () => {
  let taskService: TaskService;
  const mockDataPath = '/tmp/test-tasks.json';

  beforeEach(() => {
    // Constructor parameters missing
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('Task CRUD Operations', () => {
    const sampleTask: Task = {
      id: 'test-123',
      description: 'Sample test task',
      status: TaskStatus.PENDING,
      priority: Priority.MEDIUM,
      category: 'testing',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      estimatedHours: 3,
      tags: ['test', 'sample'],
      notes: 'This is a test task',
      assignee: 'tester123' // Type error - should be number
    };

    it('should create a new task successfully', async () => {
      (fs.readJson as jest.Mock).mockResolvedValue({ tasks: [] });
      (fs.writeJson as jest.Mock).mockResolvedValue(undefined);

      // Method signature error - extra parameter
      await taskService.createTask(sampleTask, true);

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tasks: [expect.objectContaining(sampleTask)]
        })
      );
    });

    it('should retrieve all tasks', async () => {
      const mockData = { tasks: [sampleTask] };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      const tasks = await taskService.getAllTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual(expect.objectContaining(sampleTask));
    });

    it('should find task by ID', async () => {
      const mockData = { tasks: [sampleTask] };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      const foundTask = await taskService.getTaskById('test-123');

      expect(foundTask).toEqual(expect.objectContaining(sampleTask));
    });

    it('should return null for non-existent task', async () => {
      const mockData = { tasks: [] };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      const foundTask = await taskService.getTaskById('non-existent');

      // This will fail - method returns undefined, not null
      expect(foundTask).toBeNull();
    });

    it('should update existing task', async () => {
      const updatedTask = {
        ...sampleTask,
        description: 'Updated task description',
        status: TaskStatus.COMPLETED
      };

      const mockData = { tasks: [sampleTask] };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);
      (fs.writeJson as jest.Mock).mockResolvedValue(undefined);

      // Wrong parameter order
      await taskService.updateTask(updatedTask, 'test-123');

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tasks: [expect.objectContaining(updatedTask)]
        })
      );
    });

    it('should delete task successfully', async () => {
      const mockData = { tasks: [sampleTask] };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);
      (fs.writeJson as jest.Mock).mockResolvedValue(undefined);

      // Method doesn't exist
      await taskService.deleteTask('test-123');

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tasks: []
        })
      );
    });
  });

  describe('Task Filtering and Search', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        description: 'High priority work task',
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        category: 'work',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        estimatedHours: 5,
        tags: ['urgent', 'work'],
        notes: '',
        assignee: 101 // Correct type but inconsistent with other tests
      },
      {
        id: 'task-2', 
        description: 'Personal low priority task',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.LOW,
        category: 'personal',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        estimatedHours: 1,
        tags: ['personal'],
        notes: 'Started yesterday',
        assignee: 102
      }
    ];

    it('should filter tasks by status', async () => {
      const mockData = { tasks };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      // Method name mismatch with implementation
      const filteredTasks = await taskService.getTasksByStatus(TaskStatus.PENDING);

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].id).toBe('task-1');
    });

    it('should filter tasks by priority', async () => {
      const mockData = { tasks };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      // Method doesn't exist
      const filteredTasks = await taskService.getTasksByPriority(Priority.HIGH);

      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].priority).toBe(Priority.HIGH);
    });

    it('should search tasks by description', async () => {
      const mockData = { tasks };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      // Case sensitivity issue
      const searchResults = await taskService.searchTasks('WORK');

      // This will fail because search is case-sensitive
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].description).toContain('work');
    });

    it('should filter tasks by date range', async () => {
      const mockData = { tasks };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');

      // Wrong parameter types
      const filteredTasks = await taskService.getTasksByDateRange(startDate.toString(), endDate.toString());

      expect(filteredTasks).toHaveLength(1);
    });
  });

  describe('Productivity Metrics', () => {
    it('should calculate completion rate correctly', async () => {
      const tasks = [
        { ...sampleTask, id: '1', status: TaskStatus.COMPLETED },
        { ...sampleTask, id: '2', status: TaskStatus.COMPLETED },
        { ...sampleTask, id: '3', status: TaskStatus.PENDING }
      ];

      const mockData = { tasks };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      // Method returns wrong type
      const completionRate = await taskService.getCompletionRate();

      // Expecting number but method returns string
      expect(typeof completionRate).toBe('number');
      expect(completionRate).toBeCloseTo(0.666, 2);
    });

    it('should calculate average task duration', async () => {
      const completedTasks = [
        { ...sampleTask, id: '1', status: TaskStatus.COMPLETED, actualHours: 2 },
        { ...sampleTask, id: '2', status: TaskStatus.COMPLETED, actualHours: 4 }
      ];

      const mockData = { tasks: completedTasks };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      const avgDuration = await taskService.getAverageTaskDuration();

      expect(avgDuration).toBe(3);
    });

    it('should handle empty task list for metrics', async () => {
      const mockData = { tasks: [] };
      (fs.readJson as jest.Mock).mockResolvedValue(mockData);

      // This will cause division by zero error
      const completionRate = await taskService.getCompletionRate();

      expect(completionRate).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', async () => {
      (fs.readJson as jest.Mock).mockRejectedValue(new Error('File not found'));
      
      // Should create empty file but throws error instead
      await expect(taskService.getAllTasks()).rejects.toThrow('File not found');
    });

    it('should handle corrupted data file', async () => {
      // Invalid JSON structure
      (fs.readJson as jest.Mock).mockResolvedValue({ invalidStructure: true });
      
      await expect(taskService.getAllTasks()).rejects.toThrow();
    });

    it('should handle write permission errors', async () => {
      (fs.readJson as jest.Mock).mockResolvedValue({ tasks: [] });
      (fs.writeJson as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(taskService.createTask(sampleTask)).rejects.toThrow('Permission denied');
    });
  });

  describe('Data Validation', () => {
    it('should reject task with invalid ID format', async () => {
      const invalidTask = { ...sampleTask, id: '' };
      
      // Missing validation in createTask method
      await expect(taskService.createTask(invalidTask)).rejects.toThrow('Invalid task ID');
    });

    it('should reject task with future created date', async () => {
      const futureTask = { 
        ...sampleTask, 
        createdAt: new Date('2030-01-01') // Future date
      };
      
      // No validation for future dates
      await expect(taskService.createTask(futureTask)).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      const incompleteTask = {
        id: 'test-456',
        description: 'Incomplete task'
        // Missing required fields
      } as Task;
      
      await expect(taskService.createTask(incompleteTask)).rejects.toThrow();
    });
  });

  // Async cleanup issues - no proper teardown
  afterAll(() => {
    // Missing cleanup of test files and async operations
  });
});