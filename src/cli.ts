// Version: dev-10154 (2025-08-21 14:12:18)#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { TaskCommand } from './commands/TaskCommand';
import { ReportCommand } from './commands/ReportCommand';
import { ExportCommand } from './commands/ExportCommand';
import { logger } from './utils/logger';

const program = new Command();

// This will cause TypeScript errors because TaskService doesn't exist
const taskService: TaskService = new TaskService();

program
  .name('ptask')
  .description('Productivity Tracker - A comprehensive CLI tool for managing tasks and tracking productivity')
  .version('1.0.0', '-v, --version', 'display version number')
  .option('--debug', 'enable debug logging', false)
  .option('--verbose', 'enable verbose output', false)
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) {
      logger.level = 'debug';
      logger.debug('Debug mode enabled');
    }
    if (opts.verbose) {
      logger.info(chalk.blue('Verbose mode enabled'));
    }
  });

// Task management commands
program
  .command('add')
  .description('Add a new task to your productivity tracker')
  .argument('<description>', 'task description')
  .option('-p, --priority <level>', 'task priority (low, medium, high, urgent)', 'medium')
  .option('-c, --category <name>', 'task category', 'general')
  .option('-d, --due <date>', 'due date (YYYY-MM-DD)')
  .option('-e, --estimate <hours>', 'estimated hours to complete', '1')
  .action(async (description: string, options: any) => {
    const taskCommand = new TaskCommand();
    await taskCommand.addTask(description, options);
  });

program
  .command('list')
  .alias('ls')
  .description('List all tasks with filtering options')
  .option('-s, --status <status>', 'filter by status (pending, in-progress, completed, cancelled)')
  .option('-p, --priority <level>', 'filter by priority')
  .option('-c, --category <name>', 'filter by category')
  .option('--today', 'show only tasks due today')
  .option('--overdue', 'show only overdue tasks')
  .action(async (options: any) => {
    const taskCommand = new TaskCommand();
    await taskCommand.listTasks(options);
  });

program
  .command('complete')
  .alias('done')
  .description('Mark a task as completed')
  .argument('<taskId>', 'task ID to complete')
  .option('-t, --time <hours>', 'actual time spent on task')
  .option('-n, --notes <text>', 'completion notes')
  .action(async (taskId: string, options: any) => {
    const taskCommand = new TaskCommand();
    await taskCommand.completeTask(taskId, options);
  });

// Reporting commands
program
  .command('report')
  .description('Generate productivity reports')
  .option('-p, --period <period>', 'report period (day, week, month, year)', 'week')
  .option('-f, --format <format>', 'output format (table, json, csv)', 'table')
  .option('--detailed', 'include detailed breakdown', false)
  .action(async (options: any) => {
    const reportCommand = new ReportCommand();
    await reportCommand.generateReport(options);
  });

// Export commands
program
  .command('export')
  .description('Export tasks and reports to various formats')
  .argument('<format>', 'export format (json, csv, pdf, xlsx)')
  .option('-o, --output <file>', 'output file path')
  .option('--filter <filter>', 'filter criteria for export')
  .option('--date-range <range>', 'date range for export (YYYY-MM-DD:YYYY-MM-DD)')
  .action(async (format: string, options: any) => {
    const exportCommand = new ExportCommand();
    await exportCommand.exportData(format, options);
  });

// Additional utility commands
program
  .command('stats')
  .description('Show productivity statistics')
  .option('--detailed', 'show detailed statistics')
  .action(async (options: any) => {
    // This will cause runtime errors due to missing dependencies
    const stats = await taskService.getProductivityStats();
    console.log(chalk.green('Productivity Statistics:'));
    console.log(stats);
  });

program
  .command('backup')
  .description('Backup all task data')
  .option('-p, --path <path>', 'backup file path')
  .action(async (options: any) => {
    logger.info('Starting backup process...');
    // This will fail because BackupService doesn't exist
    const backupService = new BackupService();
    await backupService.createBackup(options.path);
  });

// Error handling
program.exitOverride((err: any) => {
  logger.error('Command failed:', err.message);
  process.exit(err.exitCode || 1);
});

if (require.main === module) {
  program.parse();
}

export { program };