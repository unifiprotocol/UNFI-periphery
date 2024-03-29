# Unifi Governance Smart Contracts

These smart contracts have been designed to facilitate the operation and governance of a Unifi Protocol DAO. They enable token holders to participate in the decision-making process by voting on proposals and staking their tokens to earn rewards. The contracts also provide a mechanism for managing the distribution of rewards and for enforcing time-based locks on certain actions. Overall, these contracts aim to increase the transparency and accountability of the DAO by ensuring that the decision-making process is fair and democratic.

## How Does This Work?

### Staking

Staking is being moved to a new contract. Unlike our previous contract, there is no cap to how much Unifi Dao Token can be staked. Initially, 12,500 Unifi Dao Token will be distributed every 30 days from the Unifi Protocol DAO Treasury. The APR will be determined by the total amount of Unifi Dao Token staked. In the future, the DAO can choose to increase, decrease, or completely remove this incentive.

### Governance

The original Unifi DAO token contract does not contain the proper implementations for voting. Fortunately, the staking contract allows us to wrap the original Unifi Dao token to a token that does contain voting rights. When you stake Unifi Dao Token, you will receive vUNIFI - a non-transferable ERC-20 token compatible with the OpenZeppelin Governance standard. vUNIFI serves a receipt for your staked Unifi Dao Token, redeemable at any time for the original staked Unif Dao Token plus staking rewards.

For Governance, Unifi Protocol will utilize Tally.xyz for on-chain governance, and Snapshot.org for off-chain polling, known as ‘temperature checks’. vUNIFI must be delegated on Tally.xyz in order to participate in on-chain governance. Users can delegate their votes to themselves, or a representative to vote on their behalf. Anybody can be a representative.

### Referendums

![Referendum Timeline](/public/proposal.png "Referendum Timeline")

In order for a referendum to be considered valid, the proposal must pass a temperature check on Snapshot.org, then pass with 50% + 1 approval on Tally.xyz. A proposal must be submitted by a representative with a delegation of at least 50,000 vUNIFI (0.5% of Total Supply), and must reach a quorum of 250,000 vUNIFI (2.5% of total supply). The on-chain proposal will need to submit calldata to implement the proposal.

Once a proposal is passed, the referendum is queued to be executed. A waiting period of 7 days is enforced using OpenZeppelin’s Timelock Controller. This allows users to take action before the implantation of the referendum.

## Smart Contracts

| Contract Name            | Address                                    | #                                                                                  |
| ------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| UnifiProtocolVotingToken | 0x6b5e07063B3cd19BEF0d9e9F66d22dB5D517f52a | [🔍](https://etherscan.io/address/0x6b5e07063B3cd19BEF0d9e9F66d22dB5D517f52a)      |
| UnifiStaking             | 0x90817bCcafAb6D5be9E0198252Ba70C542a91bac | [🔍](https://etherscan.io/address/0x90817bCcafAb6D5be9E0198252Ba70C542a91bac#code) |
| vTimeLockController      | 0xD8E3c7AcB8c9337B5CEeeC2539a81297B9d5AD96 | [🔍](https://etherscan.io/address/0xD8E3c7AcB8c9337B5CEeeC2539a81297B9d5AD96#code) |
| UnifiGovernor            | 0x96618A5F91720f61FfBA80Fd1CE2822F4f4Ba634 | [🔍](https://etherscan.io/address/0x96618a5f91720f61ffba80fd1ce2822f4f4ba634#code) |
| UNIFI                    | 0x441761326490cacf7af299725b6292597ee822c2 | [🔍](https://etherscan.io/address/0x441761326490cacf7af299725b6292597ee822c2#code) |

### UnifiGovernor.sol

The UnifiGovernor contract is responsible for managing proposals and voting in the Unifi protocol. It is based on the OpenZeppelin Governor contract and includes additional features such as a quorum and timelock control.

### UnifiProtocolVotingToken.sol

The UnifiProtocolVotingToken contract is the ERC20 token used for voting in the Unifi protocol. It is based on the OpenZeppelin ERC20 contract and includes additional features such as a burn function and a maximum supply cap.

Note this token is not transferrable.

### UnifiStaking.sol

The UnifiStaking contract is responsible for staking UNFI tokens and earning rewards in the Unifi protocol. It is based on the OpenZeppelin Ownable2Step, Pausable, and ReentrancyGuard contracts and includes additional features such as reward rate management and wrapped token minting.

### vTimeLockController.sol

The Time Lock Controller is responsible for delaying governance calls until after the set amount of time has passed. This allows UNFI token holders to take action before a proposal is implamented. In addition, this allows for a final 'gut check' in the event the proposal would negatively impact the ecosystem.

## License

These smart contracts are licensed under the MIT License. See the LICENSE file for more information.
