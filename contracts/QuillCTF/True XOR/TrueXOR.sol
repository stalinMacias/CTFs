// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
Objective of CTF
- Make a successful call to the `callMe` function.
- The given `target` parameter should belong to a contract deployed by you and should use `IBoolGiver` interface.
*/

interface IBoolGiver {
  function giveBool() external view returns (bool);
}

contract TrueXOR {
  function callMe(address target) external view returns (bool) {
    bool p = IBoolGiver(target).giveBool();
    bool q = IBoolGiver(target).giveBool();
    require((p && q) != (p || q), "bad bools");
    require(msg.sender == tx.origin, "bad sender");
    return true;
  }
}