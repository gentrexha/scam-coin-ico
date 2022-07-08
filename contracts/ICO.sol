// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "./ScamCoin.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract ICO {
    // The token being sold
    ScamCoin private _token;

    // only accept a certain Token
    IERC20 private _acceptedToken;
    
    // Address where funds are collected
    address payable private _wallet;
    
    // How many tokens should be sold
    uint256 private _cap = 1000;

    // How many token units a buyer gets per wei.
    // The rate is the conversion between wei and the smallest and indivisible token unit.
    // So, if you are using a rate of 1 with a ERC20 token with 18 decimals called SCAM
    // 1 wei will give you 1 unit, or 0.000000000000000001 SCAM.
    uint256 private _rate = 10;

    // Amount of wei raised
    uint256 private _weiRaised;

    // Addresses to store coins while crowdsale is open
    mapping(address => uint256) private _balances;

    // Has our crowdsale ended
    bool public ended;

    // time-restrictions
    uint256 private _endTime;
    uint256 private _waitTime;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokensPurchased(address indexed purchaser, uint256 value, uint256 amount);
    
    /**
     * Event for declaring Crowdsale as done
     * @param endtime when did the crowdsale finish
     */
    event CrowdsaleDone(uint256 endtime);

    /**
     * @param rate Number of token units a buyer gets per wei
     * @param wallet Address where collected funds will be forwarded to
     * @param token Address of the token being sold
     * @param cap The maximum amount of tokens in the Crowdsale
     */
    constructor (uint256 rate, address payable wallet, ScamCoin token, IERC20 acceptedToken, uint256 cap, uint256 waitTime) {
        require(rate > 0, "Crowdsale: rate is 0");
        require(wallet != address(0), "Crowdsale: wallet is the zero address");
        require(address(token) != address(0), "Crowdsale: token is the zero address");
        require(address(acceptedToken) != address(0), "Accepted Token: accepted token is the zero address");
        require(cap > 0, "Crowdsale: cap is 0");

        _rate = rate;
        _wallet = wallet;
        _token = token;
        _acceptedToken = acceptedToken;
        _cap = cap;
        _waitTime = waitTime;
    }

    /**
     * @dev Checks whether the cap has been reached.
     * @return Whether the cap was reached
     */
    function capReached() public view returns (bool) {
        return _weiRaised >= _cap;
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     */
    function buyTokens(uint256 weiAmount) public {
        _preValidatePurchase(weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        // update state
        _weiRaised = _weiRaised + weiAmount;

        // Check if we reached cap
        if (_weiRaised == _cap) {
            ended = true;
            _endTime = block.timestamp;
            emit CrowdsaleDone(_endTime);
        }

        _processPurchase(msg.sender, tokens);
        emit TokensPurchased(msg.sender, weiAmount, tokens);
    }

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met.
     * @param weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(uint256 weiAmount) internal {
        require(weiAmount != 0, "ICO: amount is 0");
        require((_weiRaised + weiAmount) <= _cap, "ICO: cap exceeded");
        require(_acceptedToken.transferFrom(msg.sender, _wallet, weiAmount));
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }


    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends
     * its tokens.
     * @param beneficiary Address performing the token purchase
     * @param tokenAmount Number of tokens to be emitted
     */
    function _assignTokens(address beneficiary, uint256 tokenAmount) internal {
        _balances[beneficiary] = _balances[beneficiary] + tokenAmount;
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Doesn't necessarily emit/send
     * tokens.
     * @param beneficiary Address receiving the tokens
     * @param tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(address beneficiary, uint256 tokenAmount) internal {
        _assignTokens(beneficiary, tokenAmount);
    }


    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        return weiAmount * _rate;
    }

    /**
     * @dev Withdraw tokens only after crowdsale ends.
     */
    function claimTokens() public {
        require(ended, "ICO not closed");
        require(block.timestamp > (_endTime + _waitTime), "Waiting Time is not over");
        uint256 amount = _balances[msg.sender];
        require(amount > 0, "msg.sender is not due any tokens");

        _balances[msg.sender] = 0;
        _token.mint(msg.sender, amount);
    }

    /**
     * @return the balance of an account.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

}
