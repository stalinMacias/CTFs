// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleTrick {
  GatekeeperThree public target;
  address public trick;
  // @audit-info => When the contract is deployed, the password will be set as the value of the block.timestamp
  uint private password = block.timestamp;

  constructor (address payable _target) {
    target = GatekeeperThree(_target);
  }
    
  // @audit-info => Each time this function is called and the provided password doesn;t match the contract's password, the password will be updated for the value of the current block.timestam!
  // Only when the provided password is the same as the contract's password the function will return true and the current password will remain the same
  function checkPassword(uint _password) public returns (bool) {
    if (_password == password) {
      return true;
    }
    password = block.timestamp;
    return false;
  }
    
  function trickInit() public {
    trick = address(this);
  }
    
  // @audit => Is this function even needed? It doesn't return anything nor any other function calls it
  function trickyTrick() public {
    if (address(this) == msg.sender && address(this) != trick) {
      target.getAllowance(password);
    }
  }
}

contract GatekeeperThree {
  address public owner;
  address public entrant;
  bool public allow_enterance = false;
  SimpleTrick public trick;

  // @audit-info => misspelled function name, thus, this function can be called by anyone to set the owner of this contract!
  function construct0r() public {
      owner = msg.sender;
  }

  //@audit-info => This condition forces that the owner must be an intermediate contract
  modifier gateOne() {
    require(msg.sender == owner);
    require(tx.origin != owner);
    _;
  }

  modifier gateTwo() {
    require(allow_enterance == true);
    _;
  }

  modifier gateThree() {
    // @audit-ok To pass gateThree this contract must be funded with at least 0.001 ether
    // @audit-ok The attacker contract must not have a receive() nor fallback()
    if (address(this).balance > 0.001 ether && payable(owner).send(0.001 ether) == false) {
      // @audit => The enter() execution continues here, thus, the above condition must be met!
      _;
    }
  }

  function getAllowance(uint _password) public {
    // Sends the provided password to the SimpleTrick contract, if the password matches the SimpleTrick contract's password it will set to true the allow_enterance variable
    if (trick.checkPassword(_password)) {
        allow_enterance = true;
    }
  }

  // @audit-info => createTrick() must be called in order to be able to execute the getAllowance() and set to true the allow_entrance variable!
  function createTrick() public {
    trick = new SimpleTrick(payable(address(this)));
    trick.trickInit();
  }

  function enter() public gateOne gateTwo gateThree returns (bool entered) {
    entrant = tx.origin;
    return true;
  }

  receive () external payable {}
}