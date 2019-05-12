pragma solidity ^0.5.0;

import "./Owner.sol";

contract Pausable is Owner {
    bool public paused;

   
    event LogPaused (address pausedBy);
    event LogResumedContract(address resumedBy);
    
    modifier notPaused() {
        require (!paused, "Contract paused");
        _;
    }

    constructor() public {
        paused = false;
    }

      function contractPaused() public onlyOwner notPaused returns (bool success){
        paused= true;
        emit LogPaused(msg.sender);
        return true;
    }

    function resume() public onlyOwner returns (bool success){
        require(paused);
        paused = false;
        emit LogResumedContract(msg.sender);
        return true;
    }
}
