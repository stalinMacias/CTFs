//Claim ownership of the Telephone contract

const hre = require("hardhat");

async function main() {
  //const CoinFlipAddress = "0x3b050246c6A687B98f43ACeEa5B3b1f46423AD7f"
  //this.coinFlipAttack = await hre.ethers.getContractAt("CoinFlipAttack",CoinFlipAttackAddress);

  [macias, ganacheAccount] = await ethers.getSigners();

  const Telephone = await hre.ethers.getContractFactory("Telephone");
  this.telephone = await Telephone.connect(ganacheAccount).deploy();
  await this.telephone.deployed();

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
    `
    TelephoneAttack contract address: ${await this.telephoneAttack.address} \n
    Telephone contract to be attacked: ${await this.telephoneAttack.telephoneAddress()}
    `
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});