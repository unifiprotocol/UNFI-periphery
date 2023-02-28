// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract UnifiProtocolVotingToken is
    ERC20,
    ERC20Burnable,
    Pausable,
    Ownable,
    ERC20Permit,
    ERC20Votes,
    ReentrancyGuard
{
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

    IERC20 public immutable unfiToken;

    constructor(address unfiTokenAddress)
        ERC20("Unifi Protocol Voting Token", "vUNFI")
        ERC20Permit("Unifi Protocol Voting Token")
    {
        unfiToken = IERC20(unfiTokenAddress);
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

    //Read Functions

    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(finishAt, block.timestamp);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }

        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalStaked;
    }

    function earned(address _account) public view returns (uint256) {
        return
            ((amountUserStaked[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    // Write Functions

    function stake(uint256 _amount)
        external
        updateReward(msg.sender)
        nonReentrant
        whenNotPaused
    {
        require(_amount > 0, "vUNFI: NO_UNFI_TO_STAKE");
        unfiToken.transferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);
        amountUserStaked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount)
        external
        updateReward(msg.sender)
        whenNotPaused
    {
        require(_amount > 0, "vUNFI: CANNOT_UNSTAKE_ZERO");
        getReward();
        _burn(msg.sender, _amount);
        amountUserStaked[msg.sender] -= _amount;
        totalStaked -= _amount;
        unfiToken.transfer(msg.sender, _amount);
        //Needs Reentracy protection
        emit Withdrawn(msg.sender, _amount);
    }

    function getReward()
        public
        updateReward(msg.sender)
        nonReentrant
        whenNotPaused
    {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            unfiToken.transfer(msg.sender, reward);
        }
        emit RewardPaid(msg.sender, _amount);
    }

    //Admin + DAO Functions

    // @dev To update rewards, first set the duration in seconds to the setRewardsDuration.
    // For example, 2592000 equals 30 days.
    // Next, send an amount of UNFI to the contract using transfer.
    // Lastly, call setRewardAmount with the _rewardRate. The rewardRate is the amount of wei of the token per second.
    // For example, 3858024691358024 equals 10,000 UNFI per 30 days.
    // This will begin the reward distribution. No rewards will be distributed until the setRewardAmount function is called.

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        duration = _duration;
    }

    function setRewardAmount(uint256 _rewardRate)
        external
        onlyOwner
        updateReward(address(0))
    {
        rewardRate = _rewardRate;
        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Emergency Functions

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function withdrawFunds() public onlyOwner {
        address(msg.sender).call{value: address(this).balance}("");
    }

    function withdrawFundsERC20(address tokenAddress) public onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        if (recipient == address(this) || sender == address(this)) {
            return super.transferFrom(sender, recipient, amount);
        } else {
            revert("vUNFI: TRANSFER_DISABLED");
        }
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        if (recipient == address(this) || sender == address(this)) {
            return super.transferFrom(sender, recipient, amount);
        } else {
            revert("vUNFI: TRANSFER_DISABLED");
        }
    }
}
