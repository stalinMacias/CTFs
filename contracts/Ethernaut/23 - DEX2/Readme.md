# Solving the Challenge

## Vulnerabilities

### swap() doesn't validate if the tokens are valid tokens before executing a swap
- swap() doesn't check if the tokens are valid tokens, thus, it creates an attack vector because an attacker can create fake tokens and transferring some liquidity to the DexTwo contract, and then, swapping one of the two real tokens for the fake token.

## Passing the Challenge
1. Create two fake tokens with 1k initial supply
2. Transfer 10 of each token to the DexTwo contract <=> The player account will have all the remain balance of the fakeTokens!
3. Call the swap() and set the `from` token as one of the two `fake tokens`, and the `to` as one of the two `real tokens`
3.5 Repeat step 3 but using the other combination of fake & real tokens!