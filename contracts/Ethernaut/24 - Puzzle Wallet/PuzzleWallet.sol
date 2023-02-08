// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// Proxy Contract 
  // Storage variables and balances of this contract are updated when executing functions of the Implementation/Logic contract
  // delegate calls to the Logic contract to use its code for execution
contract PuzzleProxy is ERC1967Proxy {
  // @audit-info The Logic contract will cause a storage collision because Slot 0 and Slot 1 are been used for different variables than Slots on the Proxy contract!
    address public pendingAdmin;  // Slot 0
    address public admin;         // Slot 1

    constructor(address _admin, address _implementation, bytes memory _initData) ERC1967Proxy(_implementation, _initData) {
        admin = _admin;
    }

    modifier onlyAdmin {
      require(msg.sender == admin, "Caller is not the admin");
      _;
    }

    // @audit-info - Anybody can execute this function to propose a new admin of the PuzzleProxy contract!
    function proposeNewAdmin(address _newAdmin) external {
        // @audit - By setting the pendingAdmin variable as the Player address, the player will gain the ownership of the PuzzleWallet contract...
        // @audit - When the Logic contract is executed and reads the value of the Slot assigned to the owner variable (Slot 0), will actually read the storage of the PuzzleProxy contract, thus, will read the value of the PendingAdmin variable
        pendingAdmin = _newAdmin;
    }

    function approveNewAdmin(address _expectedAdmin) external onlyAdmin {
        require(pendingAdmin == _expectedAdmin, "Expected new admin by the current admin is not the pending admin");
        admin = pendingAdmin;
    }

    function upgradeTo(address _newImplementation) external onlyAdmin {
        _upgradeTo(_newImplementation);
    }
}

// Implementation / Logic contract
  // Receives the delegate calls of the Proxy Contract
  // All the changes made during the execution of a delegatecall are applied to the proxy contract
contract PuzzleWallet {
    // @audit-info The Logic contract will cause a storage collision because Slot 0 and Slot 1 are been used for different variables than Slots on the Proxy contract!
    // @audit - When the Logic contract eexecutes a delegatecall from the Proxy contract it will use the Proxy's storage
    
    address public owner;                         // Slot 0   <==> pendingAdmin on the PuzzleProxy contract
    uint256 public maxBalance;                    // Slot 1   <==> admin ont eh PuzzleProxy contract!
    mapping(address => bool) public whitelisted;  // Slot who know which? The hash of .....
    mapping(address => uint256) public balances;  // Slot who know which? The hash of .....

    function init(uint256 _maxBalance) public {
        require(maxBalance == 0, "Already initialized");
        maxBalance = _maxBalance;
        owner = msg.sender;
    }

    modifier onlyWhitelisted {
        require(whitelisted[msg.sender], "Not whitelisted");
        _;
    }

    function setMaxBalance(uint256 _maxBalance) external onlyWhitelisted {
      require(address(this).balance == 0, "Contract balance is not 0");
      maxBalance = _maxBalance;
    }

    function addToWhitelist(address addr) external {
      // @audit - When the Logic contract is executed and reads the value of the Slot assigned to the owner variable (Slot 0), will actually read the storage of the PuzzleProxy contract, thus, will read the value of the PendingAdmin variable
        require(msg.sender == owner, "Not the owner");
        whitelisted[addr] = true;
    }

    function deposit() external payable onlyWhitelisted {
      require(address(this).balance <= maxBalance, "Max balance reached");
      balances[msg.sender] += msg.value;
    }

    function execute(address to, uint256 value, bytes calldata data) external payable onlyWhitelisted {
        require(balances[msg.sender] >= value, "Insufficient balance");
        balances[msg.sender] -= value;
        (bool success, ) = to.call{ value: value }(data);
        require(success, "Execution failed");
    }

    // Each position of the parameter data[] is a call, it is composed of the function's signature and all the required parameters to call that function!
    function multicall(bytes[] calldata data) external payable onlyWhitelisted {
        bool depositCalled = false;
        for (uint256 i = 0; i < data.length; i++) {
            bytes memory _data = data[i];
            bytes4 selector;
            assembly {
                selector := mload(add(_data, 32))
            }
            if (selector == this.deposit.selector) {
                require(!depositCalled, "Deposit can only be called once");
                // Protect against reusing msg.value
                depositCalled = true;
            }
            (bool success, ) = address(this).delegatecall(data[i]);
            require(success, "Error while delegating call");
        }
    }
}