
 # Attack Objective: Become the admin of the PuzzleProxy contract

  ## Vulnerabilities
  ### 1.- Storage Collision because the wrong implementation on the state variables between the proxy and the implementation contracts
  ### 2.- deposit() uses msg.value to update the depositor's balance, if deposit() is called multiple times within the same transaction, msg.value will be reused on each message_call, but the real ETH added to the contract's balance will be only the value of msg.value (only 1 time!)...
  ### 3.- multicall() doesn't implement a mechanism to prevent it from being re-executed multiple times within the same transaction!

  ## Hint: When auditing a contract, look for vectors of attack where msg.value could be re-used

  ## Attack Steps:

  ### 1.- Take ownership of the PuzzleWallet contract & Add Player's address to whitelist
      - How to? ===> Set the pendingAdmin variable on the PuzzleProxy contract as the Player's address to gain ownership of the PuzzleWallet contract!

      * Reason: Only whitelisted addresses can execute most of the PuzzleWallet contract's function, thus, the player address must be added to the whitelist, but only the PuzzleWallet owner has permissions to add new addresses to the whitelist 
      *** Required steps to complete Step 1 of the Attack ***
        
        1.1- Set pendingAdmin (PuzzleProxy)[slot 0] as the Player's address
          *** When the PuzzleWallet executes a delegatecall coming from the PuzzleProxy and needs to read the value of the Owner variable (slot 0) it will actually use the PuzzleProxy storage

        1.2- Add the Player's address to the whitelist in the PuzzleWallet contract

        
  
  ### 2.- Become the admin of the PuzzleProxy contract!
      - How to? ===> Update the maxBalance address on the PuzzleWallet contract and set it to the Player's address

      * Reason: maxBalance variables uses slot 1, and the admin variable on the PuzzleProxy is stored at slot 1
        - When PuzzleWallet receives a delegatecall from the PuzzleProxy it will have access to its storage, by updating maxBalance and set it as the Player's address it will actually update the admin variable on the PuzzleProxy and set it to the Player's address
        
      * Restrictions *
        - maxBalance variable can only be updated if the PuzzleProxy balance is equals to 0!

      *** Required steps to complete Step 2 of the Attack *** 
        2.1- Drain all the balance of the PuzzleProxy contract
          - Note: The PuzzleProxy initially has a balance of 0.001 ETH 
          - Note: The only way to reduce the contract's balance is by calling the execute() function
          - Note: The only wa to add more ETH to the contract's balance is by calling the deposit() function, the contract has not a receive() nor a fallback()
          - Note: multicall() validates that the deposit() can be called only 1 time per each execution of the multicall()
            - The validation is made by a local flag that is set to true if the deposit() is called!
            - @audit-info => multicall() function has not a mechanism to prevent the function to call it itself (recursive calls)
              - If the multicall() calls it thyself, each new call won't have access to the internal data of the previous call, thus, it won't be aware wheter the deposit() was called or not!
                  @audit => One of the possible solutions might be to use the flag as a state variable intead of a local variable inside the multicall()!
                

          2.1.1- Prepare the calldata that will be sent to the multicall() function <===> multicall() expects to receive a single array of bytes (bytes[])

            * Call the deposit() and then make the multicall() to call thyself, and on each new call, call again the deposit()
              - This will cause the msg.value to be reused on each new call to the deposit(), and the contract will update the player's balance as if it would've made multiple deposits, when in reality the contract will only receive the ETH equivalent of only 1 deposit!
                - By doing this recursive invokation of the multicall() to call the deposit(), the contract will have an invariant, thus, will allow the player to take over the entire contract's balance!
                  - The result of such a recursive call on the multicall() is that the player's balance will be faaar higher than the total contract's balance, thus, the player can call the execute() and ask for the total contract's balance!

                                          * The below sintax is for EthersJS, translate it to Solidity *
                                        - abi.encodeCall() can be used for the next two steps of encoding data
                                        
            2.1.1.1 - Generate the encoded data to call the deposit()
                      ` const dep_enc = iface.encodeFunctionData("deposit",[])  `
  
            2.1.1.2 - Generate the encoded data to call the multicall() and call the deposit()
                        * This is a call to the multicall(), thus, it expects to receive an [] array as a parameter, thus, the encoded data to call the deposit() must be passed as a parameter of an array!
                            - [ [<encodedData>]  ]
                      ` const mul_enc = iface.encodeFunctionData("multicall", [[dep_enc,] ]) `
                            - iface.encodeFunctionData( fragment [ , values ] )   <===> The array [] that multicall() expects to receive must be passed within the  [ , values ] => [ [<encodedData>,] ]

            2.1.1.3 - Create an array composed of multiple times of the encoded data generated on step 2.1.1.2
                      ` const malitious_array = Array(30).fill(mul_enc) `

            2.1.1.4 - Finally, send a tx calling the multicall() and pass as a parameter the array created on the previous step
                        - The array created on the previous step actually contains the required encoded data to call multiple times the multicall() and each time call the deposit() within the same tx!
                    
                    ` tx = await deco.connect(accounts[1]).multicall(Array(30).fill(mul_enc), {value: 40}) `

                        - In the value you can pass whatever value ... Let's send the exact same amount that the PuzzleProxy has !
            ======================
            ======================

        2.1.2 - At this point, the player's balance is greater than the total PuzzleProxy contract's balance, call the execute function and withdraw all the contract's balance

        2.1.3 - Call the setMaxBalance function, and pass as a parameter the player's address masked as an uint256!
                2.3.1- Convert the player's address to uint160, and then convert it to uint256!


  ###  3.- Validate the player's address is the PuzzleProxy owner!
