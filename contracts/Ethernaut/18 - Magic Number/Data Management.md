

- Each Opcode is a byte = 2 Hexadecimal = 8 bits
--- 
# Data Management in the EVM
- The EVM manages different kinds of data depending on their context.
	- stack
	- calldata
	- memory
	- storage

--- 
## Stack
- Most opcodes consume their parameters from the Stack
- All operations are performed on the Stack

---
## Calldata
- The calldata is exactly the data sent along a message call
- The calldata is a read-only byte-addressable space where the data parameter of a transaction or call is held
- Solidity lets you access to the calldata through msg.data.
- The first 4 bytes of the calldata hold the signature of the function being called
---
## Memory
- The EVM uses the memory as a scratchpad to perform operations or computations and return the final value.
- When a new EVM memory is created, all the bytes in it are initially empty (defined as zero).
  - Each new instance of the EVM memory is specific to an execution context, the current contract execution.
    - When the execution comes back to the previous execution context before a call was made, the memory of such an execution context is loaded back

- When interacting with the EVM memory, you read from or write to (what I call) “memory blocks” that are 32 bytes long.
- The first 4 x 32 bytes words in memory are reserved spaces (0x80)

- The calldata and payload sent alongside message calls is stored and retrieved from memory.
--- 
## Storage
- Storage is a persistent read-write area
- A contract can neither read nor write to any storage apart from its own
- All locations are initially defined as zero.
- statically sized variables (everything except mappings and dynamic arrays) are laid out contiguously in storage starting from position 0.
---


# Resources

- ### Getting Deep Into EVM: How Ethereum Works Backstage  => Data Management
  - https://medium.com/swlh/getting-deep-into-evm-how-ethereum-works-backstage-ab6ad9c0d0bf 

- ### Solidity Tutorial: All About Calldata
  - https://betterprogramming.pub/solidity-tutorial-all-about-calldata-aebbe998a5fc

- ### Solidity Tutorial: All About Memory  
  - https://betterprogramming.pub/solidity-tutorial-all-about-memory-1e1696d71ee4

- ### Storage in Solidity - Patrick Collins Tweet
  - https://twitter.com/patrickalphac/status/1514257121302429696

