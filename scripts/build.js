#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('🚀 Starting Comprehensive Build Process'));
console.log(chalk.gray('=' .repeat(60)));

const startTime = Date.now();

// Configuration
const config = {
  srcDir: 'src',
  outDir: 'dist',
  tempDir: '.build-temp',
  logLevel: 'verbose',
  parallel: false,
  optimization: true,
  sourceMaps: true,
  declarations: true
};

console.log(chalk.cyan('📋 Build Configuration:'));
console.log(JSON.stringify(config, null, 2));
console.log('');

// Step 1: Environment Setup
console.log(chalk.yellow.bold('🔧 Step 1: Environment Setup and Validation'));
console.log('  ├── Checking Node.js version...');
const nodeVersion = process.version;
console.log(`  │   ✓ Node.js: ${nodeVersion}`);

console.log('  ├── Checking npm version...');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`  │   ✓ npm: v${npmVersion}`);
} catch (error) {
  console.log(`  │   ❌ npm version check failed: ${error.message}`);
}

console.log('  ├── Verifying TypeScript installation...');
try {
  const tscVersion = execSync('npx tsc --version', { encoding: 'utf8' }).trim();
  console.log(`  │   ✓ ${tscVersion}`);
} catch (error) {
  console.log(`  │   ❌ TypeScript not found: ${error.message}`);
}

console.log('  ├── Checking available memory...');
const memUsage = process.memoryUsage();
console.log(`  │   ✓ Memory usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);

console.log('  └── Environment setup complete');
console.log('');

// Step 2: Clean Previous Build
console.log(chalk.yellow.bold('🧹 Step 2: Cleaning Previous Build Artifacts'));
const dirsToClean = ['dist', '.build-temp', 'coverage', '.nyc_output'];

for (const dir of dirsToClean) {
  console.log(`  ├── Removing ${dir}/...`);
  try {
    await fs.remove(dir);
    console.log(`  │   ✓ Cleaned ${dir}/`);
  } catch (error) {
    console.log(`  │   ⚠️  ${dir}/ not found or already clean`);
  }
}

console.log('  └── Cleanup complete');
console.log('');

// Step 3: Dependency Analysis
console.log(chalk.yellow.bold('📦 Step 3: Analyzing Dependencies'));
console.log('  ├── Reading package.json...');

try {
  const packageJson = await fs.readJson('package.json');
  const deps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});
  
  console.log(`  │   ✓ Found ${deps.length} production dependencies`);
  console.log(`  │   ✓ Found ${devDeps.length} development dependencies`);
  
  console.log('  ├── Production dependencies:');
  deps.forEach(dep => {
    console.log(`  │   • ${dep}`);
  });
  
  console.log('  ├── Development dependencies:');
  devDeps.slice(0, 10).forEach(dep => {
    console.log(`  │   • ${dep}`);
  });
  
  if (devDeps.length > 10) {
    console.log(`  │   ... and ${devDeps.length - 10} more`);
  }
  
} catch (error) {
  console.log(`  │   ❌ Failed to read package.json: ${error.message}`);
}

console.log('  └── Dependency analysis complete');
console.log('');

// Step 4: Source Code Analysis
console.log(chalk.yellow.bold('🔍 Step 4: Source Code Analysis'));
console.log('  ├── Scanning source files...');

async function scanDirectory(dir, extensions = ['.ts', '.js']) {
  const files = [];
  
  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await scan(fullPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  try {
    await scan(dir);
  } catch (error) {
    console.log(`  │   ⚠️  Could not scan ${dir}: ${error.message}`);
  }
  
  return files;
}

const sourceFiles = await scanDirectory('src');
const testFiles = await scanDirectory('tests');

console.log(`  │   ✓ Found ${sourceFiles.length} source files`);
console.log(`  │   ✓ Found ${testFiles.length} test files`);

// Analyze file sizes
let totalSize = 0;
for (const file of sourceFiles) {
  try {
    const stats = await fs.stat(file);
    totalSize += stats.size;
    console.log(`  │   📄 ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.log(`  │   ❌ Could not stat ${file}: ${error.message}`);
  }
}

console.log(`  │   ✓ Total source code size: ${(totalSize / 1024).toFixed(2)} KB`);
console.log('  └── Source analysis complete');
console.log('');

// Step 5: TypeScript Compilation (This will fail)
console.log(chalk.yellow.bold('⚡ Step 5: TypeScript Compilation'));
console.log('  ├── Creating output directory...');
await fs.ensureDir(config.outDir);
console.log('  │   ✓ Output directory ready');

