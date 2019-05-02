pragma solidity ^0.5.0;

import "./Owner.sol";

contract Pausable is Owner {
    bool private paused;

    event LogPaused (bool newState, address pausedBy);
    
    modifier notPaused() {
        require (!paused, "Contract paused");
        _;
    }

    constructor (bool initialState) public {
        paused = initialState;
    }

    function contractPaused(bool newState) public onlyOwner() {
        require(newState != paused);
        paused = newState;
        emit LogPaused (newState, msg.sender);
    }
}