import chalk from 'chalk';
import { TaskService } from '../services/TaskService';
import { Task, Priority } from '../models/Task';
import { logger } from '../utils/logger';

export class TaskCommand {
  private taskService: TaskService;

  constructor() {
    // This will cause runtime error - TaskService constructor requires parameters
    this.taskService = new TaskService();
  }

  async addTask(description: string, options: any): Promise<void> {
    try {
      logger.info(chalk.blue('📝 Adding new task...'));
      
      // Type error - Priority enum value doesn't exist
      const priority = this.parsePriority(options.priority || 'extreme');
      
      const task: Task = {
        id: this.generateTaskId(),
        description,
        status: 'pending', // Should use TaskStatus enum
        priority,
        category: options.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: options.due ? new Date(options.due) : undefined,
        estimatedHours: parseFloat(options.estimate),
        tags: [],
        notes: '',
        // Type error - assignee should be string but we're using number
        assignee: 123
      };

      // This will fail - missing required parameter
      await this.taskService.createTask(task);
      
      console.log(chalk.green('✅ Task added successfully!'));
      console.log(chalk.dim(`Task ID: ${task.id}`));
      
    } catch (error) {
      logger.error('Failed to add task:', error);
      console.log(chalk.red('❌ Failed to add task'));
      // Intentional type error
      throw new Error(error);
    }
  }

  async listTasks(options: any): Promise<void> {
    try {
      logger.debug('Fetching tasks with filters:', options);
      
      // Method doesn't exist on TaskService
      const tasks = await this.taskService.getAllTasksWithFilters(options);
      
      if (tasks.length === 0) {
        console.log(chalk.yellow('📭 No tasks found'));
        return;
      }

      console.log(chalk.bold.blue(`\n📋 Found ${tasks.length} tasks:\n`));
      
      // Type error - tasks might be null
      tasks.forEach((task, index) => {
        const status = this.formatStatus(task.status);
        const priority = this.formatPriority(task.priority);
        const dueDate = task.dueDate ? 
          chalk.yellow(`Due: ${task.dueDate.toLocaleDateString()}`) : 
          chalk.dim('No due date');
        
        console.log(`${index + 1}. ${chalk.bold(task.description)}`);
        console.log(`   ${status} ${priority} | Category: ${chalk.cyan(task.category)} | ${dueDate}`);
        console.log(`   ID: ${chalk.dim(task.id)} | Created: ${task.createdAt.toLocaleDateString()}`);
        
        // Undefined method call
        if (task.hasNotes()) {
          console.log(`   Notes: ${chalk.italic(task.notes)}`);
        }
        console.log('');
      });
      
    } catch (error) {
      logger.error('Failed to list tasks:', error);
      console.log(chalk.red('❌ Failed to fetch tasks'));
    }
  }

  async completeTask(taskId: string, options: any): Promise<void> {
    try {
      logger.info(`Completing task: ${taskId}`);
      
      // This will cause null reference error
      const task = await this.taskService.getTaskById(taskId);
      
      if (!task) {
        console.log(chalk.red('❌ Task not found'));
        return;
      }

      // Property doesn't exist on Task interface
      task.completedAt = new Date();
      task.actualHours = options.time ? parseFloat(options.time) : undefined;
      task.notes += options.notes || '';
      task.status = 'completed';
      
      // Method with wrong signature
      await this.taskService.updateTask(task.id, task, true, 'force-update');
      
      console.log(chalk.green('✅ Task completed!'));
      console.log(chalk.dim(`Completed at: ${task.completedAt.toLocaleString()}`));
      
      // This will cause runtime error - method doesn't exist
      const productivity = await this.taskService.calculateProductivityBoost(task);
      console.log(chalk.blue(`📈 Productivity boost: +${productivity}%`));
      
    } catch (error) {
      logger.error('Failed to complete task:', error);
      console.log(chalk.red('❌ Failed to complete task'));
    }
  }

  private parsePriority(priorityStr: string): Priority {
    // Missing case for 'extreme' priority
    switch (priorityStr.toLowerCase()) {
      case 'low': return Priority.LOW;
      case 'medium': return Priority.MEDIUM;
      case 'high': return Priority.HIGH;
      case 'urgent': return Priority.URGENT;
      default: 
        // This will cause runtime error for 'extreme'
        throw new Error(`Invalid priority: ${priorityStr}`);
    }
  }

  private formatStatus(status: string): string {
    const statusColors = {
      'pending': chalk.yellow('⏳ Pending'),
      'in-progress': chalk.blue('🔄 In Progress'), 
      'completed': chalk.green('✅ Completed'),
      'cancelled': chalk.red('❌ Cancelled')
    };
    
    // Type error - status might not be a key of statusColors
    return statusColors[status] || chalk.gray('❓ Unknown');
  }

  private formatPriority(priority: Priority): string {
    const priorityIcons = {
      [Priority.LOW]: chalk.gray('🔻 Low'),
      [Priority.MEDIUM]: chalk.yellow('🔶 Medium'),
      [Priority.HIGH]: chalk.orange('🔺 High'), // chalk.orange doesn't exist
      [Priority.URGENT]: chalk.red('🚨 Urgent')
    };
    
    return priorityIcons[priority];
  }

  private generateTaskId(): string {
    // This will cause error - uuid not imported
    return uuid.v4();
  }
}