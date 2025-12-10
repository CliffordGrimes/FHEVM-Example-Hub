// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Encrypted Arithmetic
 * @notice Demonstrates multiple arithmetic operations on encrypted data
 * @dev Shows addition, subtraction, and multiplication of encrypted values
 */
contract EncryptedArithmetic is ZamaEthereumConfig {
    euint32 private value1;
    euint32 private value2;
    euint64 private product;

    /**
     * @notice Initialize values
     */
    constructor() {
        value1 = FHE.asEuint32(0);
        value2 = FHE.asEuint32(0);
        product = FHE.asEuint64(0);
    }

    /**
     * @notice Set first value
     */
    function setValue1(externalEuint32 val, bytes calldata inputProof) external {
        euint32 encryptedVal = FHE.fromExternal(val, inputProof);
        value1 = encryptedVal;
        FHE.allowThis(value1);
    }

    /**
     * @notice Set second value
     */
    function setValue2(externalEuint32 val, bytes calldata inputProof) external {
        euint32 encryptedVal = FHE.fromExternal(val, inputProof);
        value2 = encryptedVal;
        FHE.allowThis(value2);
    }

    /**
     * @notice Add two encrypted values
     */
    function add() external {
        euint32 result = FHE.add(value1, value2);
        FHE.allowThis(result);
    }

    /**
     * @notice Subtract two encrypted values
     */
    function subtract() external {
        euint32 result = FHE.sub(value1, value2);
        FHE.allowThis(result);
    }

    /**
     * @notice Multiply two encrypted 32-bit values
     */
    function multiply() external {
        euint64 result = FHE.mul(FHE.asEuint64(value1), FHE.asEuint64(value2));
        product = result;
        FHE.allowThis(product);
    }

    /**
     * @notice Get product value
     */
    function getProduct() external view returns (euint64) {
        return product;
    }
}
