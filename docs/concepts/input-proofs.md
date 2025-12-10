# Input Proofs in FHEVM

Understanding input proofs and why they're necessary for encrypted operations.

## What Are Input Proofs?

Input proofs are cryptographic proofs that validate encrypted inputs to smart contracts. They ensure that the encrypted value was created correctly and hasn't been tampered with.

## Why Are They Needed?

### Security
Without proofs, anyone could send invalid encrypted data that could break the contract logic or expose information.

### Validation
Proofs ensure the encrypted value matches the claimed plaintext value without revealing it.

### Trust
The contract can verify inputs without trusting the sender.

## How They Work

### Client Side
```javascript
// User encrypts their input
const encryptedValue = await encrypt(100);

// Generate proof that encryption is valid
const proof = await generateProof(100, encryptedValue);

// Send both to contract
await contract.setValue(encryptedValue, proof);
```

### Contract Side
```solidity
function setValue(
    externalEuint32 encryptedValue,
    bytes calldata inputProof
) external {
    // Verify proof and import value
    euint32 value = FHE.fromExternal(encryptedValue, inputProof);

    // Now safe to use
    storedValue = value;
    FHE.allowThis(value);
}
```

## Basic Usage

### Standard Pattern

```solidity
function updateValue(
    externalEuint32 newValue,
    bytes calldata proof
) external {
    // Step 1: Verify and import
    euint32 verified = FHE.fromExternal(newValue, proof);

    // Step 2: Use the verified value
    currentValue = verified;

    // Step 3: Grant permissions
    FHE.allowThis(verified);
    FHE.allow(verified, msg.sender);
}
```

### Multiple Values

```solidity
function updateMultiple(
    externalEuint32 value1,
    bytes calldata proof1,
    externalEuint32 value2,
    bytes calldata proof2
) external {
    euint32 v1 = FHE.fromExternal(value1, proof1);
    euint32 v2 = FHE.fromExternal(value2, proof2);

    // Use both values
    result = FHE.add(v1, v2);

    FHE.allowThis(result);
}
```

## Real-World Examples

### Placing an Order

```solidity
function placeOrder(
    uint32 itemId,
    externalEuint32 encryptedQuantity,
    bytes calldata quantityProof
) external {
    // Verify quantity input
    euint32 quantity = FHE.fromExternal(
        encryptedQuantity,
        quantityProof
    );

    // Calculate cost
    euint64 totalCost = FHE.mul(
        FHE.asEuint64(quantity),
        items[itemId].price
    );

    // Store order
    orders[orderId] = Order({
        itemId: itemId,
        quantity: quantity,
        totalCost: totalCost,
        requester: msg.sender
    });

    // Grant permissions
    FHE.allowThis(quantity);
    FHE.allowThis(totalCost);
    FHE.allow(quantity, msg.sender);
    FHE.allow(totalCost, msg.sender);
}
```

### Updating Balance

```solidity
function deposit(
    externalEuint64 encryptedAmount,
    bytes calldata amountProof
) external {
    // Verify deposit amount
    euint64 amount = FHE.fromExternal(
        encryptedAmount,
        amountProof
    );

    // Update balance
    balances[msg.sender] = FHE.add(
        balances[msg.sender],
        amount
    );

    // Grant permissions
    FHE.allowThis(balances[msg.sender]);
    FHE.allow(balances[msg.sender], msg.sender);
}
```

## Proof Generation (Client-Side)

### Using FHEVM SDK

```typescript
import { createInstance } from '@fhevm/sdk';

// Initialize FHEVM instance
const instance = await createInstance({
    network: 'sepolia',
    gatewayUrl: '...'
});

// Encrypt value with proof
const { ciphertext, proof } = await instance.encrypt32(100);

// Send to contract
await contract.setValue(ciphertext, proof);
```

### Handling Multiple Values

```typescript
// Encrypt multiple values
const qty = await instance.encrypt32(10);
const price = await instance.encrypt64(1000);

// Send both with proofs
await contract.createOrder(
    qty.ciphertext,
    qty.proof,
    price.ciphertext,
    price.proof
);
```

## Common Patterns

### Pattern 1: Single Input Validation

```solidity
modifier validatedInput(
    externalEuint32 encrypted,
    bytes calldata proof
) {
    euint32 value = FHE.fromExternal(encrypted, proof);
    _;
}

function myFunction(
    externalEuint32 input,
    bytes calldata proof
) external validatedInput(input, proof) {
    // Input is validated
}
```

### Pattern 2: Batch Validation

