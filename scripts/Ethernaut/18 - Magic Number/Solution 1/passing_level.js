/*
To solve this level, you only need to provide the Ethernaut with a Solver, a contract that responds to whatIsTheMeaningOfLife() with the right number.

Easy right? Well... there's a catch.

The solver's code needs to be really tiny. Really reaaaaaallly tiny. Like freakin' really really itty-bitty tiny: 10 opcodes at most.

Hint: Perhaps its time to leave the comfort of the Solidity compiler momentarily, and build this one by hand O_o. That's right: Raw EVM bytecode.
*/

// Main resource used to figure out the solution of this level: https://listed.to/@r1oga/13786/ethernaut-levels-16-to-18

const hre = require("hardhat");
const path = require("path");
require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );

PRIVATE_KEY=process.env.PRIVATE_KEY;

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();

  // Get an instance of the MagicNumber contract deployed by Ethernaut
  const MagicNumberAddress = "0x93e090178Ae4f4Be680D4fF5449a3dD151D9906A"
  this.magicNumber = await hre.ethers.getContractAt("MagicNum",MagicNumberAddress);

  /********************************** Creating the Contract Code -> Creation code & Runtime code ***************************/
  // Runtime code:
  /**
    602a	<---> Push to the Stack the 42 that needs to be returned (0x2a) 
    6000	<---> Push 0 to the stack 
    52	  <---> mstore => Will load to memory the 42 (0x2a) at memory position 0 
    6020	<---> push 32 (0x20) to stack -> To return 32 bytes of data! (Each memory position is 32 bytes) 
    6000	<---> push 00 to stack 
    f3	  <---> return opcode => return 32 bytes stored in memory position 0

          Runtime bytecode:    602a60005260206000f3
   * 
   */

  // Creation code:
  /**
    69602a60005260206000f3	<--> Pushes the 10 bytes of the runtime code to the stack! 
    6000	<---> Pushes 0 to the stack

    52	  <---> mstore opcode => Loads to memory the 10 bytes of the runtime code at position 0 
                ===> This will store 602a60005260206000f3 padded with 22 zeroes on the left to form a 32 bytes long bytestring (To fill up the entire position in memory!)

    600a	<---> Pushes 10 (0x0a)to the stack 
    6016	<---> Pushes 22 (0x16) to the stack

    f3    <---> return opcode => return 10 bytes (0x0a) stored in memory at position 0x16 (This will return the runtime code to the EVM to be stored) 
                => return(0x16, 0x0a) ===> starting from byte 22, return the 10 bytes long runtime bytecode (From the memory) 
                - Returns only the bytes corresponding to the 42 (0x2a) value!

          Creation bytecode:    69602a60005260206000f3600052600a6016f3
   */
  // from bytes 2 to bytes 10 [602a60005260206000f3] represents the runtime code
  // All the rest of bytes are part of the creation code
  // The creation code is basically loading into memory the runtime code and then returns it to the EVM for permanent storage as the runtime code (contract's code)
  attackContractBytecode = "0x69602a60005260206000f3600052600a6016f3";  // attackContractBytecode contains the Creation code & Runtime code

  console.log("Creating the contract with a runtime code of 10 bytes");

  // Signing and Sending the tx
  const playerWallet = new hre.ethers.Wallet(PRIVATE_KEY);

  gasPrice = await hre.ethers.provider.getGasPrice()
  nonce = await hre.ethers.provider.getTransactionCount(playerWallet.address);

  // When in a transaction is not specified the "to" parameter, the EVM will interpret it as a transaction to create a new contract!
  // If the "to" parameter is specified and even though is set to the 0x address, the EVM will interpret that as an interaction with the 0x contract instead of a Tx to actually create a new contract
  let creatingContractTX = {
    chainId: 5, // for goerli
    nonce: nonce,
    gasLimit: 6721975,
    gasPrice: gasPrice,
    // msg.data contains the Creation code for the new contract
    data: attackContractBytecode 
  };

  let signedCreationContractTx = await playerWallet.signTransaction(creatingContractTX);
  console.log("signedCreationContractTx: ", signedCreationContractTx);
  let sentCreationContractTx = await hre.ethers.provider.sendTransaction(signedCreationContractTx);
  console.log("sentCreationContractTx: ",sentCreationContractTx);
  
  let creationContracTxResult = await hre.ethers.provider.waitForTransaction(sentCreationContractTx.hash);
  console.log("creationContracTxResult: ", creationContracTxResult);

  const attackerContractAddres = creationContracTxResult.contractAddress;

  console.log("\n===============================================\n===============================================\n");

  /*
  console.log("Interacting with the deployed contract - Calling the whatIsTheMeaningOfLife()");

  // Even though the attacker contract has no functions defined, whenever a t

  // Getting the bytes4 signature of a function
  // Source -> https://ethereum.stackexchange.com/questions/83165/is-there-a-way-to-get-the-result-of-web3s-encodefunctioncall-with-ethers //
  let delegateABI = ["function whatIsTheMeaningOfLife()"];
  let iface = new hre.ethers.utils.Interface(delegateABI); 
  const selectorHash = iface.encodeFunctionData("whatIsTheMeaningOfLife")

  nonce = await hre.ethers.provider.getTransactionCount(playerWallet.address);

  let tx = {
    chainId: 5, // for goerli
    nonce: nonce,
    to: attackerContractAddres,
    gasLimit: 6721975,
    gasPrice: gasPrice,
    data: selectorHash 
  };

  let signedTx = await playerWallet.signTransaction(tx);
  //console.log("signedTx: ", signedTx);
  let sentTx = await hre.ethers.provider.sendTransaction(signedTx);
  //console.log("sentTx: ",sentTx);
  
  let TxResult = await hre.ethers.provider.waitForTransaction(sentTx.hash);
  console.log("TxResult: ", TxResult);
  */

  console.log("\n Setting up the solver address of the MagicNum contract to the just created Attacker Contract \n");

  const tx = await this.magicNumber.connect(player).setSolver(attackerContractAddres);
  // Await for the tx to be mined
  console.log("Waiting while the Solver address is updated : )");
  await tx.wait();

  console.log(
    `
    Attacker contract address: ${attackerContractAddres} \n
    Solver address: ${await this.magicNumber.solver()}
    `
  );

  console.log("\n===============================================\n===============================================\n");
  console.log("Everything is ready to Submit the level instance!");
  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});