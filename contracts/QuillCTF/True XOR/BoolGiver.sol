// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface ITrueXOR {
  function callMe(address) external view returns (bool);
}

contract BoolGiver {
  ITrueXOR trueXORContract;
  bool flag = false;

  bool levelPassed = false;

  constructor(address _trueXORContract) {
    trueXORContract = ITrueXOR(_trueXORContract);
  }

  function solveChallenge() external returns(bool) {
    require(trueXORContract.callMe(address(this)), "Error while solving the challenge");
    levelPassed = true;
    return true;
  }

  function giveBool() view external returns (bool) {
    if(flag == false) {
      //flag = true;
      return false;
    } else {
      //flag = false;
      return true;
    }
  }

}