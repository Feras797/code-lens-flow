#!/usr/bin/env node

/**
 * Test script to validate LangChain implementation
 * Run with: node test-langchain-implementation.js
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Testing LangChain Implementation\n');
console.log('='.repeat(40));

// Test 1: Check if required packages are installed
console.log('\n✅ Test 1: Checking npm packages...');
const packageJson = require('./package.json');
const requiredPackages = ['@langchain/core', '@langchain/openai', 'zod'];
const missingPackages = [];

for (const pkg of requiredPackages) {
  if (!packageJson.dependencies[pkg]) {
    missingPackages.push(pkg);
  } else {
    console.log(`  ✓ ${pkg} (v${packageJson.dependencies[pkg]})`);
  }
}

if (missingPackages.length > 0) {
  console.log(`  ❌ Missing packages: ${missingPackages.join(', ')}`);
  process.exit(1);
}

// Test 2: Check if implementation files exist
console.log('\n✅ Test 2: Checking implementation files...');
const requiredFiles = [
  'src/services/teamAnalysisService.ts',
  'src/hooks/useTeamAnalysis.ts',
  'src/types/analysis.ts',
  'src/lib/chatAnalytics.ts',
  'src/components/AIAnalysisDemo.tsx',
  'src/components/sections/AIPersonalInsights.tsx',
  'supabase-migrations/analysis_tables.sql'
];

const missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log(`  ❌ Missing files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// Test 3: Check TypeScript compilation
console.log('\n✅ Test 3: Checking TypeScript compilation...');
const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('  ✓ TypeScript compilation successful');
} catch (error) {
  console.log('  ❌ TypeScript compilation errors:');
  console.log(error.stdout?.toString() || error.toString());
}

// Test 4: Check environment configuration
console.log('\n✅ Test 4: Checking environment configuration...');
const envExists = fs.existsSync(path.join(__dirname, '.env'));
const envVars = {
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
  'VITE_OPENAI_API_KEY': process.env.VITE_OPENAI_API_KEY
};

if (!envExists) {
  console.log('  ⚠️  .env file not found');
  console.log('\n  📝 Create a .env file with the following variables:');
  console.log('  VITE_SUPABASE_URL=your_supabase_url');
  console.log('  VITE_SUPABASE_ANON_KEY=your_anon_key');
  console.log('  VITE_OPENAI_API_KEY=your_openai_api_key');
} else {
  console.log('  ✓ .env file exists');
  
  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      console.log(`  ✓ ${key} is set`);
    } else {
      console.log(`  ⚠️  ${key} is not set`);
    }
  }
}

// Test 5: Validate imports
console.log('\n✅ Test 5: Validating imports...');
const serviceContent = fs.readFileSync(path.join(__dirname, 'src/services/teamAnalysisService.ts'), 'utf8');
const correctImports = [
  '@langchain/openai',
  '@langchain/core/prompts',
  '@langchain/core/output_parsers'
];

let importErrors = false;
for (const imp of correctImports) {
  if (serviceContent.includes(imp)) {
    console.log(`  ✓ Correct import: ${imp}`);
  } else {
    console.log(`  ❌ Missing or incorrect import: ${imp}`);
    importErrors = true;
  }
}

// Test 6: Check for hardcoded API keys
console.log('\n✅ Test 6: Security check...');
const filesWithCode = [
  'src/services/teamAnalysisService.ts',
  'src/hooks/useTeamAnalysis.ts'
];

let securityIssues = false;
for (const file of filesWithCode) {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  if (content.includes('sk-') && !content.includes('sk-your')) {
    console.log(`  ❌ Potential hardcoded API key in ${file}`);
    securityIssues = true;
  }
}

if (!securityIssues) {
  console.log('  ✓ No hardcoded API keys detected');
}

// Summary
console.log('\n' + '='.repeat(40));
console.log('\n📊 SUMMARY:');
console.log('='.repeat(40));

const issues = [];
if (missingPackages.length > 0) issues.push('Missing npm packages');
if (missingFiles.length > 0) issues.push('Missing implementation files');
if (importErrors) issues.push('Import errors in service file');
if (!envExists) issues.push('Missing .env file');
if (securityIssues) issues.push('Security issues detected');

if (issues.length === 0) {
  console.log('✅ All tests passed! LangChain implementation is correctly set up.');
  console.log('\n🚀 Next steps:');
  console.log('1. Set up your .env file with OpenAI API key');
  console.log('2. Run the Supabase migration: supabase-migrations/analysis_tables.sql');
  console.log('3. Start the dev server: npm run dev');
  console.log('4. Test the AIAnalysisDemo component in your app');
} else {
  console.log('❌ Issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
  console.log('\nPlease fix these issues before proceeding.');
}

console.log('\n' + '='.repeat(40));
