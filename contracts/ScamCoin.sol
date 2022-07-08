// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ScamCoin is IERC20, Ownable {

    string public name = "Scam Coin";
    string public symbol = "SCAM";
    uint256 public decimals = 18;
    uint256 public totalSupply = 2000;
    address public minter;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // TODO: Ask ben if there's a way to keep this in here for better understanding?
    event Minted(address indexed to, uint256 amount);

    constructor(string memory _name, string memory _symbol, uint _decimals, uint _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply; 
        balanceOf[msg.sender] = totalSupply;
        minter = owner();
    }

    /// @notice transfer amount of tokens to an address
    /// @param _to receiver of token
    /// @param _value amount value of token to send
    /// @return success as true, for transfer 
    function transfer(address _to, uint256 _value) external returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Value exceeds sender's balance");
        _transfer(msg.sender, _to, _value);
        return true;
    }

    /// @dev internal helper transfer function with required safety checks
    /// @param _from, where funds coming the sender
    /// @param _to receiver of token
    /// @param _value amount value of token to send
    // Internal function transfer can only be called by this contract
    //  Emit Transfer Event event 
    function _transfer(address _from, address _to, uint256 _value) internal {
        balanceOf[_from] = balanceOf[_from] - (_value);
        balanceOf[_to] = balanceOf[_to] + (_value);
        emit Transfer(_from, _to, _value);
    }

    /// @notice Approve other to spend on your behalf eg an exchange 
    /// @param _spender allowed to spend and a max amount allowed to spend
    /// @param _value amount value of token to send
    /// @return true, success once address approved
    //  Emit the Approval event  
    // Allow _spender to spend up to _value on your behalf
    function approve(address _spender, uint256 _value) external returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /// @notice transfer by approved person from original address of an amount within approved limit 
    /// @param _from, address sending to and the amount to send
    /// @param _to receiver of token
    /// @param _value amount value of token to send
    /// @dev internal helper transfer function with required safety checks
    /// @return true, success once transferred from original account
    // Allow _spender to spend up to _value on your behalf
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        require(_value <= balanceOf[_from], "Value exceeds balance of from address");
        require(_value <= allowance[_from][msg.sender], "Value exceeds allowance of from address for sender");
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - (_value);
        _transfer(_from, _to, _value);
        return true;
    }

    /// @notice mint amount of tokens to an address
    /// @param to receiver of token
    /// @param amount amount value of token to send
    /// @return true
    function mint(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Can not mint to the zero address");
        require(msg.sender == minter, "Only owner can mint new coins");

        totalSupply = totalSupply + amount;
        balanceOf[to] = balanceOf[to] + amount;
        emit Transfer(address(0), to, amount);
        return true;
    }

    /// @notice set minter address
    /// @param newMinter address
    /// @return true
    function setMinter(address newMinter) external onlyOwner returns (bool) {
        require(newMinter != address(0), "Minter can not be changed to the zero address");
        minter = newMinter;
        return true;
    }

}
