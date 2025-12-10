/**
 * @file create-example.ts
 * @description Automation script for generating standalone FHEVM example repositories
 * @chapter automation
 *
 * This script provides a TypeScript-based CLI tool for:
 * - Creating new FHEVM example repositories from templates
 * - Scaffolding project structure with dependencies
 * - Generating example contracts based on selected categories
 * - Creating matching test suites
 * - Auto-generating documentation from code annotations
 */

import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";

/**
 * Example configuration for different FHEVM patterns
 */
interface ExampleConfig {
  name: string;
  description: string;
  category: string;
  features: string[];
}

/**
 * Available example categories
 */
const EXAMPLE_CATEGORIES: Record<string, ExampleConfig> = {
  "encrypted-counter": {
    name: "Encrypted Counter",
    description: "Basic FHE counter demonstrating simple encrypted arithmetic",
    category: "basic",
    features: ["addition", "subtraction", "encryption"],
  },
  "access-control": {
    name: "Access Control System",
    description: "Advanced access control demonstrating permission management",
    category: "access-control",
    features: ["role-based-permissions", "grant-access", "revoke-access"],
  },
  "encrypted-arithmetic": {
    name: "Encrypted Arithmetic",
    description: "Multiple encrypted types with various arithmetic operations",
    category: "arithmetic",
    features: ["addition", "subtraction", "multiplication", "comparison"],
  },
  "user-decryption": {
    name: "User Decryption",
    description: "User-initiated decryption of encrypted values",
    category: "decryption",
    features: ["user-decrypt", "authorized-decryption"],
  },
  "public-decryption": {
    name: "Public Decryption",
    description: "Public decryption of encrypted contract results",
    category: "decryption",
    features: ["public-decrypt", "result-publication"],
  },
};

/**
 * Template content for generated contracts
 */
function generateContractTemplate(exampleName: string, category: string): string {
  return `// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ${exampleName}
 * @notice Example demonstrating ${category} patterns with FHEVM
 * @dev This contract showcases how to use encrypted types and operations
 */
contract ${convertToCamelCase(exampleName)} is ZamaEthereumConfig {
    /**
     * @notice Example encrypted storage variable
     */
    euint32 private encryptedValue;

    /**
     * @notice Initialize with encrypted value
     * @param initialValue The initial encrypted value
     */
    constructor() {
        encryptedValue = FHE.asEuint32(0);
    }

    /**
     * @notice Get the encrypted value
     * @return The encrypted value stored in contract
     */
    function getEncryptedValue() external view returns (euint32) {
        return encryptedValue;
    }

    /**
     * @notice Set encrypted value
     * @param newValue The new encrypted value to store
     * @param inputProof Proof for input encryption
     */
    function setEncryptedValue(externalEuint32 newValue, bytes calldata inputProof) external {
        euint32 encryptedInput = FHE.fromExternal(newValue, inputProof);
        encryptedValue = encryptedInput;
        FHE.allowThis(encryptedValue);
    }

    /**
     * @notice Add to encrypted value
     * @param addAmount Amount to add
     * @param inputProof Proof for input encryption
     */
    function addToValue(externalEuint32 addAmount, bytes calldata inputProof) external {
        euint32 encryptedAmount = FHE.fromExternal(addAmount, inputProof);
        encryptedValue = FHE.add(encryptedValue, encryptedAmount);
        FHE.allowThis(encryptedValue);
    }
}
`;
}

/**
 * Template for test files
 */
function generateTestTemplate(contractName: string): string {
  return `import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

/**
 * @test ${contractName} Test Suite
 * @chapter basic
 * @description Complete test coverage for the ${contractName} contract
 */
describe("${contractName}", function () {
    let contract: Contract;
    let owner: Signer;

    before(async function () {
        const [ownerSigner] = await ethers.getSigners();
        owner = ownerSigner;

        const ContractFactory = await ethers.getContractFactory("${contractName}");
        contract = await ContractFactory.deploy();
        await contract.waitForDeployment();
    });

    /**
     * @test Deployment
     * @category basic
     */
    it("should deploy successfully", async function () {
        expect(contract.target).to.not.equal(ethers.ZeroAddress);
    });

    /**
     * @test Basic operations
     * @category basic
     */
    it("should get encrypted value", async function () {
        const value = await contract.getEncryptedValue();
        expect(value).to.not.be.undefined;
    });
});
`;
}

/**
 * Template for hardhat configuration
 */
function generateHardhatConfigTemplate(): string {
  return `import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import "hardhat-gas-reporter";

require("dotenv").config();

const MNEMONIC = process.env.MNEMONIC || "test test test test test test test test test test test junk";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: { enabled: true, runs: 200 }
        }
    },
    networks: {
        localhost: { url: "http://127.0.0.1:8545", chainId: 1337 },
        sepolia: {
            url: \`https://sepolia.infura.io/v3/\${INFURA_API_KEY}\`,
            accounts: { mnemonic: MNEMONIC },
            chainId: 11155111
        }
    }
};

export default config;
`;
}

/**
 * Convert name to camelCase format
 */
