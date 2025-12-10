# Access Control Concepts

Understanding access control patterns in FHEVM contracts.

## Overview

Access control determines who can execute which functions and access what data. In FHEVM contracts, access control becomes even more critical because encrypted data requires explicit permission grants.

## Key Concepts

### 1. Traditional Access Control

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}

function restrictedFunction() external onlyOwner {
    // Only owner can call
}
```

### 2. FHE Permission System

```solidity
// Grant access to encrypted value
FHE.allow(encryptedValue, userAddress);

// Grant contract access
FHE.allowThis(encryptedValue);
```

### 3. Combined Pattern

```solidity
function grantAccess(address user) external onlyOwner {
    // Traditional access control
    require(authorizedUsers[user], "User not authorized");

    // FHE permission grant
    FHE.allow(encryptedData, user);
}
```

## Role-Based Access Control (RBAC)

### Three-Tier System

1. **Owner**: Full administrative control
2. **Manager**: Operational control
3. **User**: Limited operations

### Implementation

```solidity
address public owner;
mapping(address => bool) public managers;
mapping(address => bool) public users;

modifier onlyOwner() {
    require(msg.sender == owner);
    _;
}

modifier onlyManager() {
    require(msg.sender == owner || managers[msg.sender]);
    _;
}

modifier onlyUser() {
    require(users[msg.sender]);
    _;
}
```

## Permission Propagation

### Why It's Needed

Encrypted values need explicit permissions:

```solidity
// Create encrypted value
euint32 value = FHE.asEuint32(100);

// Without these, nobody can access:
FHE.allowThis(value);      // Contract can use it
FHE.allow(value, user);    // User can decrypt it
```

### Best Practices

1. **Always grant contract access**
   ```solidity
   FHE.allowThis(encryptedValue);
   ```

2. **Grant user access when appropriate**
   ```solidity
   FHE.allow(encryptedValue, msg.sender);
   ```

3. **Don't over-grant permissions**
   ```solidity
   // Only grant to authorized users
   if (isAuthorized(user)) {
       FHE.allow(encryptedValue, user);
   }
   ```

## Real-World Example

From SecretInventoryManagement:

```solidity
function addInventoryItem(
    uint32 _quantity,
    uint64 _price,
    uint32 _minStockLevel,
    string calldata _itemName,
    address _supplier
) external onlyManager {
    // Traditional access control: only managers

    // Create encrypted values
    euint32 encryptedQuantity = FHE.asEuint32(_quantity);
    euint64 encryptedPrice = FHE.asEuint64(_price);

    // Grant permissions
    FHE.allowThis(encryptedQuantity);
    FHE.allowThis(encryptedPrice);
    FHE.allow(encryptedQuantity, _supplier);
    FHE.allow(encryptedPrice, _supplier);
}
```

## Common Patterns

### Per-Item Authorization

```solidity
struct Item {
    euint32 value;
    mapping(address => bool) authorized;
}

function grantItemAccess(uint itemId, address user) external onlyOwner {
    items[itemId].authorized[user] = true;
    FHE.allow(items[itemId].value, user);
}
```

### Time-Limited Access

```solidity
mapping(address => uint256) public accessExpiry;

modifier hasValidAccess() {
    require(block.timestamp < accessExpiry[msg.sender]);
    _;
}
```

### Multi-Signature Control

```solidity
mapping(bytes32 => uint) public approvals;
uint public required = 2;

function approveAction(bytes32 actionHash) external {
    approvals[actionHash]++;
}

function executeAction() external {
    require(approvals[keccak256(...)] >= required);
    // Execute
}
```

## Anti-Patterns

### ❌ Don't: Forget FHE.allowThis()

```solidity
// WRONG
euint32 value = FHE.asEuint32(100);
// Missing: FHE.allowThis(value)
return value; // Will fail!
```

### ❌ Don't: Grant Access Without Checks

```solidity
// WRONG
function grantAccess(address user) external {
    FHE.allow(sensitiveData, user); // Anyone can call!
}

// CORRECT
function grantAccess(address user) external onlyOwner {
    require(authorizedUsers[user]);
    FHE.allow(sensitiveData, user);
}
```

### ❌ Don't: Over-Grant Permissions

```solidity
// WRONG
function createValue(uint32 val) external {
    euint32 encrypted = FHE.asEuint32(val);

    // Grants to everyone!
    for (uint i = 0; i < users.length; i++) {
        FHE.allow(encrypted, users[i]);
    }
}
```

## Security Considerations

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Regular Audits**: Review access control regularly
3. **Clear Roles**: Define roles clearly
4. **Revocation**: Implement way to revoke access
5. **Logging**: Emit events for access changes

## Testing Access Control

```typescript
it("should restrict to authorized users", async function () {
    // Try unauthorized access
    await expect(
        contract.connect(unauthorized).restrictedFunction()
    ).to.be.revertedWith("Not authorized");

    // Grant authorization
    await contract.connect(owner).authorize(user);

    // Should work now
    await contract.connect(user).restrictedFunction();
});
```

## Best Practices Summary

1. ✅ Use modifiers for role checks
2. ✅ Always call FHE.allowThis()
3. ✅ Grant user access explicitly
4. ✅ Validate before granting
5. ✅ Emit events for auditing
6. ✅ Test all access paths
7. ✅ Document permissions clearly
8. ✅ Implement revocation mechanism

---

**Related Concepts**:
- [Input Proofs](input-proofs.md)
- [Handle Management](handles.md)
- [Encryption Patterns](encryption.md)
