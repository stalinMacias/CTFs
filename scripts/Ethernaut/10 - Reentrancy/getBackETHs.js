/*
Getting back the ETH spent on this level
  - ETHs are stucked in the Attacker Contract
*/

const hre = require("hardhat");

async function main() {
  // Deployed on Ganache
  [player] = await ethers.getSigners();

  // Get an instance of the Attacker Contract
  const AttackReentranceAddress = "0x583C6EdD912c6D8133407E949d115333Dc5B0F2d"
  this.attackReentrance = await hre.ethers.getContractAt("AttackReentrance",AttackReentranceAddress);

  console.log(
    `
    ReentranceAttack contract ETH Balance: ${await hre.ethers.provider.getBalance(this.attackReentrance.address)}
    `
  );

  console.log("\n\n Claiming back the ETHs spent on this level ... \n\n");


  const tx = await this.attackReentrance.connect(player).getBackEths();
  
  // Await for the tx to be mined
  console.log("Waiting while we claimed back the spent ETHs : )");
  await tx.wait();

  console.log("===============================================\n===============================================\n");
  console.log("\n\n Results after claiming the ETHs back \n\n");

  console.log(
    `
    ReentranceAttack contract ETH Balance: ${await hre.ethers.provider.getBalance(this.attackReentrance.address)}
    `
  );


  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});