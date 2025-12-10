# Understanding Handles in FHEVM

Deep dive into FHE handles, their generation, lifecycle, and symbolic execution.

## What Are Handles?

Handles are unique identifiers for encrypted values in FHEVM. Instead of storing the entire encrypted value, contracts store a handle that references the encrypted data.

## Why Handles?

### Efficiency
- Encrypted values are large (hundreds of bytes)
- Handles are small (32 bytes)
- Storage cost reduction
- Gas optimization

### Security
- Encrypted data stored off-chain
- Only handle stored on-chain
- Adds layer of indirection
- Better privacy guarantees

### Performance
- Faster operations
- Less data to process
- Reduced gas costs
- Better scalability

## Handle Generation

### Automatic Generation

```solidity
// Create encrypted value
euint32 value = FHE.asEuint32(100);

// Handle is generated automatically
// Internally: handle = hash(encryptedData, nonce, context)
```

### Handle Structure

```
Handle = keccak256(
    encryptedData,
    nonce,
    contractAddress,
    storageSlot
)
```

## Handle Lifecycle

### 1. Creation

```solidity
function create() external {
    // Generate new handle
    euint32 value = FHE.asEuint32(100);
    // Handle created: 0x1234...
}
```

### 2. Storage

```solidity
contract Example {
    // Handle stored in state
    euint32 storedValue;

    function store() external {
        storedValue = FHE.asEuint32(100);
        // Handle stored in contract storage
    }
}
```

### 3. Operations

```solidity
function operate() external {
    // Operations use handles
    euint32 result = FHE.add(value1, value2);
    // New handle generated for result
}
```

### 4. Access

```solidity
function access() external {
    // Grant access via handle
    FHE.allow(storedValue, user);
    // Permission linked to handle
}
```

### 5. Lifetime

Handles exist as long as:
- Contract stores them
- Permissions granted on them
- Operations reference them

## Symbolic Execution

### What Is Symbolic Execution?

Symbolic execution allows FHEVM to track and optimize operations on encrypted values without actually computing them immediately.

### How It Works

```solidity
// Step 1: Create symbolic values
euint32 a = FHE.asEuint32(10);  // Handle: 0xAAA...
euint32 b = FHE.asEuint32(20);  // Handle: 0xBBB...

// Step 2: Symbolic operation
euint32 c = FHE.add(a, b);      // Handle: 0xCCC...

// Step 3: Actual computation deferred
// Result computed when needed (e.g., decryption)
```

### Benefits

1. **Lazy Evaluation**: Compute only when necessary
2. **Optimization**: Combine multiple operations
3. **Gas Savings**: Reduce on-chain computation
4. **Better Performance**: Parallel processing possible

### Example

```solidity
function symbolicExample() external {
    euint32 x = FHE.asEuint32(5);
    euint32 y = FHE.asEuint32(10);
    euint32 z = FHE.asEuint32(15);

    // These create symbolic expressions
    euint32 temp = FHE.add(x, y);      // x + y
    euint32 result = FHE.add(temp, z); // (x + y) + z

    // Actual computation happens later
    // When result is needed (e.g., for decryption)
}
```

## Handle Operations

### Comparing Handles

```solidity
function compareHandles() external view {
    euint32 a = storedValue1;
    euint32 b = storedValue2;

    // This compares the encrypted values, not handles
    ebool isEqual = FHE.eq(a, b);
}
```

### Copying Handles

```solidity
function copyHandle() external {
    euint32 original = FHE.asEuint32(100);

    // This copies the handle reference
    euint32 copy = original;

    // Both refer to same encrypted value
    assert(copy == original); // Same handle
}
```

### New Handles from Operations

```solidity
function newHandles() external {
    euint32 a = FHE.asEuint32(10);
    euint32 b = FHE.asEuint32(20);

    // Creates NEW handle for result
    euint32 c = FHE.add(a, b);

    // c has different handle than a or b
}
```

## Handle Permissions

### Permission System

```solidity
// Each handle has associated permissions
euint32 value = FHE.asEuint32(100);

// Grant permission on handle
FHE.allow(value, user);        // user can access handle
FHE.allowThis(value);          // contract can access handle
FHE.allowTransient(value, user); // temporary access
```

### Permission Inheritance

```solidity
function permissionInheritance() external {
    euint32 a = FHE.asEuint32(10);
    FHE.allow(a, user);

    euint32 b = FHE.asEuint32(20);
    FHE.allow(b, user);

    // New handle from operation
    euint32 c = FHE.add(a, b);

    // c needs its own permissions!
    FHE.allow(c, user);
}
```

## Practical Examples

### Example 1: Balance Tracking

```solidity
contract BalanceTracker {
    // Handles stored in mapping
    mapping(address => euint64) private balances;

    function deposit(externalEuint64 amount, bytes calldata proof) external {
        // Create new handle from input
        euint64 depositAmount = FHE.fromExternal(amount, proof);

        // Generate new handle from operation
        balances[msg.sender] = FHE.add(
            balances[msg.sender],
            depositAmount
        );

        // Grant permissions on new handle
        FHE.allowThis(balances[msg.sender]);
        FHE.allow(balances[msg.sender], msg.sender);
    }
}
```

