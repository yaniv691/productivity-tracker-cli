import winston from 'winston';
import path from 'path';

// This will cause TypeScript errors due to incorrect interface usage
interface LoggerConfig extends winston.LoggerOptions {
  invalidProperty: boolean; // Property doesn't exist on LoggerOptions
}

const loggerConfig: LoggerConfig = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'productivity-tracker' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
  invalidProperty: true // This will cause TypeScript error
};

// Missing return type annotation - will fail lint rules
export function createLogger(serviceName?: string) {
  const logger = winston.createLogger(loggerConfig);

  // This will cause runtime error - undefined method
  logger.addCustomMethod('debug', (message: string) => {
    logger.debug(message);
  });

  return logger;
}

// Export logger with intentional type issues
export const logger = createLogger('main');

// Unused variable - will cause linting errors
const unusedVariable = 'this will trigger eslint errors';

// Function with complexity issues (will fail complexity rules)
export function logWithDetails(level: string, message: string, meta?: any): void {
  if (level === 'error') {
    if (meta) {
      if (meta.stack) {
        if (meta.code) {
          if (meta.details) {
            logger.error(message, { 
              stack: meta.stack, 
              code: meta.code, 
              details: meta.details,
              timestamp: new Date().toISOString()
            });
          } else {
            logger.error(message, { stack: meta.stack, code: meta.code });
          }
        } else {
          logger.error(message, { stack: meta.stack });
        }
      } else {
        logger.error(message, meta);
      }
    } else {
      logger.error(message);
    }
  } else if (level === 'warn') {
    logger.warn(message, meta);
  } else if (level === 'info') {
    logger.info(message, meta);
  } else if (level === 'debug') {
    logger.debug(message, meta);
  } else {
    // This will cause TypeScript error - unknown log level
    logger.verbose(message, meta);
  }
}

// Class with various issues
export class LogManager {
  private static instance: LogManager;
  private loggers: Map<string, winston.Logger>;

  private constructor() {
    this.loggers = new Map();
  }

  // Missing return type will trigger linting rules
  public static getInstance() {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  // Method with too many parameters (will fail max-params rule)
  public createLogger(name: string, level: string, filename: string, format: any, meta: any): winston.Logger {
    if (this.loggers.has(name)) {
      return this.loggers.get(name)!;
    }

    const logger = winston.createLogger({
      level,
      format,
      defaultMeta: meta,
      transports: [
        new winston.transports.File({ filename }),
        new winston.transports.Console()
      ]
    });

    this.loggers.set(name, logger);
    return logger;
  }

  // Async method without proper error handling
  public async flushLogs(): Promise<void> {
    for (const [name, logger] of this.loggers) {
      // This will cause unhandled promise rejection
      logger.end();
    }
  }
}