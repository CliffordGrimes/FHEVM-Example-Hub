# Troubleshooting Guide

Complete guide for solving common issues with the FHEVM Example Hub.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Compilation Errors](#compilation-errors)
3. [Test Failures](#test-failures)
4. [Deployment Issues](#deployment-issues)
5. [Runtime Errors](#runtime-errors)
6. [Gas Issues](#gas-issues)
7. [Network Issues](#network-issues)
8. [Development Environment](#development-environment)

---

## Installation & Setup

### Issue: npm install fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove lock files
rm package-lock.json

# Reinstall
npm install
```

### Issue: Node.js version incompatible

**Error**: `The current version of Node.js is not compatible`

**Solution**:
```bash
# Check Node.js version
node --version

# Should be 20.0.0 or higher
# Install Node 20+ from https://nodejs.org/
```

### Issue: Hardhat not found

**Error**: `command not found: hardhat`

**Solution**:
```bash
# Install Hardhat globally
npm install -g hardhat

# Or use npx
npx hardhat --version
```

### Issue: Missing environment variables

**Error**: `INFURA_API_KEY not defined`

**Solution**:
```bash
# Set Hardhat variables
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set MNEMONIC
npx hardhat vars set ETHERSCAN_API_KEY

# Verify they're set
npx hardhat accounts --network sepolia
```

---

## Compilation Errors

### Issue: Solidity version mismatch

**Error**: `compiler version must be 0.8.24`

**Solution**:
```bash
# Clean and recompile
npm run clean
npm run compile

# If still fails, check hardhat.config.ts
cat hardhat.config.ts | grep "solidity:"
```

### Issue: Missing imports

**Error**: `Cannot find import "@fhevm/solidity"`

**Solution**:
```bash
# Install FHEVM dependencies
npm install --save-dev @fhevm/solidity

# Verify installation
ls node_modules/@fhevm

# If not found, reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: OpenZeppelin contracts not found

**Error**: `Cannot find module '@openzeppelin/contracts'`

**Solution**:
```bash
# Install OpenZeppelin
npm install @openzeppelin/contracts

# Verify
npm list @openzeppelin/contracts
```

### Issue: Type errors

**Error**: `Type '...' is not assignable to type '...'`

**Solution**:
```bash
# Check TypeScript version
npx tsc --version

# Update TypeScript
npm install -D typescript@latest

# Recompile
npm run compile
```

### Issue: Solhint errors

**Error**: `Code should follow specific linting rules`

**Solution**:
```bash
# Check which rules are failing
npx solhint 'contracts/**/*.sol'

# Fix automatically where possible
npm run lint:fix

# Or disable rule in .solhint.json
cat .solhint.json
```

---

## Test Failures

### Issue: Tests won't run

**Error**: `Error: Cannot find module`

**Solution**:
```bash
# Compile first
npm run compile

# Then run tests
npm run test

# Run specific test
npm run test test/EncryptedInventoryManagement.test.ts
```

### Issue: Timeout during tests

**Error**: `Timeout of 40000ms exceeded`

**Solution**:
```bash
# Increase timeout in hardhat.config.ts
// Change:
mocha: {
  timeout: 40000  // Increase to 60000 or 100000
}

# Or run single test
npm run test -- --grep "should add item"
```

### Issue: Account or balance errors

**Error**: `Account 0 is not in the signer set`

**Solution**:
```bash
# Get available accounts
npx hardhat accounts

# Check default signer
npx hardhat run --network localhost scripts/accounts.ts

# May need to restart node
npm run node  # Terminal 1
npm run test  # Terminal 2
```

### Issue: Assertion failures

**Error**: `Expected X but got Y`

**Solution**:
1. Check test assumptions
2. Verify contract state
3. Run tests with verbose output
```bash
npm run test -- --reporter spec
```

### Issue: Contract deployment in tests fails

**Error**: `Contract deployment failed`

**Solution**:
```bash
# Verify contract compiles
npm run compile

# Check for constructor issues
# Review contracts/SecretInventoryManagement.sol

# Run with verbose output
DEBUG=hardhat:* npm run test
```

### Issue: Permission/access control test fails

**Error**: `Expected revert but got success`

**Solution**:
1. Verify user roles are set correctly
2. Check modifier implementation
3. Review access control logic
4. Check test setup:
```typescript
// Make sure to set up permissions first
await contract.authorizeManager(managerAddress);
```

---

## Deployment Issues

### Issue: Insufficient balance

**Error**: `insufficient funds for gas`

**Solution - Local Network**:
```bash
# Local accounts have 10000 ETH
# If balance is 0, restart node
npm run node
```

**Solution - Sepolia Testnet**:
```bash
# Get testnet ETH from faucet
# https://sepoliafaucet.com/

# Verify balance
npx hardhat accounts --network sepolia

# Check specific account
npx hardhat run scripts/check-balance.ts --network sepolia
```

### Issue: Network connection error

**Error**: `Could not connect to network`

**Solution**:
```bash
# Check RPC endpoint
npx hardhat accounts --network sepolia

# Verify INFURA_API_KEY
echo $INFURA_API_KEY

# Test connection
curl https://sepolia.infura.io/v3/YOUR_KEY

# Update RPC URL if needed
# Edit hardhat.config.ts
```

### Issue: Deployment hangs

**Error**: `Waiting for confirmations...` (never completes)

**Solution**:
```bash
# Check transaction on Etherscan
# https://sepolia.etherscan.io/tx/YOUR_TX_HASH

# If failed:
# - Get more ETH
# - Increase gas price
# - Check contract code

# Try again
npm run deploy:sepolia
```

### Issue: Contract verification fails

**Error**: `Contract verification failed`

**Solution**:
```bash
# Wait 1-2 minutes after deployment
sleep 120

# Try manual verification
npm run verify -- YOUR_CONTRACT_ADDRESS

# Check Etherscan page
# https://sepolia.etherscan.io/address/YOUR_ADDRESS

# If source code mismatch:
# - Ensure using exact same compiler version
# - Check constructor arguments
# - Verify optimization settings
```

### Issue: Out of gas during deployment

**Error**: `Out of gas`

**Solution**:
```bash
# Increase gas limit in hardhat.config.ts
// In network config:
gas: 3000000,  // Increase from default

# Or use deployment script
// In deploy.ts:
const deployment = await deploy("...", {
  gasLimit: 3000000
});
```

---

## Runtime Errors

### Issue: "Not authorized" error

**Error**: `Error: Not authorized`

**Solution**:
1. Verify caller has required role
2. Check access control logic
3. Make sure modifier is applied
```typescript
// Verify function has modifier
function myFunction() external onlyManager {
  // ...
}

// Make sure to authorize user first
await contract.authorizeManager(userAddress);
```

### Issue: "Item not active" error

**Error**: `Error: Item not active`

**Solution**:
```typescript
// Check item status
const itemInfo = await contract.getItemInfo(itemId);
console.log("isActive:", itemInfo.isActive);

// If deactivated, create new item
// Or check if someone called deactivateItem()
```

### Issue: "Invalid quantity" error

**Error**: `Error: Invalid quantity`

**Solution**:
```typescript
// Quantity must be > 0
await contract.updateStock(itemId, 0, true);  // ❌ WRONG
await contract.updateStock(itemId, 10, true); // ✅ CORRECT
```

### Issue: Transaction reverted

**Error**: `Transaction reverted without reason`

**Solution**:
```bash
# Run with verbose output
DEBUG=hardhat:core npm run test

# Add console logs to contract
// In contract code:
console.log("Debugging:", msg.sender, value);

# Check requirements
// In contract, make sure:
require(condition, "Error message");  // With message
```

---

## Gas Issues

### Issue: Gas estimation error

**Error**: `Error estimating gas`

**Solution**:
```typescript
// May be due to:
1. Contract revert (check requirements)
2. Invalid parameters
3. Missing permissions
4. State issues

// Debug:
await contract.myFunction.estimateGas();

// Or use manual gas
const tx = await contract.myFunction({
  gasLimit: 300000
});
```

### Issue: Transaction too expensive

**Error**: `Gas price too high` or transaction costs too much

**Solution**:
```bash
# Check gas prices
# https://etherscan.io/gastracker

# Wait for lower gas prices
# Deploy during off-peak hours (UTC early morning)

# Optimize contract to use less gas
```

### Issue: Out of memory during compilation

**Error**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run compile

# Or clean and rebuild
npm run clean
npm run compile
```

---

## Network Issues

### Issue: Sepolia network down

**Error**: `Network request failed`

**Solution**:
```bash
# Check network status
# https://sepolia.etherscan.io/

# Try again later
# Use local network for testing

# Check RPC status
curl https://sepolia.infura.io/v3/YOUR_KEY
```

### Issue: High network congestion

**Error**: `Transaction pending for long time`

**Solution**:
```bash
# Wait for network to clear
# Usually clears within 24 hours

# Or increase gas price
// In hardhat.config.ts:
gasPrice: "auto"  // Uses current network price
```

### Issue: Invalid RPC endpoint

**Error**: `Invalid JSON RPC response`

**Solution**:
```bash
# Verify RPC URL is correct
# https://sepolia.infura.io/v3/YOUR_KEY

# Check API key is valid
npx hardhat accounts --network sepolia

# Update in .env or hardhat.config.ts
INFURA_API_KEY=your_actual_key
```

---

## Development Environment

### Issue: VSCode not recognizing Solidity

**Error**: Red squiggles under contract code

**Solution**:
1. Install Solidity extension
   - Search "Solidity" in VSCode extensions
   - Install "Solidity by Juan Blanco"

2. Configure settings
   - Open .vscode/settings.json
   - Should have proper paths configured

3. Reload window
   - Ctrl+Shift+P → Reload Window

### Issue: ESLint errors in VSCode

**Error**: Linting errors preventing save

**Solution**:
```bash
# Install ESLint extension in VSCode

# Or disable linting
// In .eslintrc.yml, comment rules
// rules:
//   - { 'rule-name': off }

# Run lint fix
npm run lint:fix
```

### Issue: Prettier conflicting with code style

**Error**: Format and lint disagree on style

**Solution**:
```bash
# Ensure Prettier is configured correctly
cat .prettierrc.yml

# Run Prettier
npm run format

# Then run linter
npm run lint:fix
```

### Issue: Git merge conflicts

**Error**: Conflicts in lock files or config

**Solution**:
```bash
# Don't commit lock files
# Remove from tracking
git rm --cached package-lock.json
echo "package-lock.json" >> .gitignore

# Reinstall dependencies
npm install
```

---

## Getting Help

### Where to Ask

1. **GitHub Issues**: https://github.com/zama-ai/fhevm/issues
2. **Zama Discord**: https://discord.com/invite/zama
3. **Zama Forum**: https://www.zama.ai/community
4. **Stack Overflow**: Tag with `fhevm`

### Information to Provide

When asking for help, include:
1. Error message (full copy)
2. Your environment (Node version, OS)
3. Steps to reproduce
4. Code snippet causing issue
5. Your hardhat.config.ts (without secrets)

### Debug Information

Collect before asking for help:
```bash
# Node version
node --version

# npm version
npm --version

# Hardhat version
npx hardhat --version

# OS
uname -a  # or: Get-ComputerInfo (Windows)

# Solc version
npx solc --version
```

---

## Common Solutions Summary

| Problem | Solution |
|---------|----------|
| npm install fails | `npm cache clean --force && npm install` |
| Compilation fails | `npm run clean && npm run compile` |
| Tests timeout | Increase timeout in hardhat.config.ts |
| Insufficient balance | Get testnet ETH from Sepolia Faucet |
| Deployment fails | Check balance, network, gas limit |
| Contract not verified | Wait 1-2 minutes, try again |
| Permission denied | Authorize user first |
| Item not active | Check item status, create new if needed |
| Out of gas | Increase gas limit |
| Network error | Check RPC endpoint, wait for network |

---

## Preventive Measures

### Best Practices

1. **Always compile first**
   ```bash
   npm run compile
   ```

2. **Run tests before deploying**
   ```bash
   npm run test
   ```

3. **Check linting**
   ```bash
   npm run lint
   ```

4. **Test on local network first**
   ```bash
   npm run node
   npm run deploy:local
   ```

5. **Verify contract on Etherscan**
   ```bash
   npm run verify -- CONTRACT_ADDRESS
   ```

### Monitoring

- Watch contract events on Etherscan
- Monitor gas prices
- Check network status
- Keep dependencies updated

---

**Last Updated**: December 2025
**Version**: 1.0.0
**License**: BSD-3-Clause-Clear
