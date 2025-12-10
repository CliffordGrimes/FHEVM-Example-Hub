# Encryption Concepts in FHEVM

Understanding how encryption works in FHEVM smart contracts.

## What is FHE?

Fully Homomorphic Encryption (FHE) allows computation on encrypted data without decrypting it first.

### Key Benefits

- **Privacy**: Data remains encrypted at all times
- **Security**: No need to expose sensitive information
- **Computation**: Perform operations on encrypted values
- **Verification**: Results are mathematically correct

## FHEVM Data Types

### Encrypted Unsigned Integers

| Type | Size | Range | Use Case |
|------|------|-------|----------|
| `euint8` | 8-bit | 0-255 | Small values, flags |
| `euint16` | 16-bit | 0-65535 | Medium values |
| `euint32` | 32-bit | 0-4B | Standard integers |
| `euint64` | 64-bit | 0-18Q | Large values, prices |
| `euint128` | 128-bit | Very large | Rare use cases |

### Other Encrypted Types

- `eaddress`: Encrypted Ethereum address
- `ebool`: Encrypted boolean

## Creating Encrypted Values

### From Plain Values

```solidity
// Convert plain value to encrypted
euint32 encrypted = FHE.asEuint32(100);

// Always grant contract access
FHE.allowThis(encrypted);
```

### From External Input

```solidity
function setValue(
    externalEuint32 encryptedInput,
    bytes calldata inputProof
) external {
    // Verify and import encrypted value
    euint32 value = FHE.fromExternal(encryptedInput, inputProof);

    // Grant permissions
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);
}
```

## Encrypted Operations

### Arithmetic Operations

```solidity
// Addition
euint32 sum = FHE.add(value1, value2);

// Subtraction
euint32 diff = FHE.sub(value1, value2);

// Multiplication
euint64 product = FHE.mul(
    FHE.asEuint64(value1),
    FHE.asEuint64(value2)
);

// Division (limited support)
euint32 quotient = FHE.div(value1, value2);
```

### Comparison Operations

```solidity
// Equal to
ebool isEqual = FHE.eq(value1, value2);

// Not equal to
ebool isNotEqual = FHE.ne(value1, value2);

// Less than
ebool isLess = FHE.lt(value1, value2);

// Less than or equal
ebool isLessOrEqual = FHE.le(value1, value2);

// Greater than
ebool isGreater = FHE.gt(value1, value2);

// Greater than or equal
ebool isGreaterOrEqual = FHE.ge(value1, value2);
```

### Logical Operations

```solidity
// AND
ebool result = FHE.and(bool1, bool2);

// OR
ebool result = FHE.or(bool1, bool2);

// NOT
ebool result = FHE.not(bool1);

// XOR
ebool result = FHE.xor(bool1, bool2);
```

### Conditional Selection

```solidity
// Select based on encrypted condition
euint32 result = FHE.select(
    condition,  // ebool
    valueIfTrue,
    valueIfFalse
);
```

## Permission Management

### Grant Contract Access

```solidity
euint32 value = FHE.asEuint32(100);

// Contract must have access to use the value
FHE.allowThis(value);
```

### Grant User Access

```solidity
// Allow specific user to decrypt
FHE.allow(encryptedValue, userAddress);

// Allow multiple users
FHE.allow(encryptedValue, user1);
FHE.allow(encryptedValue, user2);
```

### Transient Permissions

```solidity
// Temporary permission for single operation
FHE.allowTransient(encryptedValue, userAddress);
```

## Data Storage

### Storing Encrypted Values

```solidity
contract MyContract {
    // Store as state variable
    euint32 private encryptedBalance;

    // Store in struct
    struct Account {
        euint32 balance;
        euint64 limit;
    }

    // Store in mapping
    mapping(address => euint32) public balances;
}
```

### Best Practices

```solidity
function updateBalance(externalEuint32 newBalance, bytes calldata proof) external {
    // 1. Import encrypted value
    euint32 encrypted = FHE.fromExternal(newBalance, proof);

    // 2. Perform operations
    euint32 result = FHE.add(balances[msg.sender], encrypted);

    // 3. Store result
    balances[msg.sender] = result;

    // 4. Grant permissions
    FHE.allowThis(result);
    FHE.allow(result, msg.sender);
}
```

## Real-World Example

### Encrypted Inventory Item

