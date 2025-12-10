/**
 * @file deploy.ts
 * @description Deployment script for Encrypted Inventory Management contract
 */

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying Encrypted Inventory Management contract...");

  const deployment = await deploy("SecretInventoryManagement", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: hre.network.name === "hardhat" ? 1 : 5,
  });

  console.log(`Contract deployed at: ${deployment.address}`);

  // Verify on Etherscan if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: deployment.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed (contract may already be verified)");
    }
  }
};

deploy.tags = ["EncryptedInventoryManagement"];
deploy.id = "deploy_encrypted_inventory_management";

export default deploy;
