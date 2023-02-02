// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Buyer {
  function price() external view returns (uint);
}

contract Shop {
  uint public price = 100;
  bool public isSold;

  function buy() public {
    Buyer _buyer = Buyer(msg.sender);

    if (_buyer.price() >= price && !isSold) {
      // @audit-info -> Setting as true the isSold variable before updating the price allows an attack vector on the _buyer.price() function
      // That is an external function that can trick this contract by using the value of the isSold variable to manipulate the end price of the purchase!
      isSold = true;
      price = _buyer.price();
    }
  }
}