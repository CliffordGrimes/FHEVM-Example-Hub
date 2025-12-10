// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHE Template
 * @notice Base template for FHEVM examples
 * @dev Replace this with your example contract
 */
contract FHETemplate is ZamaEthereumConfig {
    /// @notice Encrypted value stored in contract
    euint32 private encryptedValue;

    /**
     * @notice Get encrypted value
     * @return The encrypted value
     */
    function getValue() external view returns (euint32) {
        return encryptedValue;
    }

    /**
     * @notice Set encrypted value
     * @param newValue The new encrypted value
     * @param inputProof Proof for the encrypted input
     */
    function setValue(externalEuint32 newValue, bytes calldata inputProof) external {
        euint32 encryptedInput = FHE.fromExternal(newValue, inputProof);
        encryptedValue = encryptedInput;
        FHE.allowThis(encryptedValue);
    }
}
