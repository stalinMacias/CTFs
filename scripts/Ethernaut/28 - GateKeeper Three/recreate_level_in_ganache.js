/*
  Cope with gates and become an entrant.
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

  console.log("Deploying the Factory contract");
  // Deploy Factory Contract
  const GatekeeperThreeFactory = await hre.ethers.getContractFactory("GatekeeperThreeFactory");
  this.gatekeeperThreeFactory = await GatekeeperThreeFactory.connect(deployer).deploy({gasLimit: 1000000});
  await this.gatekeeperThreeFactory.deployed();

  console.log("Deploying contracts using the Factory contract");
  // Deploy the GateKeeperThree contract using the Factory contract
  tx = await this.gatekeeperThreeFactory.connect(deployer).createInstance(player.address,{value: 0});
  await tx.wait()

  const GatekeeperThreeContractAddress = await this.gatekeeperThreeFactory.GatekeeperThreeContractAddress();
  
  // Creating an instance of the GatekeeperThree contract
  this.gatekeeperThree = await hre.ethers.getContractAt("GatekeeperThree",GatekeeperThreeContractAddress);

  // const CoinContractAddress = await this.goodSamaritan.coin();
  // const WalletContractAddress = await this.goodSamaritan.wallet();

  console.log(
    `
    GatekeeperThreeContractAddress ${GatekeeperThreeContractAddress} \n
    Initial values on the GateKeeperThree contract:
    owner: ${await this.gatekeeperThree.owner()} \n
    entrant: ${await this.gatekeeperThree.entrant()} \n
    allow_enterance: ${await this.gatekeeperThree.allow_enterance()} \n
    trick: ${await this.gatekeeperThree.trick()} \n
    `
  );
    
  // Validating setups!
  expect(await this.gatekeeperThree.allow_enterance()).to.eq(false);


  
   

  console.log("\n\n ========================== Attack Completed!!!! ==========================");


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});