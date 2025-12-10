import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * @test FHE Template Test Suite
 * @chapter basic
 * @description Basic template tests for FHEVM examples
 */
describe("FHETemplate", function () {
  it("should deploy successfully", async function () {
    const ContractFactory = await ethers.getContractFactory("FHETemplate");
    const contract = await ContractFactory.deploy();
    await contract.waitForDeployment();

    expect(contract.target).to.not.equal(ethers.ZeroAddress);
  });
});
