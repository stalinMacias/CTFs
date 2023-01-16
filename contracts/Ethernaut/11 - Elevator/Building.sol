// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
interface IElevator {
  function goTo(uint) external;
}

contract BuildingContract {
  IElevator public elevator;

  bool public flag = false;

  constructor(address _elevator) {
    elevator = IElevator(_elevator);
  }

  function toTheMoon(uint _floor) external {
    elevator.goTo(_floor);
  }

  function isLastFloor(uint) external returns (bool) {
    if(!flag) {
      flag = true;  // Update the flag var to make sure the next time this method is called will return true
      return false;
    } else {
      flag = false;
      return true;  // Update the flag var to make sure the next time this method is called will return false
    }
  }

}