# Deployment Guide

Complete guide for deploying the FHEVM Example Hub to different networks.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Network](#local-network)
3. [Sepolia Testnet](#sepolia-testnet)
4. [Mainnet (Not Recommended)](#mainnet-not-recommended)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Requirements

- Node.js 20 or higher
- npm or yarn package manager
- MetaMask or compatible Web3 wallet
- Git for version control

### Installation

```bash
# Clone or navigate to project
cd encrypted-inventory-management

# Install dependencies
npm install

# Verify installation
npm run compile
```

### Environment Setup

Create a `.env` file (do NOT commit this file):

```bash
# Set Hardhat variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

Or manually create `.env`:

```env
MNEMONIC="your twelve word mnemonic phrase here"
INFURA_API_KEY="your infura api key"
ETHERSCAN_API_KEY="your etherscan api key"
```

### Network Setup

Make sure you have Sepolia testnet ETH:
- Get from [Sepolia Faucet](https://sepoliafaucet.com/)
- Need at least 0.1 ETH for deployment

---

## Local Network

### For Development & Testing

#### 1. Start Local Node

**Terminal 1:**
```bash
npm run node
```

Expected output:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
Accounts:
Account #0: 0x... (10000 ETH)
Account #1: 0x... (10000 ETH)
...
```

#### 2. Deploy to Local Network

**Terminal 2:**
```bash
npm run deploy:local
```

Expected output:
```
deploying "EncryptedInventoryManagement" (tx: 0x...)
Contract deployed at: 0x5FbDB2315678afccb333f8df6622482d1dbce5d8
```

#### 3. Run Tests

```bash
npm run test
```

Expected output:
```
  EncryptedInventoryManagement
    Deployment
      ✓ should set deployer as owner (50ms)
      ✓ should initialize item and order counters (40ms)
      ...

    50+ passing (5s)
```

#### 4. Interact with Contract

```bash
# Get contract stats
npx hardhat inventory:stats --contract 0x5FbDB2315678afccb333f8df6622482d1dbce5d8

# Add item
npx hardhat inventory:addItem \
  --contract 0x5FbDB2315678afccb333f8df6622482d1dbce5d8 \
  --quantity 100 \
  --price 1000 \
  --min-stock 10 \
  --name "Laptop" \
  --supplier 0x70997970C51812e339D9B73b0245ad39437f24d3
```

#### 5. Stop Local Node

```bash
# Press Ctrl+C in Terminal 1
```

---

## Sepolia Testnet

### For Testing on Live Network

#### 1. Set Environment Variables

```bash
# Set your mnemonic
npx hardhat vars set MNEMONIC

# Set Infura API key
npx hardhat vars set INFURA_API_KEY

# Set Etherscan API key (for verification)
npx hardhat vars set ETHERSCAN_API_KEY
```

#### 2. Verify Balance

```bash
# Check account balance on Sepolia
npx hardhat accounts --network sepolia
```

Expected output:
```
Account #0: 0x... (balance: X ETH)
```

If balance is 0, get testnet ETH:
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request ETH (usually 0.05-0.5 ETH per request)
4. Wait for transaction to confirm

#### 3. Deploy Contract

```bash
npm run deploy:sepolia
```

Expected output:
```
deploying "EncryptedInventoryManagement" (tx: 0x...)
Contract deployed at: 0x1234567890123456789012345678901234567890
Waiting for confirmations...
Contract verified on Etherscan
```

**Save the contract address** - you'll need it for verification and interaction.

#### 4. Verify Contract

After deployment succeeds (wait ~1 minute for confirmations):

```bash
npm run verify -- YOUR_CONTRACT_ADDRESS
```

Example:
```bash
npm run verify -- 0x1234567890123456789012345678901234567890
```

Expected output:
```
Contract verified successfully
https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890
```

#### 5. Interact with Contract on Sepolia

View contract on Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

Use Hardhat tasks:
```bash
# Get stats
npx hardhat inventory:stats \
  --contract YOUR_CONTRACT_ADDRESS \
  --network sepolia

# Add item
npx hardhat inventory:addItem \
  --contract YOUR_CONTRACT_ADDRESS \
  --quantity 100 \
  --price 1000 \
  --min-stock 10 \
  --name "Test Item" \
  --supplier YOUR_ADDRESS \
  --network sepolia
```

#### 6. Monitor on Etherscan

1. Visit [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Search for your contract address
3. View transactions, events, and state
4. Check gas usage and costs

---

## Mainnet (Not Recommended)

### Important ⚠️

**Do NOT deploy to mainnet for testing.** Production deployment requires:
- Full security audit
- Proper testing on testnet first
- Insurance for potential losses
- Professional deployment process

---

## Verification

### Automatic Verification

Verification happens automatically during deployment:

```bash
npm run deploy:sepolia
```

### Manual Verification

If automatic verification failed:

```bash
npm run verify -- CONTRACT_ADDRESS
```

### Verification Status

Check verification on Etherscan:
1. Go to contract address page
2. Look for "Contract" tab
3. If verified: Shows "Verified" badge and source code
4. If not: Shows "Contract source code not verified"

### Verify Using API

```bash
npx hardhat verify \
  --network sepolia \
  --constructor-args scripts/arguments.js \
  CONTRACT_ADDRESS
```

---

## Deployment Configuration

### Hardhat Config

Located in `hardhat.config.ts`:

```typescript
networks: {
  localhost: { url: "http://127.0.0.1:8545", chainId: 1337 },
  sepolia: {
    url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    accounts: { mnemonic: MNEMONIC },
    chainId: 11155111
  }
}
```

### Named Accounts

```typescript
namedAccounts: {
  deployer: 0,      // First account
  owner: 0,         // Contract owner
  manager: 1,       // Manager account
  supplier: 2,      // Supplier account
  buyer: 3          // Buyer account
}
```

---

## Gas Management

### Estimate Gas Cost

```bash
# Before deploying, estimate gas
npx hardhat --network sepolia --dry-run
```

### Gas Optimization

The contract includes gas optimization:
- Efficient storage usage
- Optimized loops
- Minimal state changes
- Batch operations support

### Expected Gas Usage

| Operation | Gas | Cost (USD) |
|-----------|-----|-----------|
| Deployment | ~1.5M | ~$5-15 |
| Add Item | ~200K | ~$0.5-1.5 |
| Place Order | ~250K | ~$0.5-2 |
| Process Order | ~150K | ~$0.3-1 |

*Costs vary based on network congestion and ETH price*

---

## Deployment Checklist

### Pre-Deployment

- [ ] Code compiled successfully
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Wallet has sufficient balance
- [ ] Contract address documented
- [ ] Backup of mnemonic created

### Deployment

- [ ] Run `npm run deploy:sepolia`
- [ ] Verify deployment succeeded
- [ ] Contract address confirmed
- [ ] Transaction receipt saved
- [ ] Etherscan shows deployment

### Post-Deployment

- [ ] Contract verified on Etherscan
- [ ] View source code visible
- [ ] Run verification tasks
- [ ] Test interactions
- [ ] Document deployment details
- [ ] Monitor contract activity

---

## Troubleshooting

### Common Issues

#### 1. Insufficient Balance

**Error**: "insufficient funds for gas * price + value"

**Solution**:
1. Check balance: `npx hardhat accounts --network sepolia`
2. Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Wait for transaction to confirm
4. Try deployment again

#### 2. Network Connection Error

**Error**: "could not connect to network"

**Solution**:
```bash
# Verify RPC endpoint
npx hardhat accounts --network sepolia

# Check INFURA_API_KEY is set
echo $INFURA_API_KEY

# Test connection
curl https://sepolia.infura.io/v3/YOUR_API_KEY
```

#### 3. Gas Estimation Error

**Error**: "Error: Transaction reverted"

**Solution**:
1. Verify contract compiles
2. Check constructor parameters
3. Increase gas limit
4. Run tests first

#### 4. Verification Failed

**Error**: "Contract source code not verified"

**Solution**:
```bash
# Wait 2-3 minutes after deployment
sleep 180

# Try manual verification
npm run verify -- CONTRACT_ADDRESS

# Check Etherscan status
# https://sepolia.etherscan.io/address/CONTRACT_ADDRESS
```

#### 5. Mnemonic Issues

**Error**: "Invalid mnemonic"

**Solution**:
```bash
# Re-set mnemonic
npx hardhat vars set MNEMONIC

# Verify it's set
npx hardhat accounts --network sepolia
```

### Debug Commands

```bash
# Get detailed deployment logs
DEBUG=hardhat:* npm run deploy:sepolia

# Test compilation
npm run compile

# Dry run deployment
npx hardhat deploy --network sepolia --dry-run

# Check account details
npx hardhat accounts --network sepolia

# Get transaction details
npx hardhat --network sepolia ethers.getTransaction(TX_HASH)
```

---

## After Deployment

### Next Steps

1. **Document Deployment**
   - Save contract address
   - Record deployment date
   - Note transaction hash
   - Document configuration

2. **Verify Security**
   - Check source code on Etherscan
   - Review deployed bytecode
   - Test all functions
   - Monitor events

3. **Integration**
   - Update frontend with contract address
   - Integrate web3 interactions
   - Test with real transactions
   - Monitor gas usage

4. **Maintenance**
   - Monitor contract activity
   - Watch for updates
   - Plan upgrades if needed
   - Archive deployment info

---

## Network Information

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC**: https://sepolia.infura.io/v3/YOUR_API_KEY
- **Explorer**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/
- **Status**: ✅ Active

### Local Network

- **Chain ID**: 1337
- **RPC**: http://127.0.0.1:8545
- **Status**: Runs locally with `npm run node`

---

## Cost Estimation

### Deployment Costs (Sepolia, in USD)

| Item | Gas | Cost |
|------|-----|------|
| Contract Deployment | ~1.5M | $5-15 |
| Item Addition (5) | ~1M | $3-5 |
| Orders (10) | ~2.5M | $7-12 |
| **Total** | **~5M** | **$15-32** |

*Prices vary based on gas price and ETH value*

---

## Security Considerations

### Before Production

1. **Audit**: Get professional security audit
2. **Testing**: Extensive testing on testnet
3. **Insurance**: Consider contract insurance
4. **Gradual Rollout**: Deploy in phases
5. **Monitoring**: Set up alerts

### Best Practices

- Never share private keys
- Use hardware wallet for mainnet
- Test all functionality
- Monitor gas prices
- Keep backups of deployment info

---

## Support

### Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan](https://sepolia.etherscan.io/)

### Community

- [Zama Discord](https://discord.com/invite/zama)
- [Zama Forum](https://www.zama.ai/community)
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues)

---

## Quick Commands Reference

```bash
# Compilation
npm run compile

# Testing
npm run test

# Local deployment
npm run node          # Terminal 1
npm run deploy:local  # Terminal 2

# Sepolia deployment
npm run deploy:sepolia

# Verification
npm run verify -- <ADDRESS>

# Interaction
npx hardhat inventory:stats --contract <ADDRESS> --network sepolia
npx hardhat inventory:addItem --contract <ADDRESS> ... --network sepolia

# Environment
npx hardhat accounts --network sepolia
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
```

---

**Last Updated**: December 2025
**Version**: 1.0.0
**License**: BSD-3-Clause-Clear
