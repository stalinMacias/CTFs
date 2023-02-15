// figure out where the bug is in CryptoVault and protect it from being drained out of tokens
// 


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
interface DelegateERC20 {
  function delegateTransfer(address to, uint256 value, address origSender) external returns (bool);
}

interface IDetectionBot {
    function handleTransaction(address user, bytes calldata msgData) external;
}

interface IForta {
    function setDetectionBot(address detectionBotAddress) external;
    function notify(address user, bytes calldata msgData) external;
    function raiseAlert(address user) external;
}

// Any user can register its own detection bot contract
// implement a detection bot and register it in the Forta contract. 
    //The bot's implementation will need to raise correct alerts to prevent potential attacks or bug exploits.
contract Forta is IForta {
  mapping(address => IDetectionBot) public usersDetectionBots;
  mapping(address => uint256) public botRaisedAlerts;

  function setDetectionBot(address detectionBotAddress) external override {
      usersDetectionBots[msg.sender] = IDetectionBot(detectionBotAddress);
  }

  // @audit => address(usersDetectionBots[user] returns the address of the DetectionBot contract
  function notify(address user, bytes calldata msgData) external override {
    if(address(usersDetectionBots[user]) == address(0)) return;
    try usersDetectionBots[user].handleTransaction(user, msgData) {
        return;
    } catch {}
  }

  // @audit => address(usersDetectionBots[user] returns the address of the DetectionBot contract
  // @audit-ok => raiseAlert() validates that the DetectionBot is the one calling the function, thus, the function can be called using a call() from the DetectionBot contract!
  function raiseAlert(address user) external override {
      if(address(usersDetectionBots[user]) != msg.sender) return;
      botRaisedAlerts[msg.sender] += 1;
  } 
}

// Underlying token is the DET Token
// underlying token can't be swept
// Any other tokens can be swept using the sweepToken() function
contract CryptoVault {
    address public sweptTokensRecipient;
    IERC20 public underlying;

    constructor(address recipient) {
        sweptTokensRecipient = recipient;
    }

    function setUnderlying(address latestToken) public {
        require(address(underlying) == address(0), "Already set");
        underlying = IERC20(latestToken);
    }

    /*
    ...
    */

    // @audit-info => All the transferred tokens goes to the recipient!
    function sweepToken(IERC20 token) public {
        require(token != underlying, "Can't transfer underlying token");
        // @audit-info => If a call to LegacyToken is made, the total value of tokens to be transferred are the total balance the CryptoVault has of LGT tokens, not DET Tokens!
        // @audit-info => The transfer() on the LegacyToken will always call the DoubleEntryPoint token because the delegate variable on the LegacyToken is initialized!

        // @audit      => The problem is that the transfer() of the LegacyToken will transfer the amount of tokens equivalent to the total balance of tokens the CryptoVault has but of LGT tokens, not DET token, and all the changes will be made on the DET contract's storage
        // @audit      => After the below call is completed, the equivalent of the total balance of LGT tokens will be drainned on the DET tokens, but the balance on the LGT token won't be updated
        // @audit      => Basically, the below call will transfer DET tokens, but is not updating the balance on the LGT tokens
        
        // @audit-issue      => Potential attack is: call the below function to take all the DET tokens, then, set the delegate variable on the LGT token as the 0x address, and then call this function again to withdraw all the LGT tokens out of the Vault contract!
        
        // @audit => The bug is caused because of the logic in the transfer() on the LegacyToken ... If the delegate variable points to the underlying token it will actually transfer the underlying tokens, thus, the DET tokens will be taken out of the Vault!
        
        token.transfer(sweptTokensRecipient, token.balanceOf(address(this)));
    }
}

// CryptoVault also holds 100 of LegacyToken LGT.
contract LegacyToken is ERC20("LegacyToken", "LGT"), Ownable {
    // @audit-issue   => If this variable points to the DET token, the transfer() will enable an attack vector to take out the underlying tokens from the Vault contract!
    DelegateERC20 public delegate;

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function delegateToNewContract(DelegateERC20 newContract) public onlyOwner {
        delegate = newContract;
    }

    function transfer(address to, uint256 value) public override returns (bool) {
        // @audit-issue => While the delegate variable is set as the DET contract, it will always call that contract to make the transfer of funds, and all the changes will be made on the DET contract's storage!
        // As long as this condition is true, a call() to the delegateTransfer() of the delegate contract will be executed
        if (address(delegate) == address(0)) {
            return super.transfer(to, value);
        } else {
            // @audit-info  =>  This is a call() => Anything updated on this call will be applied on the DET contract's storage
            return delegate.delegateTransfer(to, value, msg.sender);  // msg.sender is the CryptoVault's contract address
        }
    }
}

// The underlying token is an instance of the DET token implemented in the DoubleEntryPoint contract definition and the CryptoVault holds 100 units of it. 
contract DoubleEntryPoint is ERC20("DoubleEntryPointToken", "DET"), DelegateERC20, Ownable {
    address public cryptoVault;
    address public player;
    address public delegatedFrom;
    Forta public forta;

    constructor(address legacyToken, address vaultAddress, address fortaAddress, address playerAddress) {
        delegatedFrom = legacyToken;
        forta = Forta(fortaAddress);
        player = playerAddress;
        cryptoVault = vaultAddress;
        _mint(cryptoVault, 100 ether);
    }

    modifier onlyDelegateFrom() {
        require(msg.sender == delegatedFrom, "Not legacy contract");
        _;
    }

    modifier fortaNotify() {
        address detectionBot = address(forta.usersDetectionBots(player));

        // Cache old number of bot alerts
        uint256 previousValue = forta.botRaisedAlerts(detectionBot);

        // @audit-info  => On the msg.data, it is encoded the value of the origSender, decode it on the Player's bot and use its value to validate if is set as the LegacyToken contract!
        // Notify Forta
        forta.notify(player, msg.data);

        // Continue execution
        // It will run the function's code
        _;

        // And after the function's code is executed it will continue with the rest of the code on the modifier()

        // Check if alarms have been raised
        if(forta.botRaisedAlerts(detectionBot) > previousValue) revert("Alert has been triggered, reverting");
    }

    // msg.sender will be the LegacyToken contract's address
    function delegateTransfer(
        address to,
        uint256 value,
        address origSender
    ) public override onlyDelegateFrom fortaNotify returns (bool) {
        // @audit-issue   => This function will only update the storage & balances of this contract!
        // @audit-info    => This function can only be called by the LegacyToken contract

        // @audit-ok         => A way to prevent this function to be exploit & take out the underlying token (DET) from the vault is by checking if the delegate variable on the LegacyToken is pointing to this contract
        // @audit-ok         => If the delegate variable is pointing to this contract & the origSender received on this function is the CryptoVault, that means that the transfer of tokens must be reverted because otherwise, the underlying tokens stored on the Vault will be transfered to the receiver!

        // will call _transfer() of the DET token, not the Legacy token!
          // This function is basically transfering DET tokens from the CryptoVault to the receiver account!
        _transfer(origSender, to, value);
        return true;
    }
}