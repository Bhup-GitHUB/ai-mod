#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
};

let errors = 0;
let warnings = 0;
let checks = 0;

function log(message, type = 'info') {
	const prefix = type === 'success' ? `${colors.green}✓${colors.reset}` :
		type === 'error' ? `${colors.red}✗${colors.reset}` :
		type === 'warning' ? `${colors.yellow}⚠${colors.reset}` :
		`${colors.blue}ℹ${colors.reset}`;
	console.log(`${prefix} ${message}`);
}

function check(message, condition, errorMsg) {
	checks++;
	if (condition) {
		log(message, 'success');
		return true;
	} else {
		log(`${message}: ${errorMsg}`, 'error');
		errors++;
		return false;
	}
}

function warn(message) {
	warnings++;
	log(message, 'warning');
}

console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║   Project Health Check                 ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

const projectRoot = path.resolve(__dirname, '..');

// Check 1: package.json exists
console.log(`${colors.blue}Checking project structure...${colors.reset}`);
const packageJsonPath = path.join(projectRoot, 'package.json');
check('package.json exists', fs.existsSync(packageJsonPath), 'package.json not found');

if (fs.existsSync(packageJsonPath)) {
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	
	// Check 2: Required dependencies
	console.log(`\n${colors.blue}Checking dependencies...${colors.reset}`);
	const requiredDeps = ['wrangler', 'typescript', '@cloudflare/workers-types'];
	const devDeps = packageJson.devDependencies || {};
	
	requiredDeps.forEach(dep => {
		check(`  ${dep}`, devDeps[dep], `Missing dependency: ${dep}`);
	});
	
	// Check 3: node_modules exists
	const nodeModulesPath = path.join(projectRoot, 'node_modules');
	const depsInstalled = fs.existsSync(nodeModulesPath);
	if (!depsInstalled) {
		warn('node_modules not found - run "npm install"');
		warnings++;
	} else {
		log('node_modules exists', 'success');
		checks++;
	}
}

// Check 4: Source files exist
console.log(`\n${colors.blue}Checking source files...${colors.reset}`);
const requiredFiles = [
	'src/index.ts',
	'src/router.ts',
	'src/types/index.ts',
	'src/utils/constants.ts',
	'src/utils/response.ts',
	'src/middlewares/cors.ts',
	'src/middlewares/errorHandler.ts',
	'src/middlewares/validation.ts',
	'src/service/sentiment.ts',
	'src/service/classification.ts',
	'src/service/summarization.ts',
];

requiredFiles.forEach(file => {
	const filePath = path.join(projectRoot, file);
	check(`  ${file}`, fs.existsSync(filePath), 'File not found');
});

// Check 5: Configuration files
console.log(`\n${colors.blue}Checking configuration files...${colors.reset}`);
const configFiles = [
	{ file: 'tsconfig.json', required: true },
	{ file: 'wrangler.toml', required: true },
	{ file: 'vitest.config.mts', required: false },
];

configFiles.forEach(({ file, required }) => {
	const filePath = path.join(projectRoot, file);
	if (required) {
		check(`  ${file}`, fs.existsSync(filePath), 'File not found');
	} else {
		if (fs.existsSync(filePath)) {
			log(`  ${file} exists`, 'success');
			checks++;
		}
	}
});

// Check 6: TypeScript compilation
console.log(`\n${colors.blue}Checking TypeScript compilation...${colors.reset}`);
if (fs.existsSync(path.join(projectRoot, 'node_modules', 'typescript'))) {
	try {
		execSync('npx tsc --noEmit', {
			cwd: projectRoot,
			stdio: 'pipe',
			timeout: 10000,
		});
		log('TypeScript compilation: No errors', 'success');
		checks++;
	} catch (error) {
		log('TypeScript compilation: Errors found', 'error');
		log(`  Run "npx tsc --noEmit" to see details`, 'info');
		errors++;
	}
} else {
	warn('TypeScript not installed - skipping compilation check');
}

// Check 7: Wrangler configuration
console.log(`\n${colors.blue}Checking Wrangler configuration...${colors.reset}`);
const wranglerPath = path.join(projectRoot, 'wrangler.toml');
if (fs.existsSync(wranglerPath)) {
	const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
	check('  AI binding configured', wranglerContent.includes('[ai]'), 'AI binding not found in wrangler.toml');
	check('  Main entry point set', wranglerContent.includes('main ='), 'Main entry point not configured');
} else {
	check('wrangler.toml exists', false, 'wrangler.toml not found');
}

// Check 8: Test files
console.log(`\n${colors.blue}Checking test setup...${colors.reset}`);
const testFiles = [
	'test/index.spec.ts',
	'test/tsconfig.json',
];
testFiles.forEach(file => {
	const filePath = path.join(projectRoot, file);
	if (fs.existsSync(filePath)) {
		log(`  ${file} exists`, 'success');
		checks++;
	} else {
		warn(`  ${file} not found`);
	}
});

// Summary
console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║   Summary                               ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
console.log(`\n${colors.green}Passed: ${checks}${colors.reset}`);
if (warnings > 0) {
	console.log(`${colors.yellow}Warnings: ${warnings}${colors.reset}`);
}
if (errors > 0) {
	console.log(`${colors.red}Errors: ${errors}${colors.reset}`);
	console.log(`\n${colors.red}Please fix the errors before running the project.${colors.reset}`);
	process.exit(1);
} else {
	console.log(`\n${colors.green}✓ All checks passed! Project is ready to run.${colors.reset}`);
	console.log(`\n${colors.blue}Next steps:${colors.reset}`);
	console.log(`  1. Run ${colors.cyan}npm install${colors.reset} (if not done)`);
	console.log(`  2. Run ${colors.cyan}npx wrangler login${colors.reset} (first time only)`);
	console.log(`  3. Run ${colors.cyan}npm run dev${colors.reset} to start development server`);
	process.exit(0);
}

