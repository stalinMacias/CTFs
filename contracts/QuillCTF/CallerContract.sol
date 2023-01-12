// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICollatzPuzzle {
  function callMe(address addr) external view returns (bool);
  function collatzIteration(uint256 n) external pure returns (uint256);
}

contract Caller {
  ICollatzPuzzle public collatzAddr;

  constructor(address _collatzPuzzle) {
    collatzAddr = ICollatzPuzzle(_collatzPuzzle);
  }

  function callCallMe() external{
    bool success = collatzAddr.callMe(address(this));
    require(success, "Error calling the callMe()");
  }

  function collatzIteration(uint256 n) external view returns (uint256) {
    return collatzAddr.collatzIteration(n);
  }

}