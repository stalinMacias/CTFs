// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface DelegateERC20 {
  function delegateTransfer(address to, uint256 value, address origSender) external returns (bool);
}

interface ILegacyToken {
  function delegate() external returns (DelegateERC20);
}

interface IDetectionBot {
    function handleTransaction(address user, bytes calldata msgData) external;
}

interface IForta {
    function setDetectionBot(address) external;
    function notify(address, bytes calldata) external;
    function raiseAlert(address) external;
}


/**
 * @dev => This DetectionBot will be monitoring to prevent the DET Token to be transfered out of the Vault contract
 */
contract DetectionBot {
  IForta public fortaContract;
  address public immutable player;

  // LegacyToken contract
  address public immutable LegacyToken;

  // Underlying Token (DET token) on the Vault contract - shouldn't be able to transfer out of the Vault!
  address public immutable DET_Token;

  address public immutable CryptoVaultContract;

  address public receivedTo;
  uint public receivedValue;
  address public receivedOrigSender;

  constructor(address _fortaContractAddress, address _legacyTokenContractAddress, address _detTokenContractAddress, address _cryptoVaultContract) {
    fortaContract = IForta(_fortaContractAddress);
    LegacyToken = _legacyTokenContractAddress;
    DET_Token = _detTokenContractAddress;
    CryptoVaultContract = _cryptoVaultContract;
    player = msg.sender;
  }

    // This function won't work to register the DetectionBot on the Forta contract ...
    // Even though it forwards the msg.sender calling this function, it also forwards the storage of this contract (because of the delegatecall()), thus, the changes will be stored on this contract's storage instead of in the Forta contract's storage
        // Register the bot by sending a transaction directly to the Forta contract!
  // function registerDetectionBot() public {
  //   require(msg.sender == player, "Only Player can register the DetectionBot");
  //   // Register on the Forta contract this DetectionBot -> Must use a delegatecall() to register the bot using the Player's address!
  //   (bool res, ) = address(fortaContract).delegatecall(abi.encodeWithSelector(IForta.setDetectionBot.selector, address(this)));
  //   require(res, "Error while registering the Dection Bot on the Forta contract!");
  // }


   // @audit-ok         => A way to prevent the transfer() from been exploited & take out the underlying token (DET) from the vault is by checking if the delegate variable on the LegacyToken is pointing to DET contract
   // @audit-ok         => If the delegate variable is pointing to the DET contract & the origSender received on the function [delegateTransfer()] that calls this function is the CryptoVault, that means that the transfer of tokens must be reverted because otherwise, the underlying tokens stored on the Vault will be transfered to the receiver!
  function handleTransaction(address user, bytes calldata msgData) external {
    address delegateOnLegacyTokenContract = getValueOfDelegateOnLegacyTokenContract();
    // msgData was encoded based on the three below parameters
      // address to,
      // uint256 value,
      // address origSender

    // And they were encoded on the next order: ===> to, value, origSender ===> address, to, address
    
    (address to, uint256 value, address origSender) = abi.decode(msgData[4:],(address,uint,address));

    receivedTo = to;
    receivedValue = value;
    receivedOrigSender = origSender;
                                                                              
    if(delegateOnLegacyTokenContract == DET_Token && origSender == CryptoVaultContract) {
      // raise an Alert if the delegate variable is set as the DET token on the Legacy Contract, otherwise, the DET tokens will be transfered out of the Vault contract!
      fortaContract.raiseAlert(user);
    }

  }

  // The address returned by this function is the address the LegacyToken delegates the transfers of tokens to!
  // When the LegacyToken receives a call to transfer() tokens it will call() the contract of the address that is set in the delegate variable!
  function getValueOfDelegateOnLegacyTokenContract() internal returns(address) {
    return address(ILegacyToken(LegacyToken).delegate());
  }

}