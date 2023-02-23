// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Staking.sol";

contract UnifiProtocolVotingToken is
  ERC20,
  ERC20Burnable,
  Pausable,
  Ownable,
  ERC20Permit,
  ERC20Votes,
  Staking,
  ReentrancyGuard
{
  constructor(
    address unfiTokenAddress
  )
    ERC20("Unifi Protocol Voting Token", "vUNFI")
    ERC20Permit("Unifi Protocol Voting Token")
    Staking(unfiTokenAddress)
  {}

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override whenNotPaused {
    super._beforeTokenTransfer(from, to, amount);
  }

  function stake(uint256 amount) public updateReward(msg.sender) moreThanZero(amount) {
    // keep track of how much this user has staked
    // keep track of how much token we have total
    // transfer the tokens to this contract
    /** @notice Be mindful of reentrancy attack here */
    //emit event
    s_unfiAddress.approve(address(this), amount);
    bool success = s_unfiAddress.transfer(msg.sender, amount);
    if (!success) {
      revert Staking__TransferFailed();
    }
    _mint(msg.sender, amount);
    s_balances[msg.sender] += amount;
    s_totalSupply += amount;
  }

  function withdraw(uint256 amount) public updateReward(msg.sender) moreThanZero(amount) {
    bool balanceCheck = s_balances[msg.sender] >= amount;
    if (!balanceCheck) {
      revert Withdraw__TransferFailed();
    }
    claimReward();
    s_balances[msg.sender] -= amount;
    s_totalSupply -= amount;
    bool success = s_unfiAddress.transfer(msg.sender, amount);
    if (!success) {
      revert Withdraw__TransferFailed();
    }
    _burn(msg.sender, amount);
  }

  function updateRewardRate(uint256 _rewardRate) public onlyOwner updateReward(msg.sender) {
    rewardRate = _rewardRate;
  }

  // The following functions are overrides required by Solidity.

  function _afterTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC20, ERC20Votes) {
    super._afterTokenTransfer(from, to, amount);
  }

  function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._mint(to, amount);
  }

  function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._burn(account, amount);
  }
}
