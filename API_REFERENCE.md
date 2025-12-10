# API Reference

Complete API documentation for all contracts and functions in the FHEVM Example Hub.

## Table of Contents

1. [Confidential Inventory Management](#confidential-inventory-management)
2. [Encrypted Counter](#encrypted-counter)
3. [Encrypted Arithmetic](#encrypted-arithmetic)
4. [FHE Template](#fhe-template)

---

## Confidential Inventory Management

**File**: `contracts/SecretInventoryManagement.sol`
**Type**: Production Example
**Complexity**: Advanced

### Structs

#### InventoryItem
```solidity
struct InventoryItem {
    euint32 quantity;           // Encrypted stock quantity
    euint64 price;              // Encrypted unit price
    euint32 minStockLevel;      // Encrypted minimum stock level
    string itemName;            // Public item name/description
    address supplier;           // Supplier address
    bool isActive;             // Item status
    uint256 createdAt;         // Creation timestamp
    uint256 lastUpdated;       // Last update timestamp
}
```

#### StockOrder
```solidity
struct StockOrder {
    uint32 itemId;             // Item reference
    eaddress requester;        // Encrypted requester address
    euint32 requestedQuantity; // Encrypted requested quantity
    euint64 totalCost;         // Encrypted total cost
    OrderStatus status;        // Order status
    uint256 createdAt;         // Order timestamp
    uint256 processedAt;       // Processing timestamp
}
```

#### SupplierAccess
```solidity
struct SupplierAccess {
    mapping(uint32 => bool) canAccessItem;
    bool isAuthorized;
    uint256 registeredAt;
}
```

### Enums

#### OrderStatus
```solidity
enum OrderStatus {
    Pending,    // 0 - Awaiting processing
    Approved,   // 1 - Approved by manager
    Rejected,   // 2 - Rejected by manager
    Fulfilled,  // 3 - Order fulfilled
    Cancelled   // 4 - Order cancelled
}
```

### State Variables

| Variable | Type | Visibility | Description |
|----------|------|-----------|-------------|
| `owner` | address | public | Contract owner |
| `nextItemId` | uint32 | public | Next item ID counter |
| `nextOrderId` | uint32 | public | Next order ID counter |
| `inventory` | mapping | public | Item storage |
| `orders` | mapping | public | Order storage |
| `suppliers` | mapping | public | Supplier access control |
| `authorizedManagers` | mapping | public | Manager authorization |
| `activeItems` | uint32[] | public | Active item IDs |
| `pendingOrders` | uint32[] | public | Pending order IDs |

### Functions

#### Constructor
```solidity
constructor()
```
**Description**: Initialize contract with owner and counters
**Access**: Public
**Parameters**: None
**Returns**: None

---

#### addInventoryItem

```solidity
function addInventoryItem(
    uint32 _quantity,
    uint64 _price,
    uint32 _minStockLevel,
    string calldata _itemName,
    address _supplier
) external onlyManager
```

**Description**: Add new inventory item with encrypted data

**Parameters**:
- `_quantity` (uint32): Initial stock quantity
- `_price` (uint64): Unit price
- `_minStockLevel` (uint32): Minimum stock threshold
- `_itemName` (string): Item name
- `_supplier` (address): Supplier address

**Returns**: None

**Events Emitted**:
- `ItemAdded(uint32 indexed itemId, string itemName, address indexed supplier)`
- `SupplierAuthorized(address indexed supplier, uint256 timestamp)`

**Reverts**:
- "Not authorized manager" - caller is not manager
- "Invalid supplier" - supplier is zero address
- "Item name required" - empty item name

---

#### updateStock

```solidity
function updateStock(
    uint32 _itemId,
    uint32 _quantityChange,
    bool _isAddition
) external
```

**Description**: Update item stock level

**Parameters**:
- `_itemId` (uint32): Item to update
- `_quantityChange` (uint32): Quantity change amount
- `_isAddition` (bool): True to add, false to subtract

**Returns**: None

**Access Control**:
- Managers: Can add or subtract
- Suppliers: Can only add stock for authorized items

**Events Emitted**:
- `StockUpdated(uint32 indexed itemId, uint256 timestamp)`
- `LowStockAlert(uint32 indexed itemId, uint256 timestamp)`

**Reverts**:
- "Item not active" - item is deactivated
- "Invalid quantity" - zero quantity
- "Not authorized" - caller lacks permissions
- "Suppliers can only add stock" - supplier attempted subtraction

---

#### placeOrder

```solidity
function placeOrder(
    uint32 _itemId,
    uint32 _requestedQuantity
) external
```

**Description**: Place stock order with encrypted details

**Parameters**:
- `_itemId` (uint32): Item to order
- `_requestedQuantity` (uint32): Quantity requested

**Returns**: None

**Features**:
- Encrypts requester address and quantity
- Calculates encrypted total cost
- Grants permissions to order creator

**Events Emitted**:
- `OrderPlaced(uint32 indexed orderId, uint32 indexed itemId, address indexed requester)`

**Reverts**:
- "Item not active" - item is not available
- "Invalid quantity" - zero or invalid quantity

---

#### processOrder

```solidity
function processOrder(
    uint32 _orderId,
    OrderStatus _status
) external onlyManager
```

**Description**: Process pending order (approve/reject)

**Parameters**:
- `_orderId` (uint32): Order ID to process
- `_status` (OrderStatus): New status (Approved or Rejected)

**Returns**: None

**Logic**:
- Only processes Pending orders
- Approved: Deducts stock and marks as Fulfilled
- Rejected: Marks as Rejected, no stock change

**Events Emitted**:
- `OrderProcessed(uint32 indexed orderId, OrderStatus status, uint256 timestamp)`
- `StockUpdated(uint32 indexed itemId, uint256 timestamp)` (if approved)

**Reverts**:
- "Not authorized manager" - caller is not manager
- "Invalid status" - status is neither Approved nor Rejected
- "Order not pending" - order already processed

---

#### grantInventoryAccess

```solidity
function grantInventoryAccess(
    uint32 _itemId,
    address _user
) external onlyManager
```

**Description**: Grant user access to encrypted inventory data

**Parameters**:
- `_itemId` (uint32): Item to grant access to
- `_user` (address): User to grant access

**Returns**: None

**Permissions Granted**:
- Access to quantity
- Access to price
- Access to minStockLevel

**Events Emitted**:
- `AccessGranted(address indexed user, uint32 indexed itemId)`

**Reverts**:
- "Item not active" - item is deactivated

---

#### getItemInfo

```solidity
function getItemInfo(uint32 _itemId)
    external view returns (
        string memory itemName,
        address supplier,
        bool isActive,
        uint256 createdAt,
        uint256 lastUpdated
    )
```

**Description**: Get public item information

**Parameters**:
- `_itemId` (uint32): Item ID to query

**Returns**:
- `itemName` (string): Item name
- `supplier` (address): Supplier address
- `isActive` (bool): Active status
- `createdAt` (uint256): Creation timestamp
- `lastUpdated` (uint256): Last update timestamp

---

#### getOrderInfo

```solidity
function getOrderInfo(uint32 _orderId)
    external view returns (
        uint32 itemId,
        OrderStatus status,
        uint256 createdAt,
        uint256 processedAt
    )
```

**Description**: Get order public information

**Parameters**:
- `_orderId` (uint32): Order ID to query

**Returns**:
- `itemId` (uint32): Item in order
- `status` (OrderStatus): Current status
- `createdAt` (uint256): Creation timestamp
- `processedAt` (uint256): Processing timestamp

---

#### authorizeManager

```solidity
function authorizeManager(address _manager)
    external onlyOwner
```

**Description**: Authorize new manager

**Parameters**:
- `_manager` (address): Manager address

**Returns**: None

**Reverts**:
- "Not authorized" - caller is not owner
- "Invalid address" - zero address

---

#### revokeManagerAuth

```solidity
function revokeManagerAuth(address _manager)
    external onlyOwner
```

**Description**: Revoke manager authorization

**Parameters**:
- `_manager` (address): Manager to revoke

**Returns**: None

**Reverts**:
- "Not authorized" - caller is not owner
- "Cannot revoke owner" - cannot revoke owner authorization

---

#### deactivateItem

```solidity
function deactivateItem(uint32 _itemId)
    external onlyManager
```

**Description**: Deactivate inventory item

**Parameters**:
- `_itemId` (uint32): Item to deactivate

**Returns**: None

---

#### getActiveItemsCount

```solidity
function getActiveItemsCount()
    external view returns (uint256)
```

**Description**: Get count of active items

**Parameters**: None

**Returns**:
- `uint256`: Number of active items

---

#### getPendingOrdersCount

```solidity
function getPendingOrdersCount()
    external view returns (uint256)
```

**Description**: Get count of pending orders

**Parameters**: None

**Returns**:
- `uint256`: Number of pending orders

---

#### emergencyPause

```solidity
function emergencyPause()
    external onlyOwner
```

**Description**: Emergency pause - deactivate all items

**Parameters**: None

**Returns**: None

**Reverts**:
- "Not authorized" - caller is not owner

---

#### getContractStats

```solidity
function getContractStats()
    external view returns (
        uint32 totalItems,
        uint32 totalOrders,
        uint256 activeItemsCount,
        uint256 pendingOrdersCount
    )
```

**Description**: Get contract statistics

**Parameters**: None

**Returns**:
- `totalItems` (uint32): Total items created
- `totalOrders` (uint32): Total orders created
- `activeItemsCount` (uint256): Currently active items
- `pendingOrdersCount` (uint256): Currently pending orders

---

### Events

#### ItemAdded
```solidity
event ItemAdded(
    uint32 indexed itemId,
    string itemName,
    address indexed supplier
)
```

#### StockUpdated
```solidity
event StockUpdated(
    uint32 indexed itemId,
    uint256 timestamp
)
```

#### OrderPlaced
```solidity
event OrderPlaced(
    uint32 indexed orderId,
    uint32 indexed itemId,
    address indexed requester
)
```

#### OrderProcessed
```solidity
event OrderProcessed(
    uint32 indexed orderId,
    OrderStatus status,
    uint256 timestamp
)
```

#### SupplierAuthorized
```solidity
event SupplierAuthorized(
    address indexed supplier,
    uint256 timestamp
)
```

#### LowStockAlert
```solidity
event LowStockAlert(
    uint32 indexed itemId,
    uint256 timestamp
)
```

#### AccessGranted
```solidity
event AccessGranted(
    address indexed user,
    uint32 indexed itemId
)
```

---

## Encrypted Counter

**File**: `examples/EncryptedCounter.sol`
**Type**: Basic Example
**Complexity**: Beginner

### Functions

#### constructor()
Initialize counter to zero

#### getCounter() → euint32
Get encrypted counter value

#### increment(externalEuint32 amount, bytes calldata inputProof)
Add encrypted amount to counter

#### decrement(externalEuint32 amount, bytes calldata inputProof)
Subtract encrypted amount from counter

#### grantAccess(address user)
Grant user access to counter

---

## Encrypted Arithmetic

**File**: `examples/EncryptedArithmetic.sol`
**Type**: Intermediate Example
**Complexity**: Intermediate

### Functions

#### constructor()
Initialize values to zero

#### setValue1(externalEuint32 val, bytes calldata inputProof)
Set first encrypted value

#### setValue2(externalEuint32 val, bytes calldata inputProof)
Set second encrypted value

#### add()
Add two encrypted values

#### subtract()
Subtract two encrypted values

#### multiply()
Multiply two encrypted values

#### getProduct() → euint64
Get multiplication result

---

## FHE Template

**File**: `base-template/contracts/FHETemplate.sol`
**Type**: Template
**Complexity**: Beginner

### Functions

#### constructor()
Initialize encrypted value

#### getValue() → euint32
Get encrypted value

#### setValue(externalEuint32 newValue, bytes calldata inputProof)
Set new encrypted value

---

## Modifiers

### onlyOwner
Restricts function to contract owner

### onlyManager
Restricts function to owner or authorized managers

### onlySupplier(uint32 itemId)
Restricts function to authorized suppliers for specific item

---

## Error Messages

| Error | Cause |
|-------|-------|
| "Not authorized" | Caller lacks required permissions |
| "Not authorized manager" | Caller is not owner or manager |
| "Not authorized supplier" | Caller is not authorized supplier |
| "Invalid supplier" | Supplier address is zero |
| "Item name required" | Item name is empty string |
| "Item not active" | Item has been deactivated |
| "Invalid quantity" | Quantity is zero or invalid |
| "Suppliers can only add stock" | Supplier attempted to subtract stock |
| "Order not pending" | Order status is not Pending |
| "Invalid status" | Status is not Approved or Rejected |
| "Cannot revoke owner" | Attempting to revoke owner authorization |

---

## Data Types Used

### FHEVM Types
- **euint32**: 32-bit encrypted unsigned integer
- **euint64**: 64-bit encrypted unsigned integer
- **eaddress**: Encrypted Ethereum address

### Standard Types
- **uint32, uint64, uint256**: Unsigned integers
- **address**: Ethereum address
- **bool**: Boolean value
- **string**: Text string
- **mapping**: Hash map for storage

---

## Gas Considerations

### Operations Cost (Approximate)
- FHE.add(): ~2000 gas
- FHE.sub(): ~2000 gas
- FHE.mul(): ~3000 gas
- FHE.allow(): ~500 gas
- FHE.allowThis(): ~300 gas

### Storage Cost
- euint32: ~32 bytes
- euint64: ~64 bytes
- String: Variable

---

## Security Notes

1. Always grant FHE.allowThis() after creating/modifying encrypted values
2. Grant FHE.allow() for users who need access
3. Validate input parameters before operations
4. Use proper access control modifiers
5. Check function requirements before calling
6. Emit events for audit trails

---

## Usage Examples

### Creating an Item
```solidity
contract.addInventoryItem(
    100,              // quantity
    1000,             // price
    10,               // minStockLevel
    "Laptop",         // itemName
    supplierAddress   // supplier
);
```

### Placing an Order
```solidity
contract.placeOrder(
    1,    // itemId
    5     // requestedQuantity
);
```

### Processing an Order
```solidity
contract.processOrder(
    1,                          // orderId
    OrderStatus.Approved        // status
);
```

---

**Version**: 1.0.0
**Last Updated**: December 2025
**License**: BSD-3-Clause-Clear
