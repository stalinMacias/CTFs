// 10 opcodes at most.
// Raw EVM bytecode.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AttackerContract {
  constructor() {
    assembly{
      // 0x602a60005260206000f3 ---> runtime code <===> Minimum upcodes required to return 42 (0x2a) whenever the contract is called!
      mstore(0, 0x602a60005260206000f3) // Load the runtime code at memory position 0
      // All the memory words are 32 bytes length, the word 0 where the runtime code will be stored will be zeroe padded on the left (22 zeroes will be added to the left)
      return(0x16, 0x0a)                // Return 10 bytes from memory starting at position 22 (0x16) -> The runtime code was stored starting exactly at the 0x16 byte of the word 0
    }
  }
}