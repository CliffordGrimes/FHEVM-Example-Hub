# Developer Guide: Encrypted Inventory Management System

This comprehensive guide covers everything developers need to know to understand, extend, and deploy this FHEVM example.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Smart Contract Development](#smart-contract-development)
5. [Testing](#testing)
6. [Automation Tools](#automation-tools)
7. [Deployment](#deployment)
8. [Contributing](#contributing)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Topics](#advanced-topics)

## Project Overview

### What This Example Demonstrates

The Encrypted Inventory Management System is a production-grade example showcasing:

- **Multiple FHE Data Types**: Using euint32, euint64, and eaddress together
- **Complex Computations**: Multiplying encrypted values for cost calculation
- **Advanced Access Control**: Role-based permissions with encrypted data
- **State Management**: Managing collections of encrypted items and orders
- **Gas Optimization**: Efficient FHE operations
- **Real-World Application**: Practical inventory management scenario

### Key Concepts

#### FHE Data Types Used

1. **euint32**: For quantities and IDs (32-bit integers)
2. **euint64**: For prices and costs (64-bit integers)
3. **eaddress**: For encrypted addresses (order requesters)

#### Data Structures

```solidity
struct InventoryItem {
    euint32 quantity;           // Encrypted stock quantity
    euint64 price;              // Encrypted unit price
    euint32 minStockLevel;      // Encrypted minimum stock level
    string itemName;            // Public metadata
    address supplier;           // Public supplier address
    bool isActive;              // Public status
    uint256 createdAt;          // Public timestamp
    uint256 lastUpdated;        // Public timestamp
}

struct StockOrder {
    uint32 itemId;             // Item reference
    eaddress requester;        // Encrypted requester
    euint32 requestedQuantity; // Encrypted quantity
    euint64 totalCost;         // Encrypted total cost
    OrderStatus status;        // Public order status
    uint256 createdAt;         // Public timestamp
    uint256 processedAt;       // Public timestamp
}
```

#### Access Control Model

```
Owner
├── Can: Add items, process orders, manage all data
├── Can: Authorize/revoke managers
└── Can: Emergency pause

Manager (authorized by Owner)
├── Can: Add items
├── Can: Update stock (add or subtract)
├── Can: Process orders
├── Can: Grant inventory access
└── Cannot: Revoke authorizations

Supplier (authorized per item)
├── Can: Add stock for authorized items
├── Cannot: Subtract stock
└── Cannot: Process orders

Buyer (no special role)
├── Can: Place orders
└── Can: View order status
```

## Architecture

### Contract Architecture

```
SecretInventoryManagement (main contract)
├── Storage Management
│   ├── Inventory mapping (itemId → InventoryItem)
│   ├── Orders mapping (orderId → StockOrder)
│   ├── Suppliers mapping (address → SupplierAccess)
│   ├── Active items array
│   └── Pending orders array
├── Core Operations
│   ├── Item management (add, deactivate)
│   ├── Stock management (update)
│   ├── Order management (place, process)
│   └── Access control (grant, revoke)
└── View/Query Functions
    ├── Get item info
    ├── Get order info
    └── Get contract statistics
```

### FHE Integration Points

1. **Encryption**: `FHE.asEuint32()`, `FHE.asEuint64()`, `FHE.asEaddress()`
2. **Operations**: `FHE.add()`, `FHE.sub()`, `FHE.mul()`
3. **Permissions**: `FHE.allow()`, `FHE.allowThis()`
4. **Configuration**: `ZamaEthereumConfig` base class

### Permission Propagation

When encrypted values are created or modified:

```solidity
// 1. Create encrypted value
euint32 encryptedQuantity = FHE.asEuint32(quantity);

// 2. Grant contract access
FHE.allowThis(encryptedQuantity);

// 3. Grant specific user access
FHE.allow(encryptedQuantity, userAddress);
```

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- Git
- MetaMask or compatible Web3 wallet (for Sepolia testnet)

### Installation

```bash
# Clone the repository (or navigate to existing directory)
cd encrypted-inventory-management

# Install dependencies
npm install

# Verify installation
npm run compile
```

### Environment Setup

Create a `.env` file in the project root:

```bash
# Hardhat variables
MNEMONIC="your twelve word mnemonic phrase here"
INFURA_API_KEY="your infura api key"
ETHERSCAN_API_KEY="your etherscan api key"

# Optional: For gas reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY="your coinmarketcap api key"
```

To set Hardhat variables securely:

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

### Quick Verification

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Generate coverage report
npm run test:coverage
```

## Smart Contract Development

### Contract Structure

#### 1. State Variables

```solidity
// Owner of the contract
address public owner;

// Counters
uint32 public nextItemId;
uint32 public nextOrderId;

// Data storage
mapping(uint32 => InventoryItem) public inventory;
mapping(uint32 => StockOrder) public orders;
mapping(address => SupplierAccess) public suppliers;
mapping(address => bool) public authorizedManagers;

// Collections
uint32[] public activeItems;
uint32[] public pendingOrders;
```

#### 2. Modifiers for Access Control

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}

modifier onlyManager() {
    require(msg.sender == owner || authorizedManagers[msg.sender], "Not authorized manager");
    _;
}

modifier onlySupplier(uint32 itemId) {
    require(suppliers[msg.sender].isAuthorized &&
            suppliers[msg.sender].canAccessItem[itemId], "Not authorized supplier");
    _;
}
```

#### 3. Key Functions

**Adding Items**:
```solidity
function addInventoryItem(
    uint32 _quantity,
    uint64 _price,
    uint32 _minStockLevel,
    string calldata _itemName,
    address _supplier
) external onlyManager
```

**Updating Stock**:
```solidity
function updateStock(
    uint32 _itemId,
    uint32 _quantityChange,
    bool _isAddition
) external
```

**Placing Orders**:
```solidity
function placeOrder(
    uint32 _itemId,
    uint32 _requestedQuantity
) external
```

**Processing Orders**:
```solidity
function processOrder(
    uint32 _orderId,
    OrderStatus _status
) external onlyManager
```

### Extending the Contract

#### Adding New Functions

1. **Identify the category** (item management, order, access control, etc.)
2. **Determine required permissions** (onlyOwner, onlyManager, etc.)
3. **Plan encrypted operations** (what needs to stay private)
4. **Write the function** with proper FHE operations
5. **Add tests** covering normal and error cases

#### Example: Adding a discount system

```solidity
/**
 * @notice Apply discount to order total cost
 * @param _orderId The order to apply discount to
 * @param _discountPercentage The discount percentage
 */
function applyDiscount(
    uint32 _orderId,
    uint32 _discountPercentage
) external onlyManager {
    require(_discountPercentage <= 100, "Invalid discount");

    StockOrder storage order = orders[_orderId];
    require(order.status == OrderStatus.Pending, "Order already processed");

    // Calculate discount amount
    euint64 discountAmount = FHE.mul(
        order.totalCost,
        FHE.asEuint64(_discountPercentage)
    );
    discountAmount = FHE.div(discountAmount, FHE.asEuint64(100));

    // Apply discount
    order.totalCost = FHE.sub(order.totalCost, discountAmount);

    // Grant permissions
    FHE.allowThis(order.totalCost);
}
```

### Best Practices

1. **Always grant permissions** after creating/modifying encrypted values
2. **Mix public and encrypted data** strategically
3. **Use descriptive names** for state variables and functions
4. **Document FHE operations** with comments explaining the encryption
5. **Test edge cases** thoroughly
6. **Optimize gas usage** by minimizing unnecessary operations
7. **Keep functions focused** on single responsibilities

## Testing

### Test Structure

The test suite is organized into categories:

- **Deployment Tests**: Verify initial contract state
- **Access Control Tests**: Check permission enforcement
- **Item Management Tests**: Test item operations
- **Stock Management Tests**: Verify stock updates
- **Order Management Tests**: Test order workflow
- **Integration Tests**: Full workflow scenarios

### Writing Tests

#### Basic Test Template

```typescript
describe("Feature Name", function () {
  let contract: Contract;
  let user: Signer;

  before(async function () {
    // Setup
    const [userSigner] = await ethers.getSigners();
    user = userSigner;

    const ContractFactory = await ethers.getContractFactory("ContractName");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  it("should do something", async function () {
    // Arrange
    const initialValue = await contract.getValue();

    // Act
    const tx = await contract.setValue(100);
    await tx.wait();

    // Assert
    const finalValue = await contract.getValue();
    expect(finalValue).to.equal(100);
  });

  it("should revert on invalid input", async function () {
    await expect(
      contract.setValue(invalidValue)
    ).to.be.revertedWith("Invalid value");
  });
});
```

#### Testing Encrypted Operations

```typescript
it("should handle encrypted computations", async function () {
  const quantity = 10;
  const price = 100;

  // Place order (which multiplies quantity * price internally)
  const tx = await contract.placeOrder(itemId, quantity);
  await tx.wait();

  // Verify order was created
  const order = await contract.getOrderInfo(orderId);
  expect(order.status).to.equal(OrderStatus.Pending);
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test test/EncryptedInventoryManagement.test.ts

# Run with verbose output
npm run test -- --grep "should add item"

# Generate coverage report
npm run test:coverage
```

### Coverage Goals

Target 100% code coverage by ensuring:
- All functions are called
- All branches are tested
- All error paths are verified
- All permission checks are validated

## Automation Tools

### Example Generator Script

The `scripts/create-example.ts` provides automated scaffolding for new examples.

#### Usage

```bash
# List available examples
npx ts-node scripts/create-example.ts list

# Create a new example
npx ts-node scripts/create-example.ts create encrypted-counter

# Create in specific directory
npx ts-node scripts/create-example.ts create access-control ./my-examples
```

#### Available Examples

1. **encrypted-counter**: Basic arithmetic operations
2. **access-control**: Permission management patterns
3. **encrypted-arithmetic**: Multiple data types
4. **user-decryption**: User-initiated decryption
5. **public-decryption**: Public result publication

### Documentation Generation

Documentation is generated from JSDoc comments in the code:

```typescript
/**
 * @test Should validate input
 * @category basic
 * @description This tests the basic validation logic
 */
it("should validate input", async function () {
  // Test implementation
});
```

Documentation keywords:
- `@test`: Test name
- `@category`: Test category (basic, access-control, etc.)
- `@chapter`: Documentation chapter
- `@describe`: Test suite description
- `@section`: Major section heading

## Deployment

### Local Testing

```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy to local network
npm run deploy:local
```

### Testnet Deployment (Sepolia)

```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Verify on Etherscan
npm run verify -- <CONTRACT_ADDRESS>
```

### Deployment Steps

1. **Compile contracts**:
   ```bash
   npm run compile
   ```

2. **Verify environment**:
   ```bash
   # Check Infura connectivity
   npx hardhat accounts --network sepolia
   ```

3. **Deploy**:
   ```bash
   npm run deploy:sepolia
   ```

4. **Verify contract**:
   ```bash
   npm run verify -- <ADDRESS>
   ```

### Deployment Script Example

```typescript
// deploy/deploy.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("EncryptedInventoryManagement", {
    from: deployer,
    log: true,
  });
}
```

## Contributing

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following best practices

3. **Write tests** for new functionality

4. **Verify quality**:
   ```bash
   npm run lint
   npm run test
   npm run test:coverage
   ```

5. **Commit changes**:
   ```bash
   git commit -m "feat: describe your changes"
   ```

6. **Push and create pull request**

### Code Quality Standards

- **Linting**: All code must pass ESLint and Solhint
- **Formatting**: Use Prettier for consistent formatting
- **Testing**: Minimum 90% code coverage
- **Documentation**: JSDoc comments for all functions
- **Type Safety**: Full TypeScript typing

### Commit Message Format

```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add test cases
refactor: restructure code
chore: maintenance tasks
```

## Troubleshooting

### Common Issues

#### 1. Compilation Errors

**Issue**: "Cannot find module '@fhevm/solidity'"
```bash
# Solution: Install dependencies
npm install
npm run compile
```

**Issue**: "Solidity version mismatch"
```bash
# Solution: Check hardhat.config.ts
# Ensure pragma solidity ^0.8.24 matches compiler version
```

#### 2. Test Failures

**Issue**: "Out of gas" errors
- **Solution**: Increase gas limits in hardhat.config.ts
- Optimize contract for gas efficiency
- Check for infinite loops in encrypted operations

**Issue**: "Permission denied" errors
- **Solution**: Verify user has correct role/permissions
- Check `FHE.allow()` calls are made
- Validate modifier checks

#### 3. Deployment Issues

**Issue**: "Insufficient funds"
- **Solution**: Ensure wallet has Sepolia ETH
- Check RPC URL configuration
- Verify mnemonic is correct

**Issue**: "Network connection failed"
- **Solution**: Check INFURA_API_KEY
- Verify Sepolia RPC endpoint
- Test connection with: `npx hardhat accounts --network sepolia`

### Debug Techniques

#### 1. Console Logging in Tests

```typescript
it("should debug values", async function () {
  const value = await contract.getValue();
  console.log("Current value:", value.toString());
  // ...
});
```

#### 2. Verbose Test Output

```bash
npm run test -- --reporter spec --no-colors
```

#### 3. Gas Usage Analysis

```bash
REPORT_GAS=true npm run test
```

#### 4. Event Inspection

```typescript
const tx = await contract.addItem(...);
const receipt = await tx.wait();
console.log("Events:", receipt?.events);
```

## Advanced Topics

### Gas Optimization

#### 1. Minimize FHE Operations

```solidity
// ❌ Inefficient
for (uint i = 0; i < 100; i++) {
    value = FHE.add(value, FHE.asEuint32(1));
}

// ✅ Efficient
value = FHE.add(value, FHE.asEuint32(100));
```

#### 2. Batch Operations

```solidity
// ✅ Good: Process multiple items
function batchUpdateStock(uint32[] calldata itemIds, uint32[] calldata quantities) external {
    for (uint i = 0; i < itemIds.length; i++) {
        updateStock(itemIds[i], quantities[i], true);
    }
}
```

#### 3. Storage Optimization

```solidity
// ✅ Use appropriate types
struct OptimizedItem {
    euint32 quantity;  // 32-bit
    euint32 price;     // Use euint32 instead of euint64 if possible
}
```

### Advanced FHE Patterns

#### 1. Conditional Execution

```solidity
// ✅ Encrypted comparison
ebool isLowStock = FHE.le(inventory[itemId].quantity, inventory[itemId].minStockLevel);
// Use the result to conditionally emit alerts
```

#### 2. Encrypted Aggregation

```solidity
function getTotalValue(uint32[] calldata itemIds) external view returns (euint64) {
    euint64 total = FHE.asEuint64(0);

    for (uint i = 0; i < itemIds.length; i++) {
        euint64 itemValue = FHE.mul(
            FHE.asEuint64(inventory[itemIds[i]].quantity),
            inventory[itemIds[i]].price
        );
        total = FHE.add(total, itemValue);
    }

    return total;
}
```

#### 3. Multi-Stage Computations

```solidity
function calculateNetCost(
    uint32 quantity,
    uint64 unitPrice,
    uint32 discountPercent
) external pure returns (euint64) {
    // Stage 1: Calculate gross cost
    euint64 grossCost = FHE.mul(
        FHE.asEuint64(quantity),
        FHE.asEuint64(unitPrice)
    );

    // Stage 2: Calculate discount
    euint64 discount = FHE.mul(
        grossCost,
        FHE.asEuint64(discountPercent)
    );
    discount = FHE.div(discount, FHE.asEuint64(100));

    // Stage 3: Calculate net cost
    return FHE.sub(grossCost, discount);
}
```

### Performance Optimization

1. **Batch processing**: Group multiple operations
2. **Lazy evaluation**: Compute values only when needed
3. **Result caching**: Store computed values when possible
4. **Index optimization**: Use efficient data structures

### Security Considerations

1. **Input validation**: Always validate before encryption
2. **Permission checks**: Use modifiers to enforce access control
3. **Overflow protection**: Consider using SafeMath equivalents
4. **Audit trail**: Emit events for all critical operations
5. **Emergency controls**: Implement pause mechanisms

## Resources

### Documentation
- [FHEVM Official Documentation](https://docs.zama.ai/fhevm)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

### Tools
- [Etherscan Sepolia Explorer](https://sepolia.etherscan.io/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Remix IDE](https://remix.ethereum.org/)

### Community
- [Zama Discord](https://discord.com/invite/zama)
- [Zama Community Forum](https://www.zama.ai/community)
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues)

---

**Happy Developing!** 🚀

For questions or issues, please consult the troubleshooting section or reach out to the Zama community.
