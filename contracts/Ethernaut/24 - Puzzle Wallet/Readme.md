## Recreate the entire level in a local blockchain

1. Deploy the PuzzleWalletFactory.sol contract
- https://github.com/OpenZeppelin/ethernaut/blob/master/contracts/contracts/levels/PuzzleWalletFactory.sol

2. Execute the createInstance() of the PuzzleWalletFactory contract to deploy the PuzzleWallet and PuzzleProxy contracts!

3. Validate the PuzzleProxy contract was deployed as the Proxy and the PuzzleWallet contract as the Logic contract

> During the testing phase if is required to reset the proxy's state, just call again the createInstance() function of the PuzzleWalletFactory contract to re-deploy a new Proxy and Logic contracts!

### PuzzleWalletFactory contract address deployed on Ganache
