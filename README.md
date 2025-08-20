# Productivity Tracker CLI

A comprehensive command-line tool for managing tasks and tracking productivity metrics. Built with TypeScript and designed for developers who want to track their work efficiency.

## Features

- ✅ Task management (add, list, complete, delete)
- 📊 Productivity reports and analytics  
- 🏷️ Task categorization and tagging
- ⏰ Time tracking and estimation
- 📤 Export data to multiple formats (JSON, CSV, PDF, XLSX)
- 🎯 Priority-based task organization
- 📈 Productivity metrics and statistics

## Installation

```bash
npm install -g productivity-tracker-cli
```

## Usage

### Basic Commands

```bash
# Add a new task
ptask add "Implement user authentication" --priority high --category development

# List all tasks
ptask list

# List tasks with filters
ptask list --status pending --priority high

# Complete a task
ptask complete <task-id> --time 2.5

# Generate productivity report
ptask report --period week --format table

# Export tasks to CSV
ptask export csv --output tasks.csv
```

### Advanced Usage

```bash
# Add task with due date and estimation
ptask add "Review code changes" --due 2024-12-31 --estimate 1.5 --category review

# Show productivity statistics
ptask stats --detailed

# Create backup of all data
ptask backup --path ./backup/tasks-backup.json
```

## Configuration

The CLI stores data in `~/.productivity-tracker/` by default. You can customize this by setting the `PTASK_DATA_DIR` environment variable.

## Development

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/example/productivity-tracker-cli.git
cd productivity-tracker-cli

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Scripts

- `npm run build` - Build the TypeScript project
- `npm run test` - Run the test suite
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run dev` - Run in development mode

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/example/productivity-tracker-cli/issues).