### Example 2: Multi-Step Computation

```solidity
function computeTotal(
    uint32[] calldata itemIds
) external returns (euint64) {
    euint64 total = FHE.asEuint64(0);

    for (uint i = 0; i < itemIds.length; i++) {
        // Each iteration creates new handle
        euint64 itemValue = getItemValue(itemIds[i]);
        total = FHE.add(total, itemValue);
        // New handle each time
    }

    FHE.allowThis(total);
    return total; // Final handle
}
```

### Example 3: Conditional Selection

```solidity
function selectValue(
    euint32 valueA,
    euint32 valueB,
    ebool condition
) external returns (euint32) {
    // Creates new handle based on condition
    euint32 selected = FHE.select(
        condition,
        valueA,
        valueB
    );

    // selected has unique handle
    FHE.allowThis(selected);
    return selected;
}
```

## Handle Management Best Practices

### 1. Always Grant Permissions

```solidity
✅ function goodPractice() external {
    euint32 value = FHE.asEuint32(100);
    FHE.allowThis(value);           // Contract access
    FHE.allow(value, msg.sender);   // User access
}
```

### 2. Track Handle Updates

```solidity
✅ function trackUpdates() external {
    euint32 oldHandle = storedValue;

    // Operation creates new handle
    euint32 newHandle = FHE.add(oldHandle, FHE.asEuint32(10));

    // Update storage with new handle
    storedValue = newHandle;

    // Grant permissions on new handle
    FHE.allowThis(newHandle);
}
```

### 3. Clean Up Old Handles

```solidity
✅ function cleanup() external {
    // Old handle no longer needed
    delete storedValue;

    // Create new handle
    storedValue = FHE.asEuint32(0);
    FHE.allowThis(storedValue);
}
```

## Common Pitfalls

### ❌ Pitfall 1: Missing Permissions

```solidity
// WRONG
euint32 value = FHE.asEuint32(100);
// Missing: FHE.allowThis(value)
return value; // Will fail!
```

### ❌ Pitfall 2: Forgetting New Handles

```solidity
// WRONG
function badUpdate() external {
    euint32 result = FHE.add(valueA, valueB);
    // Missing: FHE.allowThis(result)
    // result handle has no permissions!
}
```

### ❌ Pitfall 3: Assuming Same Handle

```solidity
// WRONG
function wrongAssumption() external {
    euint32 a = FHE.asEuint32(10);
    euint32 b = FHE.add(a, FHE.asEuint32(0));

    // a and b are DIFFERENT handles!
    // Even though mathematically equal
}
```

## Debugging Handles

### Logging Handle Changes

```solidity
event HandleCreated(string operation);
event HandleUpdated(string from, string to);

function debugHandles() external {
    euint32 a = FHE.asEuint32(10);
    emit HandleCreated("initial");

    euint32 b = FHE.add(a, FHE.asEuint32(5));
    emit HandleUpdated("add", "result");
}
```

### Verifying Permissions

```solidity
function verifyPermissions(euint32 value) external view {
    // Check if contract has access
    // (Implementation depends on FHEVM version)
}
```

## Gas Optimization

### Minimize Handle Creation

```solidity
// Less efficient - creates multiple handles
function inefficient() external {
    euint32 a = FHE.asEuint32(10);
    euint32 b = FHE.add(a, FHE.asEuint32(5));
    euint32 c = FHE.add(b, FHE.asEuint32(3));
    return c;
}

// More efficient - reuse when possible
function efficient() external {
    euint32 result = FHE.asEuint32(10);
    result = FHE.add(result, FHE.asEuint32(5));
    result = FHE.add(result, FHE.asEuint32(3));
    return result;
}
```

### Batch Operations

```solidity
// Better for gas
function batchOperations(
    euint32[] calldata values
) external returns (euint32) {
    euint32 sum = FHE.asEuint32(0);

    for (uint i = 0; i < values.length; i++) {
        sum = FHE.add(sum, values[i]);
    }

    FHE.allowThis(sum);
    return sum; // Single final handle
}
```

## Summary

### Key Points

1. **Handles are references** to encrypted values
2. **Generated automatically** by FHEVM
3. **Unique per operation** (new ops = new handles)
4. **Require permissions** to use
5. **Support symbolic execution** for optimization

### Best Practices

✅ Always grant FHE.allowThis() for new handles
✅ Grant user permissions explicitly
✅ Track handle changes through operations
✅ Clean up unused handles
✅ Optimize handle creation

### Common Mistakes

❌ Forgetting to grant permissions
❌ Assuming operations return same handle
❌ Not updating permissions after operations
❌ Creating excessive handles unnecessarily

---

**Related Concepts**:
- [Encryption](encryption.md)
- [Access Control](access-control.md)
- [Input Proofs](input-proofs.md)
