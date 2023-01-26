// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CalculateAddress {

  function calculateAddress(address creatorContract,uint nonce) public pure returns (address) {
    require(nonce > 0, "The nonce can't be 0");
    // Recreate the adress of a contract that was created by another contract
    // https://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed/761#761
    // The new keyword uses the CREATE opcode
    // The address for an Ethereum contract is deterministically computed from the address of its creator (sender) and how many transactions the creator has sent (nonce). 
    // The address of the new account is defined as being the rightmost 160 bits of the Keccak-256 hash of the RLP encoding of the structure containing only the sender and the account nonce.
    return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xd6), bytes1(0x94), creatorContract, bytes1(uint8((nonce))))))));
  }

}