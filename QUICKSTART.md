# Quick Start Guide

Complete your FHEVM Example Hub setup in 5 minutes.

## Installation (1 minute)

```bash
cd encrypted-inventory-management
npm install
```

## Verification (1 minute)

```bash
npm run compile
npm run test
```

Expected output: 50+ tests passing ✅

## Generate New Examples (1 minute)

```bash
# List available templates
npx ts-node scripts/create-example.ts list

# Create encrypted-counter example
npx ts-node scripts/create-example.ts create encrypted-counter

# Create in specific directory
npx ts-node scripts/create-example.ts create access-control ./examples
```

## Deploy to Local Network (1 minute)

**Terminal 1:**
```bash
npm run node
```

**Terminal 2:**
```bash
npm run deploy:local
```

## Deploy to Sepolia Testnet (1 minute)

```bash
# Set environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Deploy
npm run deploy:sepolia

# Verify contract
npm run verify -- <CONTRACT_ADDRESS>
```

---

## Common Commands

```bash
# Compilation & Testing
npm run compile          # Compile contracts
npm run test            # Run all tests
npm run test:coverage   # Coverage report
npm run lint            # Check code quality

# Development
npm run node            # Start local node
npm run clean           # Clean build artifacts

# Deployment
npm run deploy:local    # Local deployment
npm run deploy:sepolia  # Sepolia deployment
npm run verify          # Verify on Etherscan

# Documentation & Tools
npm run docs:generate   # Generate documentation
npm run example:create  # Create new example
```

---

## Project Structure

```
├── contracts/                    # Smart contracts
│   └── SecretInventoryManagement.sol
├── test/                         # Test suite
│   └── EncryptedInventoryManagement.test.ts
├── scripts/                      # Automation
│   ├── create-example.ts        # Example generator
│   ├── generate-docs.ts         # Doc generator
│   └── create-category.ts       # Category generator
├── base-template/               # Template for examples
├── examples/                     # Additional examples
├── deploy/                       # Deployment scripts
├── hardhat.config.ts            # Hardhat config
├── package.json                 # Dependencies
└── README.md                    # Full documentation
```

---

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Complete documentation |
| `DEVELOPER_GUIDE.md` | Development guide (2500+ lines) |
| `EXAMPLES.md` | Examples catalog |
| `VIDEO_SCRIPT.md` | Video script with timing |
| `VIDEO_DIALOGUE.md` | Video dialogue (no timing) |

---

## Next Steps

1. **Explore Examples**: Read `EXAMPLES.md`
2. **Learn Concepts**: See `DEVELOPER_GUIDE.md`
3. **Generate Examples**: Use `scripts/create-example.ts`
4. **Deploy**: Follow deployment guides
5. **Extend**: Create your own examples

---

## Troubleshooting

### Installation Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Test Failures
```bash
# Update dependencies
npm install
npm run compile
npm run test
```

### Deployment Issues
```bash
# Check configuration
npx hardhat accounts --network sepolia

# Verify environment variables
echo $MNEMONIC
echo $INFURA_API_KEY
```

---

## Support

- **Documentation**: See `DEVELOPER_GUIDE.md`
- **Examples**: See `EXAMPLES.md`
- **Issues**: Check troubleshooting section
- **Community**: [Zama Discord](https://discord.com/invite/zama)

---

**Ready to start?** Begin with `npm install` 🚀
