// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./vUNIFI.sol";

contract UnifiStaking is Ownable2Step, Pausable, ReentrancyGuard {
    IERC20 public immutable token;
    UnifiProtocolVotingToken public immutable wrappedToken;

    uint256 public duration;
    uint256 public finishAt;
    uint256 public updatedAt;
    uint256 public rewardRate = 3858024691358024;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public amountUserStaked;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address baseToken, address wrapped) {
        token = UnifiProtocolVotingToken(baseToken);
        wrappedToken = UnifiProtocolVotingToken(wrapped);
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();
        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }

    // WRITE FUNCTIONS

    /// @notice Stakes UNFI tokens. The user must first approve the contract to transfer UNFI tokens on their behalf.
    /// @param _amount The amount of UNFI tokens to stake.
    function stake(
        uint256 _amount
    ) external updateReward(msg.sender) nonReentrant whenNotPaused {
        require(_amount > 0, "vUNFI: NO_UNFI_TO_STAKE");
        token.transferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);
        amountUserStaked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    /// @notice Withdraws UNFI tokens. The user must first approve the contract to transfer UNFI tokens on their behalf.
    /// @param _amount The amount of UNFI tokens to withdraw.
    function withdraw(
        uint256 _amount
    ) external nonReentrant updateReward(msg.sender) whenNotPaused {
        require(_amount > 0, "vUNFI: CANNOT_UNSTAKE_ZERO");
        _burn(msg.sender, _amount);
        amountUserStaked[msg.sender] -= _amount;
        totalStaked -= _amount;
        _getReward();
        token.transfer(msg.sender, _amount);
        emit Withdrawn(msg.sender, _amount);
    }

    /// @notice Claims rewards, protected by the nonReentrant modifier.
    function getReward()
        public
        updateReward(msg.sender)
        nonReentrant
        whenNotPaused
    {
        _getReward();
    }

    /// @notice Internal function to claim rewards. Is this way because we need to avoid the nonReentrant modifier.
    function _getReward() internal {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            token.transfer(msg.sender, reward);
        }
        emit RewardPaid(msg.sender, reward);
    }

    /// @notice returns of amount of UNFI tokens staked by the user.
    /// @param _account The address of the user.
    function balanceOf(address _account) external view returns (uint256) {
        return amountUserStaked[_account];
    }

    // @dev To update rewards, first set the duration in seconds to the setRewardsDuration.
    // For example, 2592000 equals 30 days.
    // Next, send an amount of UNFI to the contract using transfer.
    // Lastly, call setRewardAmount with the _rewardRate. The rewardRate is the amount of wei of the token per second.
    // For example, 3858024691358024 equals 10,000 UNFI per 30 days.
    // This will begin the reward distribution. No rewards will be distributed until the setRewardAmount function is called.

    /// @notice Sets the duration of the rewards.
    /// @param _duration The duration of the rewards in seconds.
    function setRewardsDuration(uint256 _duration) external onlyOwner {
        duration = _duration;
    }

    /// @notice Sets the reward amount.
    /// @param _rewardRate The reward rate in wei of the token per second.
    function setRewardAmount(
        uint256 _rewardRate
    ) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    /// @notice Mints wrapped token
    /// @param to The address to mint the wrapped token to.
    /// @param amount The amount of wrapped token to mint.
    function _mint(address to, uint256 amount) internal {
        wrappedToken.mint(to, amount);
    }

    /// @notice Burns wrapped token
    /// @param account The address to burn the wrapped token from.
    /// @param amount The amount of wrapped token to burn.
    function _burn(address account, uint256 amount) internal {
        wrappedToken.burnFrom(account, amount);
    }

    // READ FUNCTIONS

    ///@notice Returns the remaining rewards.
    function remainingRewards() external view returns (uint256) {
        return token.balanceOf(address(this)) - totalStaked;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(finishAt, block.timestamp);
    }

    /// @notice Returns the reward per token. This is the reward per token stored plus the amount of wei of the token per second multiplied by the time since the last update.
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }

        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalStaked;
    }

    /// @notice Returns the amount of wei of the token that the user has earned.
    /// @param _account The address of the user.
    function earned(address _account) public view returns (uint256) {
        return
            ((amountUserStaked[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    /// @notice Simply a helper function to calculate the minimum of two numbers.
    /// @param x The first number.
    /// @param y The second number.
    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }

    // Emergency functions
    ///@notice Pauses the contract.
    function pause() public onlyOwner {
        _pause();
    }

    ///@notice Unpauses the contract.
    function unpause() public onlyOwner {
        _unpause();
    }

    ///@notice Emergency function to withdraw ETH from the contract. Only callable by the owner.
    function withdrawFunds() public onlyOwner {
        (bool sent, ) = address(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent, "Failed to send Ether");
    }

    ///@notice Emergency function to withdraw ERC20 tokens from the contract. Only callable by the owner.
    ///@param tokenAddress The address of the ERC20 token.
    function withdrawFundsERC20(address tokenAddress) public onlyOwner {
        IERC20 tkn = IERC20(tokenAddress);
        tkn.transfer(msg.sender, tkn.balanceOf(address(this)));
    }
}
