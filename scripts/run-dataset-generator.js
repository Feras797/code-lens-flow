#!/usr/bin/env node

/**
 * Dataset Generator Runner
 * This script sets up the environment and runs the TypeScript dataset generator
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking environment variables...', 'blue');

  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_KEY' // We need the service key for batch operations
  ];

  const missing = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    log('\n❌ Missing required environment variables:', 'red');
    missing.forEach(envVar => {
      log(`   - ${envVar}`, 'red');
    });

    log('\n📝 To fix this:', 'yellow');
    log('1. Create a .env file in the project root', 'yellow');
    log('2. Add these variables:', 'yellow');
    log('   VITE_SUPABASE_URL=your_supabase_project_url', 'yellow');
    log('   SUPABASE_SERVICE_KEY=your_service_role_key', 'yellow');
    log('\n💡 Find these values in your Supabase project dashboard > Settings > API', 'cyan');

    return false;
  }

  log('✅ Environment variables are configured', 'green');
  return true;
}

function checkDependencies() {
  log('\n📦 Checking dependencies...', 'blue');

  try {
    // Check if ts-node is available
    execSync('npx ts-node --version', { stdio: 'pipe' });
    log('✅ ts-node is available', 'green');
    return true;
  } catch (error) {
    log('❌ ts-node not found', 'red');
    log('Installing ts-node...', 'yellow');

    try {
      execSync('npm install -D ts-node', { stdio: 'inherit' });
      log('✅ ts-node installed successfully', 'green');
      return true;
    } catch (installError) {
      log('❌ Failed to install ts-node', 'red');
      log('Please run: npm install -D ts-node', 'yellow');
      return false;
    }
  }
}

function runDatasetGenerator(count = 500) {
  log(`\n🚀 Generating ${count} mock conversations...`, 'blue');

  try {
    // Set NODE_ENV to handle ES modules properly
    process.env.NODE_ENV = 'development';

    // Run the TypeScript dataset generator
    execSync(`npx ts-node scripts/generate-mock-dataset.ts`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATASET_COUNT: count.toString()
      }
    });

    log('\n🎉 Dataset generation completed successfully!', 'green');
    return true;
  } catch (error) {
    log('\n❌ Dataset generation failed', 'red');
    log('Error details:', 'red');
    console.error(error.message);
    return false;
  }
}

function showUsage() {
  log('\n📖 Dataset Generator Usage:', 'cyan');
  log('  node scripts/run-dataset-generator.js [count]', 'cyan');
  log('', 'reset');
  log('Arguments:', 'cyan');
  log('  count    Number of conversations to generate (default: 500)', 'cyan');
  log('', 'reset');
  log('Examples:', 'cyan');
  log('  node scripts/run-dataset-generator.js      # Generate 500 conversations', 'cyan');
  log('  node scripts/run-dataset-generator.js 1000 # Generate 1000 conversations', 'cyan');
}

function main() {
  log('🎯 Claude Code Mock Dataset Generator', 'cyan');
  log('=====================================', 'cyan');

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  const count = args[0] ? parseInt(args[0], 10) : 500;

  if (isNaN(count) || count <= 0) {
    log('❌ Invalid count specified. Please provide a positive number.', 'red');
    showUsage();
    process.exit(1);
  }

  // Pre-flight checks
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }

  if (!checkDependencies()) {
    process.exit(1);
  }

  // Run the generator
  const success = runDatasetGenerator(count);

  if (success) {
    log('\n✨ Next steps:', 'cyan');
    log('1. Check your Supabase dashboard to verify the data was uploaded', 'cyan');
    log('2. Refresh your application to see the new analytics data', 'cyan');
    log('3. Test the team insights and developer profile features', 'cyan');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  log('\n❌ Unhandled error:', 'red');
  console.error(error);
  process.exit(1);
});

process.on('SIGINT', () => {
  log('\n\n⚠️  Process interrupted by user', 'yellow');
  process.exit(0);
});

// Run the main function
main();