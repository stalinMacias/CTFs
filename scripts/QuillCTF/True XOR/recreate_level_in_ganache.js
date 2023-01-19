/*
Objective of CTF
- Make a successful call to the `callMe` function.
- The given `target` parameter should belong to a contract deployed by you and should use `IBoolGiver` interface.
*/

const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player, deployer] = await ethers.getSigners();

  // Deploying the TrueXOR contract
  const TrueXOR = await hre.ethers.getContractFactory("TrueXOR");
  this.trueXOR = await TrueXOR.connect(deployer).deploy();
  await this.trueXOR.deployed();

  // Deploying the BoolGiver contract (Attacker Contract)
  const BoolGiver = await hre.ethers.getContractFactory("BoolGiver");
  this.boolGiver = await BoolGiver.connect(player).deploy(this.trueXOR.address);
  await this.boolGiver.deployed();

  console.log(
    `
    Is level passed? ${await this.boolGiver.levelPassed()} \n
    `
  );

  console.log("\n\n Performing attack ... \n");

  // Calling the callMe function of the TrueXOR Contract
  console.log("Calling the callMe function of the TrueXOR Contract ...");

  const tx = await this.boolGiver.connect(player).solveChallenge();

  /*

  true and false = false
  true or false = true


  true != false => true!

  */

  // Await for the tx to be mined
  let txResult = await tx.wait();

  //console.log("transaction " , txResult);

  console.log("\n===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n");

  console.log(
    `
    Is level passed? ${await this.boolGiver.levelPassed()} \n
    `
  );

  console.log("\n\n ========================== Level solved!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});