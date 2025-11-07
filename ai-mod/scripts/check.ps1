# Project Health Check Script for PowerShell

$ErrorActionPreference = "Continue"
$errors = 0
$warnings = 0
$checks = 0

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log-Success($message) {
    Write-ColorOutput Green "✓ $message"
    $script:checks++
}

function Log-Error($message) {
    Write-ColorOutput Red "✗ $message"
    $script:errors++
}

function Log-Warning($message) {
    Write-ColorOutput Yellow "⚠ $message"
    $script:warnings++
}

function Log-Info($message) {
    Write-ColorOutput Cyan "ℹ $message"
}

function Test-Check($message, $condition, $errorMsg) {
    if ($condition) {
        Log-Success $message
        return $true
    } else {
        Log-Error "$message : $errorMsg"
        return $false
    }
}

Write-ColorOutput Cyan "╔════════════════════════════════════════╗"
Write-ColorOutput Cyan "║   Project Health Check                 ║"
Write-ColorOutput Cyan "╚════════════════════════════════════════╝"
Write-Output ""

$projectRoot = Split-Path -Parent $PSScriptRoot

# Check 1: package.json exists
Write-ColorOutput Blue "Checking project structure..."
$packageJsonPath = Join-Path $projectRoot "package.json"
Test-Check "package.json exists" (Test-Path $packageJsonPath) "package.json not found" | Out-Null

if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    
    # Check 2: Required dependencies
    Write-Output ""
    Write-ColorOutput Blue "Checking dependencies..."
    $requiredDeps = @("wrangler", "typescript", "@cloudflare/workers-types")
    $devDeps = $packageJson.devDependencies
    
    foreach ($dep in $requiredDeps) {
        if ($devDeps.PSObject.Properties.Name -contains $dep) {
            Log-Success "  $dep"
        } else {
            Log-Error "  $dep : Missing dependency"
        }
    }
    
    # Check 3: node_modules exists
    $nodeModulesPath = Join-Path $projectRoot "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Log-Warning "node_modules not found - run 'npm install'"
    } else {
        Log-Success "node_modules exists"
    }
}

# Check 4: Source files exist
Write-Output ""
Write-ColorOutput Blue "Checking source files..."
$requiredFiles = @(
    "src/index.ts",
    "src/router.ts",
    "src/types/index.ts",
    "src/utils/constants.ts",
    "src/utils/response.ts",
    "src/middlewares/cors.ts",
    "src/middlewares/errorHandler.ts",
    "src/middlewares/validation.ts",
    "src/service/sentiment.ts",
    "src/service/classification.ts",
    "src/service/summarization.ts"
)

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $projectRoot $file
    Test-Check "  $file" (Test-Path $filePath) "File not found" | Out-Null
}

# Check 5: Configuration files
Write-Output ""
Write-ColorOutput Blue "Checking configuration files..."
$configFiles = @(
    @{File = "tsconfig.json"; Required = $true},
    @{File = "wrangler.toml"; Required = $true},
    @{File = "vitest.config.mts"; Required = $false}
)

foreach ($config in $configFiles) {
    $filePath = Join-Path $projectRoot $config.File
    if ($config.Required) {
        Test-Check "  $($config.File)" (Test-Path $filePath) "File not found" | Out-Null
    } else {
        if (Test-Path $filePath) {
            Log-Success "  $($config.File) exists"
        }
    }
}

# Check 6: TypeScript compilation
Write-Output ""
Write-ColorOutput Blue "Checking TypeScript compilation..."
$tscPath = Join-Path $projectRoot "node_modules\.bin\tsc.cmd"
if (Test-Path $tscPath) {
    try {
        Push-Location $projectRoot
        $tscOutput = & npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log-Success "TypeScript compilation: No errors"
        } else {
            Log-Error "TypeScript compilation: Errors found"
            Log-Info "  Run 'npx tsc --noEmit' to see details"
        }
    } catch {
        Log-Warning "Could not run TypeScript check"
    } finally {
        Pop-Location
    }
} else {
    Log-Warning "TypeScript not installed - skipping compilation check"
}

# Check 7: Wrangler configuration
Write-Output ""
Write-ColorOutput Blue "Checking Wrangler configuration..."
$wranglerPath = Join-Path $projectRoot "wrangler.toml"
if (Test-Path $wranglerPath) {
    $wranglerContent = Get-Content $wranglerPath -Raw
    Test-Check "  AI binding configured" ($wranglerContent -match '\[ai\]') "AI binding not found" | Out-Null
    Test-Check "  Main entry point set" ($wranglerContent -match 'main\s*=') "Main entry point not configured" | Out-Null
} else {
    Test-Check "wrangler.toml exists" $false "wrangler.toml not found" | Out-Null
}

# Check 8: Test files
Write-Output ""
Write-ColorOutput Blue "Checking test setup..."
$testFiles = @("test/index.spec.ts", "test/tsconfig.json")
foreach ($file in $testFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Log-Success "  $file exists"
    } else {
        Log-Warning "  $file not found"
    }
}

# Summary
Write-Output ""
Write-ColorOutput Cyan "╔════════════════════════════════════════╗"
Write-ColorOutput Cyan "║   Summary                               ║"
Write-ColorOutput Cyan "╚════════════════════════════════════════╝"
Write-Output ""
Write-ColorOutput Green "Passed: $checks"
if ($warnings -gt 0) {
    Write-ColorOutput Yellow "Warnings: $warnings"
}
if ($errors -gt 0) {
    Write-ColorOutput Red "Errors: $errors"
    Write-Output ""
    Write-ColorOutput Red "Please fix the errors before running the project."
    exit 1
} else {
    Write-Output ""
    Write-ColorOutput Green "✓ All checks passed! Project is ready to run."
    Write-Output ""
    Write-ColorOutput Blue "Next steps:"
    Write-Output "  1. Run npm install (if not done)"
    Write-Output "  2. Run npx wrangler login (first time only)"
    Write-Output "  3. Run npm run dev to start development server"
    exit 0
}

