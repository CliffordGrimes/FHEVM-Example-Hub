import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks";

// Load environment variables
require("dotenv").config();

// Get environment variables
const MNEMONIC = process.env.MNEMONIC || "test test test test test test test test test test test junk";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 1337,
      loggingEnabled: false,
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },

    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: {
        mnemonic: MNEMONIC,
      },
      chainId: 11155111,
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
    deployments: "./deployments",
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },

  mocha: {
    timeout: 40000,
    reporter: "spec",
    reporterOptions: {
      reportDir: "test-reports",
      reportFilename: "index.html",
    },
  },

  namedAccounts: {
    deployer: 0,
    owner: 0,
    manager: 1,
    supplier: 2,
    buyer: 3,
  },
};

export default config;
