// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Level.sol';
import './GatekeeperThree.sol';

contract GatekeeperThreeFactory is Level {

  address public GatekeeperThreeContractAddress;
  function createInstance(address _player) override public payable returns (address) {
    _player;
    GatekeeperThree instance = new GatekeeperThree();

    // Storing the GatekeeperThreeContractAddress on the Factory's storage
    GatekeeperThreeContractAddress = address(instance);
    
    return payable(instance);
  }

  function validateInstance(address payable _instance, address _player) override public view returns (bool) {
    GatekeeperThree instance = GatekeeperThree(_instance);
    return instance.entrant() == _player;
  }
}