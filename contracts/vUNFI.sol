// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract UnifiProtocolVotingToken is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    ERC20Votes,
    Ownable2Step
{
    /// @notice this role has rights for transfer/mint/burning tokens, such us a staking contract
    address private _delegated = address(0);

    event DelegatedUpdated(address newDelegated);

    constructor()
        ERC20("Unifi Protocol Voting Token", "vUNFI")
        ERC20Permit("Unifi Protocol Voting Token")
    {}

    modifier onlyOwnerOrDelegated() {
        require(
            msg.sender == owner() || msg.sender == _delegated,
            "UnifiProtocolVotingToken: onlyOwnerOrDelegated"
        );
        _;
    }

    /// @notice Function to mint vUNFI tokens. Only callable by the owner & delegated.
    /// @param to The address to mint the tokens to.
    /// @param amount The amount of tokens to mint.
    function mint(address to, uint256 amount) public onlyOwnerOrDelegated {
        _mint(to, amount);
    }

    ///@notice Function to burn vUNFI tokens. Only callable by the owner & delegated.
    /// @param from The address to burn the tokens from.
    /// @param amount The amount of tokens to burn.
    function burn(address from, uint256 amount) public onlyOwnerOrDelegated {
        _burn(from, amount);
    }

    /// @notice Set a new delegated address.
    /// @param newDelegated The new delegated address.
    function setDelegated(address newDelegated) public onlyOwner {
        _delegated = newDelegated;
        emit DelegatedUpdated(newDelegated);
    }

    function delegated() public view returns (address) {
        return _delegated;
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(
        address account,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override onlyOwnerOrDelegated returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public override onlyOwnerOrDelegated returns (bool) {
        return super.transfer(recipient, amount);
    }
}
