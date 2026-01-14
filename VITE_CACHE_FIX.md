# Fix Vite Cache Issues

## Problem
When you see errors like:
- `504 (Outdated Optimize Dep)`
- `ERR_ABORTED` for dependencies
- Module not found errors after installing new packages

This means Vite's dependency pre-bundling cache is outdated.

## Solution

### Quick Fix (Windows PowerShell)
```powershell
cd colosseum_prediction
Remove-Item -Recurse -Force node_modules\.vite
yarn dev
```

### Quick Fix (Windows CMD)
```cmd
cd colosseum_prediction
rmdir /s /q node_modules\.vite
yarn dev
```

### Quick Fix (Mac/Linux)
```bash
cd colosseum_prediction
rm -rf node_modules/.vite
yarn dev
```

### Using the Script
```bash
yarn clean
yarn dev
```

Or use the combined command:
```bash
yarn dev:clean
```

## When to Clear Cache

Clear Vite cache when:
- ✅ Installing new dependencies
- ✅ Updating dependencies
- ✅ Getting "Outdated Optimize Dep" errors
- ✅ Getting module not found errors
- ✅ Vite seems to be using old code

## Alternative: Force Re-optimization

You can also force Vite to re-optimize by:
1. Stopping the dev server
2. Deleting `node_modules/.vite`
3. Restarting with `yarn dev`

Vite will automatically rebuild the cache on next start.

