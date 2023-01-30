# Solution 1 - Sending a Raw TX to create a contract and passing the `creation code` via the data field
- The `creation code` contains the 10 opcodes of the `runtime code`, they will be loaded onto memory and returned to the EVM for permanent storage at the end of the execution of the `creation code`
