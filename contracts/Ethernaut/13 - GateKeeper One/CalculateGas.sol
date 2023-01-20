// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
 * This contract is a helper to determine the required amount of gas to pass the gateTwo
 * This contract is not expected to be deployed on the public testnet, only in the fork
 * The reason to use this contract is to validate the alghoritm that will be created to estimate the required gas to pass the level
 * But this contract shouldn't be used when passing the level in the public testnet, instead, the alorithm should be executed agains the original contract deployed by Ethernaut
 */

contract CalculateGas {

  address public entrant;

  modifier gateOne() {
    require(msg.sender != tx.origin);
    _;
  }

  modifier gateTwo() {
    require(gasleft() % 8191 == 0);
    _;
  }

  function enter(bytes8 _gateKey) public gateOne gateTwo returns (bool) {
    entrant = tx.origin;
    return true;
  }

  // modifier gateThree(bytes8 _gateKey) {
  //     require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
  //     require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
  //     require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)), "GatekeeperOne: invalid gateThree part three");
  //   _;
  // }

  // function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
  //   entrant = tx.origin;
  //   return true;
  // }

}