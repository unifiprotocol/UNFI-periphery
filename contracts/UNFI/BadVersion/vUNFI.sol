// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "./ERC20Wrapper.sol";
import "./Stakeable.sol";

// Add Reenterancy Guard?

contract vUNFI is ERC20, ERC20Permit, ERC20Votes, ERC20Wrapper, Stakeable {
  constructor(
    IERC20 wrappedToken
  )
    ERC20("Unifi Voting Token", "vUNFI")
    ERC20Permit("Unifi Voting Token")
    ERC20Wrapper(wrappedToken)
    Stakeable()
  {}

  function wrapAndStake(uint256 amount) public {
    _depositFor(msg.sender, amount);
    _stake(amount);
  }

  function unwrapAndUnStake(uint256 account, uint256 amount) public {
    _withdrawStake(amount);
    _withdrawTo(account, amount);
  }

  // The functions below are overrides required by Solidity.

  function decimals() public view virtual override(ERC20, ERC20Wrapper) returns (uint8) {
    return 18;
  }

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
