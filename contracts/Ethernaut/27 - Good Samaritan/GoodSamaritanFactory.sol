// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Level.sol';
import './GoodSamaritan.sol';

contract GoodSamaritanFactory is Level {

  address public GoodSamaritanContractAddress;

  function createInstance(address _player) override public payable returns (address) {
    _player;
    GoodSamaritanContractAddress = address(new GoodSamaritan());
    return GoodSamaritanContractAddress;
  }

  function validateInstance(address payable _instance, address _player) override public view returns (bool) {
    _player;
    GoodSamaritan instance = GoodSamaritan(_instance);
    return instance.coin().balances(address(instance.wallet())) == 0;
  }
}