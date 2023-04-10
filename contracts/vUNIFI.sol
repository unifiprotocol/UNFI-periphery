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
    address private _controller = address(0);
    mapping(address => bool) _blacklist;

    event ControllerUpdated(address newController);
    event BlacklistUpdated(address indexed user, bool value);

    constructor()
        ERC20("Unifi Protocol Voting Token", "vUNIFI")
        ERC20Permit("Unifi Protocol Voting Token")
    {}

    modifier onlyOwnerOrController() {
        require(
            msg.sender == owner() || msg.sender == _controller,
            "UnifiProtocolVotingToken: onlyOwnerOrController"
        );
        _;
    }

    /// @notice Function to mint vUNIFI tokens. Only callable by the owner & controller.
    /// @param to The address to mint the tokens to.
    /// @param amount The amount of tokens to mint.
    function mint(address to, uint256 amount) public onlyOwnerOrController {
        require(!isBlackListed(to), "UnifiProtocolVotingToken: Blacklisted");
        _mint(to, amount);
    }

    ///@notice Function to burn vUNIFI tokens. Only callable by the owner & controller.
    /// @param from The address to burn the tokens from.
    /// @param amount The amount of tokens to burn.
    function burn(address from, uint256 amount) public onlyOwnerOrController {
        _burn(from, amount);
    }

    /// @notice Set a new controller address.
    /// @param newController The new controller address.
    function setController(address newController) public onlyOwner {
        _controller = newController;
        emit ControllerUpdated(newController);
    }

    /// @notice Get the current controller address.
    function controller() public view returns (address) {
        return _controller;
    }

    /// @notice Function to blacklist an address. Only callable by the owner.
    /// @param user The address to blacklist.
    /// @param value The blacklist value. True to blacklist an address, false to remove an address from the blacklist.
    function blacklistUpdate(
        address user,
        bool value
    ) public virtual onlyOwnerOrController {
        _blacklist[user] = value;
        emit BlacklistUpdated(user, value);
    }

    /// @notice Function to check if an address is blacklisted.
    /// @param user The address to check.

    function isBlackListed(address user) public view returns (bool) {
        return _blacklist[user];
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
    ) public override onlyOwnerOrController returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public override onlyOwnerOrController returns (bool) {
        return super.transfer(recipient, amount);
    }
}
