# Unifi Governance Smart Contracts

These smart contracts have been designed to facilitate the operation and governance of a Unifi Protocol DAO. They enable token holders to participate in the decision-making process by voting on proposals and staking their tokens to earn rewards. The contracts also provide a mechanism for managing the distribution of rewards and for enforcing time-based locks on certain actions. Overall, these contracts aim to increase the transparency and accountability of the DAO by ensuring that the decision-making process is fair and democratic.

## Smart Contracts

### UnifiGovernor.sol

The UnifiGovernor contract is responsible for managing proposals and voting in the Unifi protocol. It is based on the OpenZeppelin Governor contract and includes additional features such as a quorum and timelock control.

### UnifiProtocolVotingToken.sol

The UnifiProtocolVotingToken contract is the ERC20 token used for voting in the Unifi protocol. It is based on the OpenZeppelin ERC20 contract and includes additional features such as a burn function and a maximum supply cap.

Note this token is not transferrable.

### UnifiStaking.sol

The UnifiStaking contract is responsible for staking UNFI tokens and earning rewards in the Unifi protocol. It is based on the OpenZeppelin Ownable2Step, Pausable, and ReentrancyGuard contracts and includes additional features such as reward rate management and wrapped token minting.

## TimeLockController.sol

The Time Lock Controller is responsible for delaying governance calls until after the set amount of time has passed. This allows UNFI token holders to take action before a proposal is implamented. In addition, this allows for a final 'gut check' in the event the proposal would negatively impact the ecosystem.

## License

These smart contracts are licensed under the MIT License. See the LICENSE file for more information.