```solidity
function validateInputs(
    externalEuint32[] calldata encrypted,
    bytes[] calldata proofs
) internal returns (euint32[] memory) {
    require(encrypted.length == proofs.length, "Length mismatch");

    euint32[] memory validated = new euint32[](encrypted.length);

    for (uint i = 0; i < encrypted.length; i++) {
        validated[i] = FHE.fromExternal(encrypted[i], proofs[i]);
    }

    return validated;
}
```

### Pattern 3: Conditional Validation

```solidity
function conditionalUpdate(
    externalEuint32 newValue,
    bytes calldata proof,
    bool shouldValidate
) external {
    euint32 value;

    if (shouldValidate) {
        value = FHE.fromExternal(newValue, proof);
    } else {
        // Use existing value
        value = currentValue;
    }

    // Continue with value
}
```

## Error Handling

### Invalid Proof

```solidity
function safeUpdate(
    externalEuint32 input,
    bytes calldata proof
) external {
    try {
        euint32 value = FHE.fromExternal(input, proof);
        currentValue = value;
        FHE.allowThis(value);
    } catch {
        // Handle invalid proof
        revert("Invalid input proof");
    }
}
```

### Proof Validation Check

```solidity
function validateBeforeUse(
    externalEuint32 input,
    bytes calldata proof
) external returns (bool) {
    // Attempt validation
    try {
        FHE.fromExternal(input, proof);
        return true;
    } catch {
        return false;
    }
}
```

## Anti-Patterns

### ❌ Don't: Skip Proof Validation

```solidity
// WRONG - No proof validation
function unsafeSet(externalEuint32 value) external {
    storedValue = value; // DANGEROUS!
}
```

### ❌ Don't: Reuse Proofs

```solidity
// WRONG - Proof is for specific value
function wrongReuse(
    externalEuint32 value1,
    bytes calldata proof
) external {
    euint32 v1 = FHE.fromExternal(value1, proof);
    // Can't reuse same proof for different value!
}
```

### ❌ Don't: Ignore Proof Errors

```solidity
// WRONG - Should handle errors
function ignoreErrors(
    externalEuint32 value,
    bytes calldata proof
) external {
    euint32 v = FHE.fromExternal(value, proof);
    // What if proof is invalid? No error handling!
    storedValue = v;
}
```

## Best Practices

### 1. Always Validate

```solidity
✅ function setValue(externalEuint32 val, bytes calldata proof) external {
    euint32 validated = FHE.fromExternal(val, proof);
    // Use validated value
}
```

### 2. Handle Errors

```solidity
✅ function safeSetValue(...) external {
    try {
        euint32 val = FHE.fromExternal(...);
    } catch {
        revert("Invalid proof");
    }
}
```

### 3. Document Requirements

```solidity
✅ /**
 * @notice Set value with proof validation
 * @param encryptedValue The encrypted value
 * @param proof Cryptographic proof of encryption validity
 */
function setValue(externalEuint32 encryptedValue, bytes calldata proof) external {
    // Implementation
}
```

### 4. Validate Before Operations

```solidity
✅ function compute(
    externalEuint32 input,
    bytes calldata proof
) external {
    // Validate first
    euint32 validated = FHE.fromExternal(input, proof);

    // Then compute
    result = FHE.add(currentValue, validated);
}
```

## Testing Input Proofs

```typescript
describe("Input Proof Validation", function () {
    it("should accept valid proof", async function () {
        const { ciphertext, proof } = await encrypt(100);

        await expect(
            contract.setValue(ciphertext, proof)
        ).to.not.be.reverted;
    });

    it("should reject invalid proof", async function () {
        const { ciphertext } = await encrypt(100);
        const invalidProof = "0x00";

        await expect(
            contract.setValue(ciphertext, invalidProof)
        ).to.be.reverted;
    });

    it("should reject mismatched proof", async function () {
        const value1 = await encrypt(100);
        const value2 = await encrypt(200);

        // Use proof from value2 with ciphertext from value1
        await expect(
            contract.setValue(value1.ciphertext, value2.proof)
        ).to.be.reverted;
    });
});
```

## Security Considerations

1. **Always require proofs** for external encrypted inputs
2. **Never skip validation** even if you trust the sender
3. **Handle proof errors** gracefully
4. **Log validation failures** for monitoring
5. **Rate limit** validation attempts to prevent DoS

## Performance Impact

Input proof validation adds gas cost:
- Proof verification: ~50,000 gas
- Worth it for security
- Cache validated values when possible

## Summary

✅ **DO**:
- Always use FHE.fromExternal() with proofs
- Handle validation errors
- Document proof requirements
- Test with invalid proofs

❌ **DON'T**:
- Skip proof validation
- Reuse proofs
- Ignore validation errors
- Trust unverified inputs

---

**Related Concepts**:
- [Encryption](encryption.md)
- [Access Control](access-control.md)
- [Handle Management](handles.md)
