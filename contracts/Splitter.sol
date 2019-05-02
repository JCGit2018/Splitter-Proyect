pragma solidity ^0.5.0;

import "./SafeMath.sol";
import "./Pausable.sol";

contract Splitter is Pausable (false) {
    using SafeMath for uint;    

    mapping(address => uint) public balances;

    event LogSplitCoin(address indexed sender, uint amount, address indexed bob, address indexed carol, uint remainder);
    event LogWithdrawalSent(address indexed receiver, uint amount);

    event LogSplitterCreated(address owner);
    constructor () public  {
        emit LogSplitterCreated(msg.sender);
    }
    
    
    function splitCoin(address bob, address carol) public payable notPaused() onlyOwner{
        require(msg.value>0, "Amount must be greater than 0" );
        uint half = msg.value.div(2);
        uint remainder = msg.value.mod(2);
        if(remainder >= 1) balances[msg.sender].add(remainder);
        balances[bob] = balances[bob].add(half);
        balances[carol] = balances[carol].add(half);
        emit LogSplitCoin(msg.sender, msg.value, bob, carol,remainder);
    }
    
    function withdrawal() public notPaused() {
        uint amountToWithdraw = balances[msg.sender];
        require(amountToWithdraw > 0, "No funds");
        balances[msg.sender] = 0;
        emit LogWithdrawalSent(msg.sender, amountToWithdraw);
        msg.sender.transfer(amountToWithdraw);
    }
}