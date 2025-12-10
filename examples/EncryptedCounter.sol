// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Encrypted Counter
 * @notice Simple FHE counter demonstrating basic arithmetic operations
 * @dev This example shows how to perform encrypted addition and subtraction
 */
contract EncryptedCounter is ZamaEthereumConfig {
    euint32 private counter;

    /**
     * @notice Initialize counter to zero
     */
    constructor() {
        counter = FHE.asEuint32(0);
    }

    /**
     * @notice Get encrypted counter value
     * @return The encrypted counter
     */
    function getCounter() external view returns (euint32) {
        return counter;
    }

    /**
     * @notice Increment counter by encrypted amount
     * @param amount Encrypted amount to add
     * @param inputProof Proof of encrypted input
     */
    function increment(externalEuint32 amount, bytes calldata inputProof) external {
        euint32 encryptedAmount = FHE.fromExternal(amount, inputProof);
        counter = FHE.add(counter, encryptedAmount);
        FHE.allowThis(counter);
    }

    /**
     * @notice Decrement counter by encrypted amount
     * @param amount Encrypted amount to subtract
     * @param inputProof Proof of encrypted input
     */
    function decrement(externalEuint32 amount, bytes calldata inputProof) external {
        euint32 encryptedAmount = FHE.fromExternal(amount, inputProof);
        counter = FHE.sub(counter, encryptedAmount);
        FHE.allowThis(counter);
    }

    /**
     * @notice Grant access to counter value
     * @param user Address to grant access to
     */
    function grantAccess(address user) external {
        FHE.allow(counter, user);
    }
}
