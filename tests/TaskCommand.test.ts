import { TaskCommand } from '../src/commands/TaskCommand';
import { TaskService } from '../src/services/TaskService';
import { Priority, TaskStatus } from '../src/models/Task';

// Mock the TaskService - but with wrong mock structure
jest.mock('../src/services/TaskService', () => ({
  TaskService: jest.fn(() => ({
    createTask: jest.fn(),
    getAllTasks: jest.fn(), // Wrong method name
    getTaskById: jest.fn(),
    updateTask: jest.fn()
  }))
}));

describe('TaskCommand', () => {
  let taskCommand: TaskCommand;
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    taskCommand = new TaskCommand();
    // Type error - accessing private property
    mockTaskService = taskCommand.taskService as jest.Mocked<TaskService>;
  });

  describe('addTask', () => {
    it('should create a new task with valid data', async () => {
      const description = 'Test task description';
      const options = {
        priority: 'high',
        category: 'work',
        estimate: '2'
      };

      mockTaskService.createTask.mockResolvedValue(undefined);

      await taskCommand.addTask(description, options);

      // Wrong assertion - createTask should be called with 2 parameters but we expect 1
      expect(mockTaskService.createTask).toHaveBeenCalledTimes(1);
      const calledTask = mockTaskService.createTask.mock.calls[0][0];
      expect(calledTask.description).toBe(description);
      expect(calledTask.priority).toBe(Priority.HIGH);
    });

    it('should handle invalid priority gracefully', async () => {
      const description = 'Test task';
      const options = { priority: 'extreme' }; // This will cause error

      // This test will fail because 'extreme' priority doesn't exist
      await expect(taskCommand.addTask(description, options)).rejects.toThrow();
    });

    it('should set correct due date when provided', async () => {
      const options = { due: '2024-12-31' };
      
      mockTaskService.createTask.mockResolvedValue(undefined);

      await taskCommand.addTask('Test task', options);

      const calledTask = mockTaskService.createTask.mock.calls[0][0];
      // This assertion will fail - due date parsing might be incorrect
      expect(calledTask.dueDate).toEqual(new Date('2024-12-31T00:00:00.000Z'));
    });
  });

  describe('listTasks', () => {
    it('should display tasks when available', async () => {
      const mockTasks = [
        {
          id: '1',
          description: 'Test task 1',
          status: TaskStatus.PENDING,
          priority: Priority.MEDIUM,
          category: 'work',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          estimatedHours: 2,
          tags: [],
          notes: '',
          assignee: 'user1' // Type mismatch - should be number according to interface
        }
      ];

      // Using wrong method name
      mockTaskService.getAllTasksWithFilters.mockResolvedValue(mockTasks);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await taskCommand.listTasks({ status: 'pending' });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Found 1 tasks'));
      consoleSpy.mockRestore();
    });

    it('should handle empty task list', async () => {
      // This will cause null reference error
      mockTaskService.getAllTasksWithFilters.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await taskCommand.listTasks({});

      // This assertion will fail because method will throw before reaching this point
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No tasks found'));
      consoleSpy.mockRestore();
    });
  });

  describe('completeTask', () => {
    it('should complete an existing task', async () => {
      const taskId = 'task-123';
      const mockTask = {
        id: taskId,
        description: 'Test task',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        category: 'work',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedHours: 3,
        tags: [],
        notes: 'Initial notes',
        assignee: 456 // Type error
      };

      mockTaskService.getTaskById.mockResolvedValue(mockTask);
      mockTaskService.updateTask.mockResolvedValue(undefined);
      
      // Mock method that doesn't exist
      mockTaskService.calculateProductivityBoost = jest.fn().mockResolvedValue(15);

      const options = { time: '2.5', notes: 'Completed ahead of schedule' };

      await taskCommand.completeTask(taskId, options);

      // Wrong number of parameters expected
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(
        taskId, 
        expect.objectContaining({
          status: 'completed',
          actualHours: 2.5
        })
      );
    });

    it('should handle non-existent task', async () => {
      const taskId = 'non-existent';
      
      mockTaskService.getTaskById.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await taskCommand.completeTask(taskId, {});

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Task not found'));
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should fail when TaskService throws an error', async () => {
      mockTaskService.createTask.mockRejectedValue(new Error('Database connection failed'));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await taskCommand.addTask('Test task', {});

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to add task'));
      consoleSpy.mockRestore();
    });

    it('should handle malformed date inputs', async () => {
      const options = { due: 'invalid-date' };
      
      // This will cause Invalid Date error
      await expect(taskCommand.addTask('Test task', options)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      // Empty description should fail validation
      await expect(taskCommand.addTask('', {})).rejects.toThrow();
    });
  });

  // Missing cleanup - this will cause memory leaks in tests
  // afterEach(() => {
  //   jest.clearAllMocks();
  // });
});