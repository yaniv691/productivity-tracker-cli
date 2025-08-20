export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  notes: string;
  // This will cause TypeScript errors - wrong type
  assignee: number; // Should be string but using number
}

// Missing export will cause compilation errors
enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  averageCompletionTime: number;
  productivityScore: number;
  // Type mismatch - should be Date[]
  completionDates: string[];
}

export interface ProductivityReport {
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  metrics: TaskMetrics;
  categoryBreakdown: CategoryMetrics[];
  // Missing required property timeSpent
}

export enum ReportPeriod {
  DAY = 'day',
  WEEK = 'week', 
  MONTH = 'month',
  YEAR = 'year'
}

export interface CategoryMetrics {
  category: string;
  taskCount: number;
  completedCount: number;
  totalHours: number;
  averagePriority: Priority;
}

// Interface with circular reference issue
export interface TaskFilter extends TaskFilter {
  status?: TaskStatus;
  priority?: Priority;
  category?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  tags?: string[];
}