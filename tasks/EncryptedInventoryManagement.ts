/**
 * @file EncryptedInventoryManagement.ts
 * @description Hardhat tasks for interacting with the contract
 */

import { task } from "hardhat/config";
import { ContractFactory, Contract } from "ethers";

task("inventory:stats", "Get contract statistics")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt(
      "SecretInventoryManagement",
      taskArgs.contract
    );

    const stats = await contract.getContractStats();
    console.log("Contract Statistics:");
    console.log(`  Total Items: ${stats.totalItems}`);
    console.log(`  Active Items: ${stats.activeItemsCount}`);
    console.log(`  Total Orders: ${stats.totalOrders}`);
    console.log(`  Pending Orders: ${stats.pendingOrdersCount}`);
  });

task("inventory:item", "Get item information")
  .addParam("contract", "Contract address")
  .addParam("itemId", "Item ID")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt(
      "SecretInventoryManagement",
      taskArgs.contract
    );

    const itemInfo = await contract.getItemInfo(taskArgs.itemId);
    console.log(`Item #${taskArgs.itemId}:`);
    console.log(`  Name: ${itemInfo.itemName}`);
    console.log(`  Supplier: ${itemInfo.supplier}`);
    console.log(`  Active: ${itemInfo.isActive}`);
    console.log(`  Created: ${new Date(itemInfo.createdAt * 1000).toISOString()}`);
    console.log(`  Updated: ${new Date(itemInfo.lastUpdated * 1000).toISOString()}`);
  });

task("inventory:order", "Get order information")
  .addParam("contract", "Contract address")
  .addParam("orderId", "Order ID")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt(
      "SecretInventoryManagement",
      taskArgs.contract
    );

    const orderInfo = await contract.getOrderInfo(taskArgs.orderId);
    const statusMap: Record<number, string> = {
      0: "Pending",
      1: "Approved",
      2: "Rejected",
      3: "Fulfilled",
      4: "Cancelled",
    };

    console.log(`Order #${taskArgs.orderId}:`);
    console.log(`  Item ID: ${orderInfo.itemId}`);
    console.log(`  Status: ${statusMap[orderInfo.status]}`);
    console.log(`  Created: ${new Date(orderInfo.createdAt * 1000).toISOString()}`);
    if (orderInfo.processedAt > 0) {
      console.log(`  Processed: ${new Date(orderInfo.processedAt * 1000).toISOString()}`);
    }
  });

task("inventory:authorize", "Authorize a manager")
  .addParam("contract", "Contract address")
  .addParam("manager", "Manager address")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt(
      "SecretInventoryManagement",
      taskArgs.contract,
      signer
    );

    const tx = await contract.authorizeManager(taskArgs.manager);
    const receipt = await tx.wait();

    console.log(`Manager ${taskArgs.manager} authorized`);
    console.log(`Transaction: ${receipt?.transactionHash}`);
  });

task("inventory:addItem", "Add a new inventory item")
  .addParam("contract", "Contract address")
  .addParam("quantity", "Initial quantity")
  .addParam("price", "Unit price")
  .addParam("minStock", "Minimum stock level")
  .addParam("name", "Item name")
  .addParam("supplier", "Supplier address")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt(
      "SecretInventoryManagement",
      taskArgs.contract,
      signer
    );

    const tx = await contract.addInventoryItem(
      taskArgs.quantity,
      taskArgs.price,
      taskArgs.minStock,
      taskArgs.name,
      taskArgs.supplier
    );

    const receipt = await tx.wait();
    console.log(`Item added successfully`);
    console.log(`Transaction: ${receipt?.transactionHash}`);

    // Get the stats to find the new item ID
    const stats = await contract.getContractStats();
    console.log(`New Item ID: ${stats.totalItems}`);
  });

task("inventory:placeOrder", "Place a stock order")
  .addParam("contract", "Contract address")
  .addParam("itemId", "Item ID")
  .addParam("quantity", "Requested quantity")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt(
      "SecretInventoryManagement",
      taskArgs.contract,
      signer
    );

    const tx = await contract.placeOrder(taskArgs.itemId, taskArgs.quantity);
    const receipt = await tx.wait();

    console.log(`Order placed successfully`);
    console.log(`Transaction: ${receipt?.transactionHash}`);

    const stats = await contract.getContractStats();
    console.log(`New Order ID: ${stats.totalOrders}`);
  });