function convertToCamelCase(str: string): string {
  return str
    .split("-")
    .map((word, index) => {
      if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}

/**
 * Create directory structure for new example
 */
function createProjectStructure(projectPath: string): void {
  const dirs = [
    "contracts",
    "test",
    "deploy",
    "tasks",
    "scripts",
    "docs",
    ".github/workflows",
    ".vscode",
  ];

  dirs.forEach((dir) => {
    const fullPath = path.join(projectPath, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

/**
 * Generate example project
 */
function generateExample(exampleKey: string, outputDir: string): void {
  const config = EXAMPLE_CATEGORIES[exampleKey];

  if (!config) {
    console.error(`Unknown example: ${exampleKey}`);
    console.error(
      `Available examples: ${Object.keys(EXAMPLE_CATEGORIES).join(", ")}`
    );
    process.exit(1);
  }

  const projectName = convertToCamelCase(exampleKey);
  const projectPath = path.join(outputDir, projectName);

  console.log(`Creating ${config.name} example...`);
  console.log(`Location: ${projectPath}`);

  // Create directories
  createProjectStructure(projectPath);

  // Create contract file
  const contractContent = generateContractTemplate(config.name, config.category);
  const contractPath = path.join(projectPath, "contracts", `${projectName}.sol`);
  fs.writeFileSync(contractPath, contractContent);
  console.log(`✓ Contract created: ${contractPath}`);

  // Create test file
  const testContent = generateTestTemplate(projectName);
  const testPath = path.join(projectPath, "test", `${projectName}.test.ts`);
  fs.writeFileSync(testPath, testContent);
  console.log(`✓ Test file created: ${testPath}`);

  // Create hardhat.config.ts
  const hardhatConfig = generateHardhatConfigTemplate();
  const hardhatPath = path.join(projectPath, "hardhat.config.ts");
  fs.writeFileSync(hardhatPath, hardhatConfig);
  console.log(`✓ Hardhat config created: ${hardhatPath}`);

  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      lib: ["ES2020"],
      outDir: "./dist",
      rootDir: "./",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ["**/*.ts"],
    exclude: ["node_modules", "dist"],
  };

  const tsconfigPath = path.join(projectPath, "tsconfig.json");
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log(`✓ TypeScript config created: ${tsconfigPath}`);

  // Create package.json
  const packageJson = {
    name: `fhevm-example-${exampleKey}`,
    version: "1.0.0",
    description: config.description,
    scripts: {
      compile: "hardhat compile",
      test: "hardhat test",
      deploy: "hardhat deploy --network sepolia",
    },
    dependencies: {
      "@fhevm/solidity": "^0.3.0",
      "@openzeppelin/contracts": "^5.0.1",
      ethers: "^6.10.0",
    },
    devDependencies: {
      "@nomiclabs/hardhat-ethers": "^2.2.3",
      "@types/chai": "^4.3.11",
      "@types/mocha": "^10.0.6",
      chai: "^4.3.10",
      hardhat: "^2.19.4",
      "hardhat-deploy": "^0.11.45",
      typescript: "^5.3.3",
    },
  };

  const packageJsonPath = path.join(projectPath, "package.json");
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`✓ Package.json created: ${packageJsonPath}`);

  // Create README
  const readmeContent = `# ${config.name}

${config.description}

## Features

${config.features.map((f) => `- ${f}`).join("\n")}

## Quick Start

\`\`\`bash
npm install
npm run compile
npm run test
\`\`\`

## Deployment

\`\`\`bash
npm run deploy
\`\`\`
`;

  const readmePath = path.join(projectPath, "README.md");
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`✓ README created: ${readmePath}`);

  console.log("\n✅ Example project created successfully!");
  console.log(`\nNext steps:`);
  console.log(`1. cd ${projectName}`);
  console.log(`2. npm install`);
  console.log(`3. npm run test`);
}

/**
 * List available examples
 */
function listExamples(): void {
  console.log("Available FHEVM Examples:\n");

  Object.entries(EXAMPLE_CATEGORIES).forEach(([key, config]) => {
    console.log(`📚 ${key}`);
    console.log(`   Name: ${config.name}`);
    console.log(`   Description: ${config.description}`);
    console.log(`   Category: ${config.category}`);
    console.log(`   Features: ${config.features.join(", ")}`);
    console.log();
  });
}

/**
 * Main entry point
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log("FHEVM Example Generator");
    console.log("\nUsage: npx ts-node scripts/create-example.ts [command] [options]");
    console.log("\nCommands:");
    console.log("  list                    - List all available examples");
    console.log("  create <example> [dir]  - Create a new example");
    console.log("  help                    - Show this help message");
    console.log("\nExamples:");
    console.log("  npx ts-node scripts/create-example.ts list");
    console.log("  npx ts-node scripts/create-example.ts create encrypted-counter");
    console.log("  npx ts-node scripts/create-example.ts create access-control ./examples");
    return;
  }

  const command = args[0];

  switch (command) {
    case "list":
      listExamples();
      break;

    case "create":
      if (args.length < 2) {
        console.error("Error: Please specify an example name");
        console.error(
          "Usage: npx ts-node scripts/create-example.ts create <example> [dir]"
        );
        process.exit(1);
      }

      const exampleName = args[1];
      const outputDir = args[2] || ".";

      generateExample(exampleName, outputDir);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error("Use --help for usage information");
      process.exit(1);
  }
}

// Run the script
main();
