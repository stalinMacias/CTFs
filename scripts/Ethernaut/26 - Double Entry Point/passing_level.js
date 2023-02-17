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

  const DET_Token = "0x1b6A40F618f4e2d092a0F0f1F7f3340C3695888d";  // DoubleEntryPoint contract

  // Creating an instance of the deployed DoubleEntryPoint contract
  this.detToken = await hre.ethers.getContractAt("DoubleEntryPoint",DET_Token);

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

  console.log("Alerts on the DetectionBot BEFORE attempting to sweep() the Legacy token from the Vault contract: ", await this.fortaContract.botRaisedAlerts(DETECTIONBOT_ADDRESS));
  
  // console.log("Calling the sweepToken() of the CryptoVault and passing the address of the LegacyToken as the parameter");
  tx = await this.cryptoVaultContract.connect(player).sweepToken(LEGACY_TOKEN_CONTRACT_ADDRESS, {gasLimit: 3000000});

  await tx.wait();

  console.log("Alerts on the DetectionBot AFTER attempting to sweep() the Legacy token from the Vault contract: ", await this.fortaContract.botRaisedAlerts(DETECTIONBOT_ADDRESS));

  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});