```solidity
struct InventoryItem {
    euint32 quantity;       // Encrypted
    euint64 price;          // Encrypted
    euint32 minStockLevel;  // Encrypted
    string itemName;        // Public
    address supplier;       // Public
}

function addItem(
    uint32 _quantity,
    uint64 _price,
    uint32 _minStock,
    string calldata _name,
    address _supplier
) external onlyManager {
    // Create encrypted values
    euint32 encQty = FHE.asEuint32(_quantity);
    euint64 encPrice = FHE.asEuint64(_price);
    euint32 encMin = FHE.asEuint32(_minStock);

    // Store in struct
    inventory[itemId] = InventoryItem({
        quantity: encQty,
        price: encPrice,
        minStockLevel: encMin,
        itemName: _name,
        supplier: _supplier
    });

    // Grant permissions
    FHE.allowThis(encQty);
    FHE.allowThis(encPrice);
    FHE.allowThis(encMin);
    FHE.allow(encQty, _supplier);
    FHE.allow(encPrice, _supplier);
}
```

## Type Conversion

### Upcasting (Safe)

```solidity
// euint32 → euint64 (safe, no data loss)
euint32 small = FHE.asEuint32(100);
euint64 large = FHE.asEuint64(small);
```

### Downcasting (Careful)

```solidity
// euint64 → euint32 (may lose data)
// Not directly supported - handle with care
```

## Common Patterns

### Pattern 1: Encrypted Counter

```solidity
euint32 private counter;

function increment() external {
    counter = FHE.add(counter, FHE.asEuint32(1));
    FHE.allowThis(counter);
}
```

### Pattern 2: Encrypted Comparison

```solidity
function checkThreshold(euint32 value, uint32 threshold) internal view returns (ebool) {
    return FHE.le(value, FHE.asEuint32(threshold));
}
```

### Pattern 3: Conditional Update

```solidity
function conditionalUpdate(euint32 newValue) external {
    ebool shouldUpdate = FHE.gt(newValue, currentValue);
    currentValue = FHE.select(shouldUpdate, newValue, currentValue);
    FHE.allowThis(currentValue);
}
```

## Anti-Patterns

### ❌ Don't: Return Encrypted Values from View

```solidity
// WRONG - View functions can't return encrypted values meaningfully
function getBalance() external view returns (euint32) {
    return balance; // Users can't decrypt this
}
```

### ❌ Don't: Forget Permission Grants

```solidity
// WRONG
euint32 value = FHE.asEuint32(100);
// Missing: FHE.allowThis(value)
someMapping[key] = value; // Will fail
```

### ❌ Don't: Mix Encrypted and Plain in Operations

```solidity
// WRONG - Can't directly mix types
euint32 encrypted = FHE.asEuint32(100);
uint32 plain = 50;
// encrypted + plain; // Doesn't work

// CORRECT
euint32 result = FHE.add(encrypted, FHE.asEuint32(plain));
```

## Gas Considerations

### Operation Costs

Encrypted operations cost more gas than plain:

| Operation | Plain | Encrypted | Multiplier |
|-----------|-------|-----------|------------|
| Addition | ~100 | ~2000 | 20x |
| Multiplication | ~200 | ~3000 | 15x |
| Comparison | ~100 | ~2000 | 20x |

### Optimization Tips

1. Minimize encrypted operations
2. Batch operations when possible
3. Cache results when reused
4. Use appropriate data types (smaller = cheaper)

## Security Considerations

1. **Always validate inputs**
   ```solidity
   require(_quantity > 0, "Invalid quantity");
   euint32 enc = FHE.asEuint32(_quantity);
   ```

2. **Grant minimal permissions**
   ```solidity
   // Only grant to authorized users
   if (isAuthorized(user)) {
       FHE.allow(data, user);
   }
   ```

3. **Protect sensitive operations**
   ```solidity
   function sensitiveOp() external onlyOwner {
       // Encrypted + access control
   }
   ```

## Testing Encrypted Operations

```typescript
it("should perform encrypted addition", async function () {
    // Set initial value
    await contract.setValue(100);

    // Add encrypted amount
    await contract.increment(50);

    // Cannot directly check encrypted value
    // Instead, verify through observable effects
    const stats = await contract.getStats();
    // Check that operation completed
});
```

## Best Practices Summary

1. ✅ Use appropriate encrypted types
2. ✅ Always call FHE.allowThis()
3. ✅ Grant user access explicitly
4. ✅ Validate inputs before encrypting
5. ✅ Handle permissions properly
6. ✅ Consider gas costs
7. ✅ Test thoroughly
8. ✅ Document encryption choices

---

**Related Concepts**:
- [Access Control](access-control.md)
- [Input Proofs](input-proofs.md)
- [Handle Management](handles.md)