console.log('  ├── Starting TypeScript compilation...');
console.log('  │   Using configuration: tsconfig.json');

// Show TypeScript configuration
try {
  const tsConfig = await fs.readJson('tsconfig.json');
  console.log('  │   TypeScript Config Summary:');
  console.log(`  │   • Target: ${tsConfig.compilerOptions.target}`);
  console.log(`  │   • Module: ${tsConfig.compilerOptions.module}`);
  console.log(`  │   • Strict: ${tsConfig.compilerOptions.strict}`);
  console.log(`  │   • Source Maps: ${tsConfig.compilerOptions.sourceMap}`);
} catch (error) {
  console.log('  │   ⚠️  Could not read tsconfig.json');
}

console.log('  ├── Compiling TypeScript files...');

// This will intentionally fail due to TypeScript errors in the code
try {
  const tscOutput = execSync('npx tsc --build --verbose --listFiles', { 
    encoding: 'utf8',
    timeout: 30000 
  });
  
  console.log('  │   TypeScript compilation output:');
  tscOutput.split('\n').forEach(line => {
    if (line.trim()) {
      console.log(`  │   ${line}`);
    }
  });
  
  console.log('  │   ✓ TypeScript compilation successful');
  
} catch (error) {
  console.log(chalk.red('  │   ❌ TypeScript compilation failed!'));
  console.log('  │   Error details:');
  
  const errorOutput = error.stdout || error.stderr || error.message;
  errorOutput.split('\n').forEach(line => {
    if (line.trim()) {
      console.log(chalk.red(`  │   ${line}`));
    }
  });
  
  console.log('');
  console.log(chalk.red.bold('💥 BUILD FAILED: TypeScript Compilation Errors'));
  console.log('');
  console.log(chalk.yellow('Debug Information:'));
  console.log(`  • Build started: ${new Date(startTime).toISOString()}`);
  console.log(`  • Build duration: ${Date.now() - startTime}ms`);
  console.log(`  • Node.js version: ${process.version}`);
  console.log(`  • Platform: ${process.platform}`);
  console.log(`  • Architecture: ${process.arch}`);
  console.log(`  • Memory usage: ${JSON.stringify(process.memoryUsage())}`);
  console.log('');
  
  // Additional file analysis for debugging
  console.log(chalk.yellow('File Analysis:'));
  for (const file of sourceFiles.slice(0, 5)) {
    try {
      const content = await fs.readFile(file, 'utf8');
      const lines = content.split('\n').length;
      console.log(`  • ${file}: ${lines} lines`);
    } catch (err) {
      console.log(`  • ${file}: Could not read file`);
    }
  }
  
  process.exit(1);
}

// This code will never be reached due to the compilation failure above
console.log('  └── TypeScript compilation complete');
console.log('');

// Step 6: Post-compilation Processing
console.log(chalk.yellow.bold('🔄 Step 6: Post-compilation Processing'));
console.log('  ├── Analyzing generated files...');

const distFiles = await scanDirectory('dist', ['.js', '.d.ts', '.js.map']);
console.log(`  │   ✓ Generated ${distFiles.length} files`);

console.log('  ├── Setting executable permissions...');
try {
  await fs.chmod(path.join('dist', 'cli.js'), '755');
  console.log('  │   ✓ Set executable permission on cli.js');
} catch (error) {
  console.log(`  │   ⚠️  Could not set permissions: ${error.message}`);
}

console.log('  └── Post-processing complete');
console.log('');

// Step 7: Final Build Summary
const endTime = Date.now();
const buildDuration = endTime - startTime;

console.log(chalk.green.bold('✅ Build Process Complete'));
console.log(chalk.gray('=' .repeat(60)));
console.log(chalk.green(`Total build time: ${buildDuration}ms`));
console.log(chalk.green(`Output directory: ${config.outDir}/`));
console.log(chalk.green(`Generated files: ${distFiles.length}`));

const finalMemUsage = process.memoryUsage();
console.log(chalk.blue('Memory Usage:'));
console.log(`  • Heap Used: ${(finalMemUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`  • Heap Total: ${(finalMemUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`  • External: ${(finalMemUsage.external / 1024 / 1024).toFixed(2)} MB`);

console.log('');
console.log(chalk.cyan.bold('🎉 Build completed successfully!'));