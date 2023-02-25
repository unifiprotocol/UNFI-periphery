// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error Staking__TransferFailed();
error Withdraw__TransferFailed();
error Staking__NeedsMoreThanZero();

abstract contract Staking {
    IERC20 public s_unfiAddress;

    uint256 public rewardRate = 1851428571; // Tokens in Wei per block rewards to stakers. This amount is based on 10,000 distributed every 30 days.
    uint256 public s_totalSupply;
    uint256 public s_rewardPerTokenStored;
    uint256 public s_lastUpdateTime;

    /** @dev Mapping from address to the amount the user has staked */
    mapping(address => uint256) public s_balances;

    /** @dev Mapping from address to the amount the user has been rewarded */
    mapping(address => uint256) public s_userRewardPerTokenPaid;

    /** @dev Mapping from address to the rewards claimable for user */
    mapping(address => uint256) public s_rewards;

    modifier updateReward(address account) {
        s_rewardPerTokenStored = rewardPerToken(); // Updates Reward Per Block
        s_lastUpdateTime = block.number; // Updates Timestamp
        s_rewards[account] = earned(account); // Updates Amount Account has Earned
        s_userRewardPerTokenPaid[account] = s_rewardPerTokenStored; //Updates Amount Users Has Earned
        _;
    }

    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert Staking__NeedsMoreThanZero();
        }
        _;
    }

    constructor(address unfiAddress) {
        s_unfiAddress = IERC20(unfiAddress);
    }

    // Read Functions

    function getStaked(address account) public view returns (uint256) {
        return s_balances[account];
    }

    function getTotalRewards(address account) public view returns (uint256) {
        return s_rewards[account];
    }

    function earned(address account) public view returns (uint256) {
        uint256 currentBalance = s_balances[account];
        // how much they were paid already
        uint256 amountPaid = s_userRewardPerTokenPaid[account];
        uint256 currentRewardPerToken = rewardPerToken();
        uint256 pastRewards = s_rewards[account];
        uint256 _earned = ((currentBalance * (currentRewardPerToken - amountPaid)) / 1e18) +
            pastRewards;
        return _earned;
    }

    /** @dev Basis of how long it's been during the most recent snapshot/block */
    function rewardPerToken() public view returns (uint256) {
        if (s_totalSupply == 0) {
            return s_rewardPerTokenStored;
        } else {
            return
                s_rewardPerTokenStored +
                (((block.number  - s_lastUpdateTime) * rewardRate * 1e18) / s_totalSupply);
        }
    }



    // Write Functions

    function claimReward() public updateReward(msg.sender) {
        uint256 reward = s_rewards[msg.sender]; //This double spends
        uint256 amountToSend = s_userRewardPerTokenPaid[account] - reward;
        bool success = s_unfiAddress.transfer(msg.sender, amountToSend);
        if (!success) {
            revert Staking__TransferFailed();
        }
        // contract emits X reward tokens per second
        // disperse tokens to all token stakers
        // reward emission != 1:1
        // MATH
        // @ 100 tokens / second
        // @ Time = 0
        // Person A: 80 staked
        // Preson B: 20 staked
        // @ Time = 1
        // Person A: 80 staked, Earned: 80, Withdraw 0
        // Perosn B: 20 staked, Earned: 20, Withdraw: 0
        // @ Time = 2
        // Person A: 80 staked, Earned: 160, Withdraw 0
        // Person B: 20 staked, Earned: 40, Withdraw: 0
        // @ Time = 3
        // New person enters!
        // staked 100
        // Person A: 80 staked, Earned 240 + (80/200 * 100) => (40), Withdraw 0
        // Perosn B: 20 staked, Earned: 60 + (20/200 * 100) => (10), Withdraw 0
        // Person C: 100 staked, Earned: 50, Withdraw 0
        // @ Time = 4
        // Person A Withdraws & claimed rewards on everything!
        // Person A: 0 staked, Withdraw: 280
    }
}
