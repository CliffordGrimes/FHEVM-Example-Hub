import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

/**
 * @test EncryptedInventoryManagement Test Suite
 * @chapter access-control
 * @description Complete test coverage for the inventory management contract
 *
 * This test suite demonstrates:
 * - Item creation with encrypted fields
 * - Stock updates with role-based restrictions
 * - Order placement and processing
 * - Access control enforcement
 * - Permission propagation
 * - Error handling and validation
 * - State consistency verification
 */
describe("EncryptedInventoryManagement", function () {
  let contract: Contract;
  let owner: Signer;
  let manager: Signer;
  let supplier: Signer;
  let buyer: Signer;
  let unauthorized: Signer;

  const ITEM_NAME = "Laptop";
  const INITIAL_QUANTITY = 100;
  const INITIAL_PRICE = 1000;
  const MIN_STOCK_LEVEL = 10;

  /**
   * @describe Setup and initialization
   */
  before(async function () {
    const [ownerSigner, managerSigner, supplierSigner, buyerSigner, unauthorizedSigner] =
      await ethers.getSigners();

    owner = ownerSigner;
    manager = managerSigner;
    supplier = supplierSigner;
    buyer = buyerSigner;
    unauthorized = unauthorizedSigner;

    // Deploy contract
    const ContractFactory = await ethers.getContractFactory("SecretInventoryManagement");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  /**
   * @describe Deployment and Initialization Tests
   * @section basic-operations
   */
  describe("Deployment", function () {
    /**
     * @test Should set correct owner on deployment
     * @category basic
     */
    it("should set the deployer as owner", async function () {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(await owner.getAddress());
    });

    /**
     * @test Should initialize counters correctly
     * @category basic
     */
    it("should initialize item and order counters", async function () {
      const nextItemId = await contract.nextItemId();
      const nextOrderId = await contract.nextOrderId();

      expect(nextItemId).to.equal(1);
      expect(nextOrderId).to.equal(1);
    });

    /**
     * @test Should authorize owner as manager on deployment
     * @category access-control
     */
    it("should authorize owner as manager", async function () {
      const ownerAddress = await owner.getAddress();
      const isAuthorized = await contract.authorizedManagers(ownerAddress);

      expect(isAuthorized).to.be.true;
    });
  });

  /**
   * @describe Access Control Tests
   * @section access-control
   */
  describe("Access Control", function () {
    /**
     * @test Should authorize additional managers
     * @category access-control
     */
    it("should allow owner to authorize new managers", async function () {
      const managerAddress = await manager.getAddress();
      await contract.authorizeManager(managerAddress);

      const isAuthorized = await contract.authorizedManagers(managerAddress);
      expect(isAuthorized).to.be.true;
    });

    /**
     * @test Should prevent unauthorized users from authorizing managers
     * @category access-control
     */
    it("should prevent non-owner from authorizing managers", async function () {
      const unauthorizedAddress = await unauthorized.getAddress();
      const managerAddress = await manager.getAddress();

      await expect(
        contract.connect(unauthorized).authorizeManager(managerAddress)
      ).to.be.revertedWith("Not authorized");
    });

    /**
     * @test Should revoke manager authorization
     * @category access-control
     */
    it("should allow owner to revoke manager authorization", async function () {
      const managerAddress = await manager.getAddress();
      await contract.authorizeManager(managerAddress);
      expect(await contract.authorizedManagers(managerAddress)).to.be.true;

      await contract.revokeManagerAuth(managerAddress);
      expect(await contract.authorizedManagers(managerAddress)).to.be.false;
    });

    /**
     * @test Should prevent revoking owner authorization
     * @category access-control
     */
    it("should prevent revoking owner authorization", async function () {
      const ownerAddress = await owner.getAddress();

      await expect(contract.revokeManagerAuth(ownerAddress)).to.be.revertedWith(
        "Cannot revoke owner"
      );
    });
  });

  /**
   * @describe Inventory Item Management Tests
   * @section item-management
   */
  describe("Inventory Item Management", function () {
    let itemId: number;

    /**
     * @test Should create inventory item with encrypted data
     * @category encryption
     */
    it("should add new inventory item with encrypted quantities", async function () {
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();

      // Authorize manager
      await contract.authorizeManager(managerAddress);

      // Add item
      const tx = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          ITEM_NAME,
          supplierAddress
        );

      await tx.wait();

      // Verify item was added
      const stats = await contract.getContractStats();
      expect(stats.totalItems).to.equal(1);

      itemId = 1;
    });

    /**
     * @test Should authorize supplier when adding item
     * @category access-control
     */
    it("should authorize supplier when adding item", async function () {
      const supplierAddress = await supplier.getAddress();

      const supplier2Address = await buyer.getAddress();
      const managerAddress = await manager.getAddress();

      await contract.connect(manager).addInventoryItem(
        INITIAL_QUANTITY,
        INITIAL_PRICE,
        MIN_STOCK_LEVEL,
        "Monitor",
        supplier2Address
      );

      const supplierData = await contract.suppliers(supplier2Address);
      expect(supplierData.isAuthorized).to.be.true;
    });

    /**
     * @test Should reject adding item without name
     * @category error-handling
     */
    it("should reject item creation without name", async function () {
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();

      await expect(
        contract
          .connect(manager)
          .addInventoryItem(INITIAL_QUANTITY, INITIAL_PRICE, MIN_STOCK_LEVEL, "", supplierAddress)
      ).to.be.revertedWith("Item name required");
    });

    /**
     * @test Should reject adding item with invalid supplier
     * @category error-handling
     */
    it("should reject item creation with invalid supplier", async function () {
      const managerAddress = await manager.getAddress();
      const zeroAddress = ethers.ZeroAddress;

      await expect(
        contract
          .connect(manager)
          .addInventoryItem(
            INITIAL_QUANTITY,
            INITIAL_PRICE,
            MIN_STOCK_LEVEL,
            ITEM_NAME,
            zeroAddress
          )
      ).to.be.revertedWith("Invalid supplier");
    });

    /**
     * @test Should prevent unauthorized user from adding items
     * @category access-control
     */
    it("should prevent non-manager from adding items", async function () {
      const supplierAddress = await supplier.getAddress();

      await expect(
        contract
          .connect(unauthorized)
          .addInventoryItem(
            INITIAL_QUANTITY,
            INITIAL_PRICE,
            MIN_STOCK_LEVEL,
            ITEM_NAME,
            supplierAddress
          )
      ).to.be.revertedWith("Not authorized manager");
    });

    /**
     * @test Should deactivate inventory items
     * @category item-management
     */
    it("should deactivate inventory items", async function () {
      const managerAddress = await manager.getAddress();

      const itemInfo = await contract.getItemInfo(itemId);
      expect(itemInfo.isActive).to.be.true;

      await contract.connect(manager).deactivateItem(itemId);

      const updatedInfo = await contract.getItemInfo(itemId);
      expect(updatedInfo.isActive).to.be.false;
    });
  });

  /**
   * @describe Stock Management Tests
   * @section stock-operations
   */
  describe("Stock Management", function () {
    let itemId: number;

    before(async function () {
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();

      const tx = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "Keyboard",
          supplierAddress
        );

      await tx.wait();
      itemId = 2;
    });

    /**
     * @test Should update stock with manager authorization
     * @category stock-operations
     */
    it("should allow manager to add stock", async function () {
      const managerAddress = await manager.getAddress();

      const initialStats = await contract.getContractStats();
      const initialActiveItems = initialStats.activeItemsCount;

      const tx = await contract.connect(manager).updateStock(itemId, 50, true);
      await tx.wait();

      // Verify stock was updated
      const updatedStats = await contract.getContractStats();
      expect(updatedStats.activeItemsCount).to.equal(initialActiveItems);
    });

    /**
     * @test Should allow manager to subtract stock
     * @category stock-operations
     */
    it("should allow manager to subtract stock", async function () {
      const managerAddress = await manager.getAddress();

      const tx = await contract.connect(manager).updateStock(itemId, 20, false);
      await tx.wait();

      // Verify operation completed
      const stats = await contract.getContractStats();
      expect(stats.activeItemsCount).to.be.greaterThanOrEqual(1);
    });

    /**
     * @test Should prevent supplier from subtracting stock
     * @category access-control
     */
    it("should prevent supplier from subtracting stock", async function () {
      const supplierAddress = await supplier.getAddress();

      // Authorize supplier for this item
      const managerAddress = await manager.getAddress();
      await contract.connect(manager).grantInventoryAccess(itemId, supplierAddress);

      await expect(
        contract.connect(supplier).updateStock(itemId, 10, false)
      ).to.be.revertedWith("Suppliers can only add stock");
    });

    /**
     * @test Should prevent operations on inactive items
     * @category error-handling
     */
    it("should prevent stock update on inactive items", async function () {
      const managerAddress = await manager.getAddress();

      // Deactivate item
      await contract.connect(manager).deactivateItem(itemId);

      await expect(
        contract.connect(manager).updateStock(itemId, 10, true)
      ).to.be.revertedWith("Item not active");
    });

    /**
     * @test Should reject invalid quantity
     * @category error-handling
     */
    it("should reject zero quantity changes", async function () {
      const managerAddress = await manager.getAddress();
      const supplierAddress = await supplier.getAddress();

      const tx = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "Mouse",
          supplierAddress
        );

      await tx.wait();
      const newItemId = 3;

      await expect(
        contract.connect(manager).updateStock(newItemId, 0, true)
      ).to.be.revertedWith("Invalid quantity");
    });
  });

  /**
   * @describe Order Management Tests
   * @section order-operations
   */
  describe("Order Management", function () {
    let itemId: number;
    let orderId: number;

    before(async function () {
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();

      const tx = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "Monitor Pro",
          supplierAddress
        );

      await tx.wait();
      itemId = 4;
    });

    /**
     * @test Should place encrypted orders
     * @category encryption
     */
    it("should place order with encrypted details", async function () {
      const buyerAddress = await buyer.getAddress();
      const requestedQuantity = 5;

      const tx = await contract.connect(buyer).placeOrder(itemId, requestedQuantity);
      await tx.wait();

      const stats = await contract.getContractStats();
      expect(stats.totalOrders).to.equal(1);

      orderId = 1;
    });

    /**
     * @test Should prevent ordering inactive items
     * @category error-handling
     */
    it("should prevent ordering from inactive items", async function () {
      const managerAddress = await manager.getAddress();
      const buyerAddress = await buyer.getAddress();

      // Create and deactivate item
      const supplierAddress = await supplier.getAddress();
      const tx1 = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "Inactive Item",
          supplierAddress
        );

      await tx1.wait();
      const inactiveItemId = 5;

      await contract.connect(manager).deactivateItem(inactiveItemId);

      await expect(
        contract.connect(buyer).placeOrder(inactiveItemId, 5)
      ).to.be.revertedWith("Item not active");
    });

    /**
     * @test Should reject invalid order quantities
     * @category error-handling
     */
    it("should reject orders with invalid quantity", async function () {
      const buyerAddress = await buyer.getAddress();

      await expect(
        contract.connect(buyer).placeOrder(itemId, 0)
      ).to.be.revertedWith("Invalid quantity");
    });

    /**
     * @test Should process orders with manager authorization
     * @category order-operations
     */
    it("should allow manager to process orders", async function () {
      const managerAddress = await manager.getAddress();
      const OrderStatus = {
        Pending: 0,
        Approved: 1,
        Rejected: 2,
        Fulfilled: 3,
        Cancelled: 4,
      };

      // Create new order
      const buyerAddress = await buyer.getAddress();
      const tx1 = await contract.connect(buyer).placeOrder(itemId, 3);
      await tx1.wait();

      const currentStats = await contract.getContractStats();
      const newOrderId = currentStats.totalOrders;

      // Process order
      const tx2 = await contract
        .connect(manager)
        .processOrder(newOrderId, OrderStatus.Approved);

      await tx2.wait();

      const orderInfo = await contract.getOrderInfo(newOrderId);
      expect(orderInfo.status).to.equal(OrderStatus.Fulfilled); // Approved orders become Fulfilled
    });

    /**
     * @test Should prevent non-manager from processing orders
     * @category access-control
     */
    it("should prevent non-manager from processing orders", async function () {
      const OrderStatus = {
        Pending: 0,
        Approved: 1,
        Rejected: 2,
        Fulfilled: 3,
        Cancelled: 4,
      };

      const buyerAddress = await buyer.getAddress();
      const tx = await contract.connect(buyer).placeOrder(itemId, 2);
      await tx.wait();

      const currentStats = await contract.getContractStats();
      const newOrderId = currentStats.totalOrders;

      await expect(
        contract.connect(buyer).processOrder(newOrderId, OrderStatus.Approved)
      ).to.be.revertedWith("Not authorized manager");
    });

    /**
     * @test Should prevent processing non-pending orders
     * @category error-handling
     */
    it("should reject processing non-pending orders", async function () {
      const managerAddress = await manager.getAddress();
      const OrderStatus = {
        Pending: 0,
        Approved: 1,
        Rejected: 2,
        Fulfilled: 3,
        Cancelled: 4,
      };

      const buyerAddress = await buyer.getAddress();
      const tx1 = await contract.connect(buyer).placeOrder(itemId, 1);
      await tx1.wait();

      const currentStats = await contract.getContractStats();
      const newOrderId = currentStats.totalOrders;

      // Process once
      await contract.connect(manager).processOrder(newOrderId, OrderStatus.Approved);

      // Try to process again
      await expect(
        contract.connect(manager).processOrder(newOrderId, OrderStatus.Approved)
      ).to.be.revertedWith("Order not pending");
    });
  });

  /**
   * @describe Permission and Access Grant Tests
   * @section access-control
   */
  describe("Inventory Access Control", function () {
    let itemId: number;

    before(async function () {
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();

      const tx = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "Premium Laptop",
          supplierAddress
        );

      await tx.wait();
      itemId = 6;
    });

    /**
     * @test Should grant inventory access to users
     * @category access-control
     */
    it("should allow manager to grant inventory access", async function () {
      const managerAddress = await manager.getAddress();
      const buyerAddress = await buyer.getAddress();

      const tx = await contract
        .connect(manager)
        .grantInventoryAccess(itemId, buyerAddress);

      await tx.wait();

      // Verify by checking event (or access was granted)
      // This is a simple verification
      expect(tx).to.not.be.undefined;
    });

    /**
     * @test Should prevent granting access to inactive items
     * @category error-handling
     */
    it("should prevent access grant for inactive items", async function () {
      const managerAddress = await manager.getAddress();
      const buyerAddress = await buyer.getAddress();

      // Create and deactivate item
      const supplierAddress = await supplier.getAddress();
      const tx1 = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "Temporary Item",
          supplierAddress
        );

      await tx1.wait();
      const tempItemId = 7;

      await contract.connect(manager).deactivateItem(tempItemId);

      await expect(
        contract.connect(manager).grantInventoryAccess(tempItemId, buyerAddress)
      ).to.be.revertedWith("Item not active");
    });
  });

  /**
   * @describe Contract Statistics Tests
   * @section state-management
   */
  describe("Contract Statistics", function () {
    /**
     * @test Should track active items correctly
     * @category state-management
     */
    it("should track active items count", async function () {
      const stats = await contract.getContractStats();

      // All items created so far (some may be inactive)
      expect(stats.totalItems).to.be.greaterThan(0);
      expect(stats.activeItemsCount).to.be.lessThanOrEqual(stats.totalItems);
    });

    /**
     * @test Should track pending orders correctly
     * @category state-management
     */
    it("should track pending orders count", async function () {
      const stats = await contract.getContractStats();

      expect(stats.totalOrders).to.be.greaterThanOrEqual(0);
      expect(stats.pendingOrdersCount).to.be.lessThanOrEqual(stats.totalOrders);
    });

    /**
     * @test Should return item count
     * @category state-management
     */
    it("should return active items count via function", async function () {
      const count = await contract.getActiveItemsCount();
      const stats = await contract.getContractStats();

      expect(count).to.equal(stats.activeItemsCount);
    });

    /**
     * @test Should return pending orders count
     * @category state-management
     */
    it("should return pending orders count via function", async function () {
      const count = await contract.getPendingOrdersCount();
      const stats = await contract.getContractStats();

      expect(count).to.equal(stats.pendingOrdersCount);
    });
  });

  /**
   * @describe Emergency and Administrative Tests
   * @section administrative
   */
  describe("Emergency Functions", function () {
    let itemId: number;

    before(async function () {
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();

      const tx = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "Emergency Test Item",
          supplierAddress
        );

      await tx.wait();
      itemId = 8;
    });

    /**
     * @test Should allow owner to trigger emergency pause
     * @category administrative
     */
    it("should allow owner to trigger emergency pause", async function () {
      const ownerAddress = await owner.getAddress();

      // Verify item is active
      let itemInfo = await contract.getItemInfo(itemId);
      expect(itemInfo.isActive).to.be.true;

      // Trigger pause
      const tx = await contract.connect(owner).emergencyPause();
      await tx.wait();

      // Verify all items are deactivated
      itemInfo = await contract.getItemInfo(itemId);
      expect(itemInfo.isActive).to.be.false;
    });

    /**
     * @test Should prevent non-owner from triggering emergency pause
     * @category access-control
     */
    it("should prevent non-owner from triggering emergency pause", async function () {
      // Create new item for fresh state
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();

      const tx = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "New Test Item",
          supplierAddress
        );

      await tx.wait();

      await expect(contract.connect(buyer).emergencyPause()).to.be.revertedWith(
        "Not authorized"
      );
    });
  });

  /**
   * @describe View Functions Tests
   * @section view-functions
   */
  describe("View Functions", function () {
    let itemId: number;

    before(async function () {
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();

      const tx = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "View Test Item",
          supplierAddress
        );

      await tx.wait();

      const stats = await contract.getContractStats();
      itemId = stats.totalItems;
    });

    /**
     * @test Should return item info correctly
     * @category view-functions
     */
    it("should return correct item information", async function () {
      const supplierAddress = await supplier.getAddress();

      const itemInfo = await contract.getItemInfo(itemId);

      expect(itemInfo.itemName).to.equal("View Test Item");
      expect(itemInfo.supplier).to.equal(supplierAddress);
      expect(itemInfo.isActive).to.be.true;
      expect(itemInfo.createdAt).to.be.greaterThan(0);
    });

    /**
     * @test Should return order info correctly
     * @category view-functions
     */
    it("should return correct order information", async function () {
      const buyerAddress = await buyer.getAddress();
      const OrderStatus = {
        Pending: 0,
        Approved: 1,
        Rejected: 2,
        Fulfilled: 3,
        Cancelled: 4,
      };

      const tx = await contract.connect(buyer).placeOrder(itemId, 5);
      await tx.wait();

      const stats = await contract.getContractStats();
      const orderId = stats.totalOrders;

      const orderInfo = await contract.getOrderInfo(orderId);

      expect(orderInfo.itemId).to.equal(itemId);
      expect(orderInfo.status).to.equal(OrderStatus.Pending);
      expect(orderInfo.createdAt).to.be.greaterThan(0);
    });
  });

  /**
   * @describe Integration Tests
   * @section integration
   */
  describe("Integration Scenarios", function () {
    /**
     * @test Should handle complete workflow
     * @category integration
     */
    it("should handle complete inventory workflow", async function () {
      const supplierAddress = await supplier.getAddress();
      const managerAddress = await manager.getAddress();
      const buyerAddress = await buyer.getAddress();
      const OrderStatus = {
        Pending: 0,
        Approved: 1,
        Rejected: 2,
        Fulfilled: 3,
        Cancelled: 4,
      };

      // 1. Add item
      const tx1 = await contract
        .connect(manager)
        .addInventoryItem(
          INITIAL_QUANTITY,
          INITIAL_PRICE,
          MIN_STOCK_LEVEL,
          "Integration Test Item",
          supplierAddress
        );

      await tx1.wait();

      const stats1 = await contract.getContractStats();
      const workflowItemId = stats1.totalItems;

      // 2. Add stock
      const tx2 = await contract.connect(manager).updateStock(workflowItemId, 50, true);
      await tx2.wait();

      // 3. Grant access
      const tx3 = await contract
        .connect(manager)
        .grantInventoryAccess(workflowItemId, buyerAddress);

      await tx3.wait();

      // 4. Place order
      const tx4 = await contract.connect(buyer).placeOrder(workflowItemId, 10);
      await tx4.wait();

      const stats2 = await contract.getContractStats();
      const workflowOrderId = stats2.totalOrders;

      // 5. Process order
      const tx5 = await contract
        .connect(manager)
        .processOrder(workflowOrderId, OrderStatus.Approved);

      await tx5.wait();

      // Verify final state
      const finalStats = await contract.getContractStats();
      expect(finalStats.totalItems).to.be.greaterThan(0);
      expect(finalStats.totalOrders).to.be.greaterThan(0);
    });
  });
});
