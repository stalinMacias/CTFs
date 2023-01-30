/*
To solve this level, you only need to provide the Ethernaut with a Solver, a contract that responds to whatIsTheMeaningOfLife() with the right number.

Easy right? Well... there's a catch.

The solver's code needs to be really tiny. Really reaaaaaallly tiny. Like freakin' really really itty-bitty tiny: 10 opcodes at most.

Hint: Perhaps its time to leave the comfort of the Solidity compiler momentarily, and build this one by hand O_o. That's right: Raw EVM bytecode.
*/

// Main resource used to figure out the solution of this level: https://listed.to/@r1oga/13786/ethernaut-levels-16-to-18

const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();

  // Get an instance of the MagicNumber contract deployed by Ethernaut
  const MagicNumberAddress = "0x072E0260ee4C63e95dFCAF0E1390Fc4aa02Cd61f"
  this.magicNumber = await hre.ethers.getContractAt("MagicNum",MagicNumberAddress);

  console.log("Deploying the Attacker contract...");

  // Deploy the attacker contract
  // The constructor() of this contract has the exact 10 opcodes required to return 42 (0x2a) whenever the function is called!
  // Those 10 opcodes will be set as the runtime code (contract's code)
  const AttackerContract = await hre.ethers.getContractFactory("AttackerContract");
  this.attackerContract = await AttackerContract.connect(player).deploy();
  await this.attackerContract.deployed();

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
   
  // The creation code is basically the constructor() which is loading into memory the runtime code and then returns it to the EVM for permanent storage as the runtime code (contract's code)

  console.log("\n Setting up the solver address of the MagicNum contract to the just created Attacker Contract \n");

  const tx = await this.magicNumber.connect(player).setSolver(this.attackerContract.address);
  // Await for the tx to be mined
  console.log("Waiting while the Solver address is updated : )");
  await tx.wait();

  console.log(
    `
    Attacker contract address: ${this.attackerContract.address} \n
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