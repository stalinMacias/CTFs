/*

*/

const hre = require("hardhat");

async function main() {
  // Recreating the attack on ganache
  [player, deployer] = await ethers.getSigners();

  let tx;

  // Deploy Factory Contract
  const PuzzleWalletFactory = await hre.ethers.getContractFactory("PuzzleWalletFactory");
  this.puzzleWalletFactory = await PuzzleWalletFactory.connect(deployer).deploy();
  await this.puzzleWalletFactory.deployed();

  // Deploy the Proxy and Logic contract through the Factory contract
  tx = await this.puzzleWalletFactory.connect(deployer).createInstance({value: hre.ethers.utils.parseEther("0.001")});
  await tx.wait()

  const ProxyContractAddress = await this.puzzleWalletFactory.ProxyContract();
  const LogicContractAddress = await this.puzzleWalletFactory.LogicContract();

  // Creating an instance of the deployed PuzzleProxy contract
  this.puzzleProxy = await hre.ethers.getContractAt("PuzzleProxy",ProxyContractAddress);

  // Creating an instance of the deployed PuzzleProxy contract using the logic of the PuzzleWallet contract
  this.puzzleProxyInstance = await hre.ethers.getContractAt("PuzzleWallet",ProxyContractAddress);


  console.log(
    `
    ProxyContractAddress ${ProxyContractAddress} \n
    LogicContractAddress ${LogicContractAddress} \n\n
    
    PuzzleProxy Admin:  ${await this.puzzleProxy.admin()} \n
    PuzzleWallet Owner: ${await this.puzzleProxyInstance.owner()}
    `
  );


    /*
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
  */
  
  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});