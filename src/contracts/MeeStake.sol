
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MeeStake {
    mapping(address => uint256) public stakes;
    event Staked(address indexed user, uint256 amount);

    function stake(uint256 amount) external {
        require(amount > 0, "amount > 0");
        stakes[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }
}
