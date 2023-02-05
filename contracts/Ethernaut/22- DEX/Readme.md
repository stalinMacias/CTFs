# Challenge's Description
The goal of this level is for you to hack the basic DEX contract below and steal the funds by price manipulation.

- <b>You will start with 10 tokens of `token1` and 10 of `token2`.</b>
- <b>The DEX contract starts with 100 of each token</b>

You will be successful in this level if you manage to drain all of at least 1 of the 2 tokens from the contract, and allow the contract to report a "bad" price of the assets.

 

## Quick note
Normally, when you make a swap with an ERC20 token, you have to `approve` the contract to spend your tokens for you. To keep with the syntax of the game, we've just added the `approve` method to the contract itself. So feel free to use `contract.approve(contract.address, <uint amount>)` instead of calling the tokens directly, and it will automatically approve spending the two tokens by the desired amount. Feel free to ignore the `SwappableToken` contract otherwise.

  Things that might help:

* How is the price of the token calculated?
* How does the `swap` method work?
* How do you `approve` a transaction of an ERC20?
* Theres more than one way to interact with a contract!
* Remix might help
* What does "At Address" do?

----


player has 10 tokens each
dex contract has 100 tokens each


	* from Token is the token the user sends to the contract
	* to Token is the token the contract send to the user
	
swap 10 tokens1 to tokens2

amount = 10
swapAmount = 20