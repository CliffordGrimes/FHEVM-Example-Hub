# FHEVM Examples Catalog

This document provides a comprehensive overview of all examples available in the FHEVM Example Hub.

## Quick Navigation

- [Basic Operations](#basic-operations)
- [Encryption Patterns](#encryption-patterns)
- [Access Control](#access-control)
- [Decryption Patterns](#decryption-patterns)
- [Advanced Examples](#advanced-examples)

---

## Basic Operations

### 1. Encrypted Counter

**File**: `examples/EncryptedCounter.sol`

**Concept**: Simple FHE counter demonstrating basic arithmetic

**What You'll Learn**:
- How to store encrypted values
- Performing encrypted addition
- Performing encrypted subtraction
- Granting access to encrypted data

**Key Features**:
- euint32 data type
- FHE.add() operation
- FHE.sub() operation
- FHE.allow() for permission management

**Use Case**: Perfect for beginners learning encrypted arithmetic

**Code Example**:
```solidity
euint32 counter = FHE.asEuint32(0);
counter = FHE.add(counter, encryptedAmount);
FHE.allowThis(counter);
```

---

### 2. Encrypted Arithmetic

**File**: `examples/EncryptedArithmetic.sol`

**Concept**: Multiple arithmetic operations on different encrypted types

**What You'll Learn**:
- Working with multiple encrypted values
- Type conversion (euint32 to euint64)
- Encrypted multiplication
- Computing with mixed data types

**Key Features**:
- euint32 for quantities
- euint64 for larger products
- FHE.mul() multiplication
- Type casting for computation

**Use Case**: Demonstrates cost calculations and complex operations

**Code Example**:
```solidity
euint64 product = FHE.mul(
    FHE.asEuint64(quantity),
    FHE.asEuint64(price)
);
```

---

## Encryption Patterns

### 3. Single Value Encryption

**Concept**: Encrypting and managing a single encrypted field

**What You'll Learn**:
- Basic encryption setup
- Permission management
- Viewing encrypted data
- Security considerations

**Pattern**:
```solidity
euint32 secretValue;

function setValue(externalEuint32 val, bytes calldata proof) external {
    secretValue = FHE.fromExternal(val, proof);
    FHE.allowThis(secretValue);
}
```

---

### 4. Multiple Value Encryption

**Concept**: Managing multiple encrypted fields in structures

**What You'll Learn**:
- Structs with encrypted fields
- Bulk permission management
- State consistency
- Complex data types

**Pattern**:
```solidity
struct EncryptedData {
    euint32 value1;
    euint64 value2;
    euint32 value3;
}

mapping(uint => EncryptedData) public data;
```

---

## Access Control

### 5. Access Control System

**File**: `contracts/SecretInventoryManagement.sol` (Main Example)

**Concept**: Role-based access control for encrypted operations

**What You'll Learn**:
- Three-tier permission system (Owner, Manager, Supplier)
- Function-level access control
- Per-item authorization
- Permission revocation

**Key Patterns**:
- `onlyOwner` modifier
- `onlyManager` modifier
- `onlySupplier` modifier
- FHE.allow() for specific users

**Use Cases**:
- Inventory management
- Supply chain operations
- Multi-party collaboration

---

### 6. Input Proof Validation

**Concept**: Validating encrypted inputs with proofs

**What You'll Learn**:
- What are input proofs
- Why proofs are necessary
- How to validate encrypted inputs
- Security implications

**Important Pattern**:
```solidity
function operateOnEncrypted(
    externalEuint32 encryptedValue,
    bytes calldata inputProof
) external {
    euint32 decrypted = FHE.fromExternal(encryptedValue, inputProof);
    // Use decrypted value
    FHE.allowThis(decrypted);
}
```

---

## Decryption Patterns

### 7. User Decryption

**Concept**: Users decrypt their own encrypted data

**What You'll Learn**:
- User-initiated decryption
- Permission-based decryption
- Single value decryption
- Multiple value decryption

**Use Cases**:
- Users viewing their own encrypted inventory
- Permission-based access to sensitive data
- Privacy-preserving user experience

---

### 8. Public Decryption

**Concept**: Contract-initiated decryption of results

**What You'll Learn**:
- Public result publication
- Contract-controlled decryption
- Result visibility
- Multi-party scenarios

**Use Cases**:
- Publishing computed results
- Auction finalization
- Final settlement operations

---

## Advanced Examples

### 9. Confidential Inventory Management (Main Example)

**File**: `contracts/SecretInventoryManagement.sol`

**Complexity**: Advanced

**Demonstrates**:
- Multiple encrypted types in one contract
- Complex role-based access control
- Order management with encrypted details
- Cost calculations on encrypted values
- Dynamic collection management
- Event logging and security

**Concepts Covered**:
- euint32, euint64, eaddress types
- Encrypted multiplication
- Role hierarchy (Owner > Manager > Supplier > Buyer)
- Order lifecycle management
- Emergency pause functionality
- Per-item access control

**Code Highlights**:
```solidity
// Encrypted order total cost
euint64 totalCost = FHE.mul(
    FHE.asEuint64(_requestedQuantity),
    inventory[_itemId].price
);

// Role-based permissions
modifier onlyManager() {
    require(msg.sender == owner || authorizedManagers[msg.sender]);
    _;
}

// Permission propagation
FHE.allowThis(encryptedQuantity);
FHE.allow(encryptedQuantity, _supplier);
```

---

### 10. Blind Auction (Conceptual)

**Concept**: Encrypted auction with sealed bids

**What You'll Learn**:
- Hiding bid amounts
- Comparing encrypted values
- Winner determination on encrypted data
- Anti-patterns to avoid

**Key Concepts**:
- Bid encryption
- Encrypted comparison
- Sealed bid protection
- Fair winner selection

---

## Learning Path

### For Beginners

1. Start with **Encrypted Counter** (basic operations)
2. Move to **Encrypted Arithmetic** (multiple types)
3. Learn about **Input Proofs** (validation)
4. Explore **Single Value Encryption** (basic pattern)

### For Intermediate Developers

1. Study **Access Control System** (permissions)
2. Understand **Multiple Value Encryption** (complex structures)
3. Learn **User Decryption** (data retrieval)
4. Practice with example generation tools

### For Advanced Users

1. Implement **Confidential Inventory Management** (complex application)
2. Explore **Public Decryption** (multi-party scenarios)
3. Design custom **Blind Auction** implementation
4. Create new examples using scaffolding tools

---

## Example Generation

All examples can be automatically generated using:

```bash
# Generate encrypted-counter
npx ts-node scripts/create-example.ts create encrypted-counter

# Generate access-control system
npx ts-node scripts/create-example.ts create access-control-system

# Generate all examples
npx ts-node scripts/create-example.ts create-all
```

Each generated example includes:
- Complete contract implementation
- Comprehensive test suite (10+ tests)
- Deployment script
- Documentation README
- Configuration files

---

## Testing

Each example includes extensive tests:

```bash
# Run all tests
npm run test

# Run specific example tests
npm run test examples/EncryptedCounter.test.ts

# Generate coverage report
npm run test:coverage
```

---

## Documentation

Complete documentation for each example:

```bash
# Generate documentation
npm run docs:generate

# View generated docs
cat docs/examples/*/README.md
```

---

## Anti-Patterns to Avoid

### ❌ Don't: View functions with encrypted values
```solidity
// WRONG - Cannot return encrypted values from view functions
function getSecretValue() external view returns (euint32) {
    return secretValue;
}
```

### ✅ Do: Use proper permission handling
```solidity
// CORRECT - Grant permissions before operations
function setSecret(externalEuint32 val, bytes calldata proof) external {
    euint32 secret = FHE.fromExternal(val, proof);
    FHE.allowThis(secret);
    FHE.allow(secret, msg.sender);
}
```

### ❌ Don't: Forget FHE.allowThis()
```solidity
// WRONG - Missing permission grant
counter = FHE.add(counter, amount);
// Missing: FHE.allowThis(counter);
```

### ✅ Do: Always grant necessary permissions
```solidity
// CORRECT - Proper permission management
counter = FHE.add(counter, amount);
FHE.allowThis(counter);
FHE.allow(counter, authorizedUser);
```

---

## Resources

### For Each Example

- **Source code**: Located in `examples/` directory
- **Tests**: Located in `test/` directory
- **Documentation**: Auto-generated in `docs/` directory
- **Tutorials**: See `DEVELOPER_GUIDE.md`

### Community Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Discord Community](https://discord.com/invite/zama)
- [GitHub Issues & Discussions](https://github.com/zama-ai/fhevm/issues)

---

## Contributing New Examples

To add a new example:

1. Create contract in `examples/` directory
2. Write comprehensive test suite (10+ tests)
3. Document with JSDoc comments
4. Add category tags for documentation
5. Update this catalog
6. Submit for review

---

**Last Updated**: December 2025

**Total Examples**: 10+ (with more available through generation)

**Learning Hours**: 1-2 hours (beginner to advanced)
