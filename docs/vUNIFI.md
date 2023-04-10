# Solidity API

## UnifiProtocolVotingToken

### Contract
UnifiProtocolVotingToken : contracts/vUNIFI.sol

 --- 
### Modifiers:
### onlyOwnerOrController

```solidity
modifier onlyOwnerOrController()
```

 --- 
### Functions:
### constructor

```solidity
constructor() public
```

### mint

```solidity
function mint(address to, uint256 amount) public
```

Function to mint vUNIFI tokens. Only callable by the owner & controller.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address to mint the tokens to. |
| amount | uint256 | The amount of tokens to mint. |

### burn

```solidity
function burn(address from, uint256 amount) public
```

Function to burn vUNIFI tokens. Only callable by the owner & controller.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The address to burn the tokens from. |
| amount | uint256 | The amount of tokens to burn. |

### setController

```solidity
function setController(address newController) public
```

Set a new controller address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newController | address | The new controller address. |

### controller

```solidity
function controller() public view returns (address)
```

Get the current controller address.

### blacklistUpdate

```solidity
function blacklistUpdate(address user, bool value) public virtual
```

Function to blacklist an address. Only callable by the owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address to blacklist. |
| value | bool | The blacklist value. True to blacklist an address, false to remove an address from the blacklist. |

### isBlackListed

```solidity
function isBlackListed(address user) public view returns (bool)
```

Function to check if an address is blacklisted.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address to check. |

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from, address to, uint256 amount) internal
```

### _mint

```solidity
function _mint(address to, uint256 amount) internal
```

### _burn

```solidity
function _burn(address account, uint256 amount) internal
```

### transferFrom

```solidity
function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)
```

### transfer

```solidity
function transfer(address recipient, uint256 amount) public returns (bool)
```

inherits Ownable2Step:
### pendingOwner

```solidity
function pendingOwner() public view virtual returns (address)
```

_Returns the address of the pending owner._

### transferOwnership

```solidity
function transferOwnership(address newOwner) public virtual
```

_Starts the ownership transfer of the contract to a new account. Replaces the pending transfer if there is one.
Can only be called by the current owner._

### _transferOwnership

```solidity
function _transferOwnership(address newOwner) internal virtual
```

_Transfers ownership of the contract to a new account (`newOwner`) and deletes any pending owner.
Internal function without access restriction._

### acceptOwnership

```solidity
function acceptOwnership() external
```

_The new owner accepts the ownership transfer._

inherits Ownable:
### owner

```solidity
function owner() public view virtual returns (address)
```

_Returns the address of the current owner._

### _checkOwner

```solidity
function _checkOwner() internal view virtual
```

_Throws if the sender is not the owner._

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

_Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions anymore. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby removing any functionality that is only available to the owner._

inherits ERC20Votes:
### checkpoints

```solidity
function checkpoints(address account, uint32 pos) public view virtual returns (struct ERC20Votes.Checkpoint)
```

_Get the `pos`-th checkpoint for `account`._

### numCheckpoints

```solidity
function numCheckpoints(address account) public view virtual returns (uint32)
```

_Get number of checkpoints for `account`._

### delegates

```solidity
function delegates(address account) public view virtual returns (address)
```

_Get the address `account` is currently delegating to._

### getVotes

```solidity
function getVotes(address account) public view virtual returns (uint256)
```

_Gets the current votes balance for `account`_

### getPastVotes

```solidity
function getPastVotes(address account, uint256 blockNumber) public view virtual returns (uint256)
```

_Retrieve the number of votes for `account` at the end of `blockNumber`.

Requirements:

- `blockNumber` must have been already mined_

### getPastTotalSupply

```solidity
function getPastTotalSupply(uint256 blockNumber) public view virtual returns (uint256)
```

_Retrieve the `totalSupply` at the end of `blockNumber`. Note, this value is the sum of all balances.
It is but NOT the sum of all the delegated votes!

Requirements:

- `blockNumber` must have been already mined_

### delegate

```solidity
function delegate(address delegatee) public virtual
```

_Delegate votes from the sender to `delegatee`._

### delegateBySig

```solidity
function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) public virtual
```

_Delegates votes from signer to `delegatee`_

### _maxSupply

```solidity
function _maxSupply() internal view virtual returns (uint224)
```

_Maximum token supply. Defaults to `type(uint224).max` (2^224^ - 1)._

### _delegate

```solidity
function _delegate(address delegator, address delegatee) internal virtual
```

_Change delegation for `delegator` to `delegatee`.

Emits events {IVotes-DelegateChanged} and {IVotes-DelegateVotesChanged}._

inherits ERC20Permit:
### permit

```solidity
function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public virtual
```

_See {IERC20Permit-permit}._

### nonces

```solidity
function nonces(address owner) public view virtual returns (uint256)
```

_See {IERC20Permit-nonces}._

### DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

_See {IERC20Permit-DOMAIN_SEPARATOR}._

### _useNonce

```solidity
function _useNonce(address owner) internal virtual returns (uint256 current)
```

_"Consume a nonce": return the current value and increment.

_Available since v4.1.__

inherits EIP712:
### _domainSeparatorV4

```solidity
function _domainSeparatorV4() internal view returns (bytes32)
```

_Returns the domain separator for the current chain._

### _hashTypedDataV4

```solidity
function _hashTypedDataV4(bytes32 structHash) internal view virtual returns (bytes32)
```

_Given an already https://eips.ethereum.org/EIPS/eip-712#definition-of-hashstruct[hashed struct], this
function returns the hash of the fully encoded EIP712 message for this domain.

This hash can be used together with {ECDSA-recover} to obtain the signer of a message. For example:

```solidity
bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
    keccak256("Mail(address to,string contents)"),
    mailTo,
    keccak256(bytes(mailContents))
)));
address signer = ECDSA.recover(digest, signature);
```_

inherits IERC20Permit:
inherits ERC20Burnable:
### burn

```solidity
function burn(uint256 amount) public virtual
```

_Destroys `amount` tokens from the caller.

See {ERC20-_burn}._

### burnFrom

```solidity
function burnFrom(address account, uint256 amount) public virtual
```

_Destroys `amount` tokens from `account`, deducting from the caller's
allowance.

See {ERC20-_burn} and {ERC20-allowance}.

Requirements:

- the caller must have allowance for ``accounts``'s tokens of at least
`amount`._

inherits ERC20:
### name

```solidity
function name() public view virtual returns (string)
```

_Returns the name of the token._

### symbol

```solidity
function symbol() public view virtual returns (string)
```

_Returns the symbol of the token, usually a shorter version of the
name._

### decimals

```solidity
function decimals() public view virtual returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).

Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei. This is the value {ERC20} uses, unless this function is
overridden;

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

### totalSupply

```solidity
function totalSupply() public view virtual returns (uint256)
```

_See {IERC20-totalSupply}._

### balanceOf

```solidity
function balanceOf(address account) public view virtual returns (uint256)
```

_See {IERC20-balanceOf}._

### allowance

```solidity
function allowance(address owner, address spender) public view virtual returns (uint256)
```

_See {IERC20-allowance}._

### approve

```solidity
function approve(address spender, uint256 amount) public virtual returns (bool)
```

_See {IERC20-approve}.

NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
`transferFrom`. This is semantically equivalent to an infinite approval.

Requirements:

- `spender` cannot be the zero address._

### increaseAllowance

```solidity
function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool)
```

_Atomically increases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address._

### decreaseAllowance

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool)
```

_Atomically decreases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address.
- `spender` must have allowance for the caller of at least
`subtractedValue`._

### _transfer

```solidity
function _transfer(address from, address to, uint256 amount) internal virtual
```

_Moves `amount` of tokens from `from` to `to`.

This internal function is equivalent to {transfer}, and can be used to
e.g. implement automatic token fees, slashing mechanisms, etc.

Emits a {Transfer} event.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `from` must have a balance of at least `amount`._

### _approve

```solidity
function _approve(address owner, address spender, uint256 amount) internal virtual
```

_Sets `amount` as the allowance of `spender` over the `owner` s tokens.

This internal function is equivalent to `approve`, and can be used to
e.g. set automatic allowances for certain subsystems, etc.

Emits an {Approval} event.

Requirements:

- `owner` cannot be the zero address.
- `spender` cannot be the zero address._

### _spendAllowance

```solidity
function _spendAllowance(address owner, address spender, uint256 amount) internal virtual
```

_Updates `owner` s allowance for `spender` based on spent `amount`.

Does not update the allowance amount in case of infinite allowance.
Revert if not enough allowance is available.

Might emit an {Approval} event._

inherits IERC20Metadata:
inherits IERC20:
inherits IVotes:

 --- 
### Events:
### ControllerUpdated

```solidity
event ControllerUpdated(address newController)
```

### BlacklistUpdated

```solidity
event BlacklistUpdated(address user, bool value)
```

inherits Ownable2Step:
### OwnershipTransferStarted

```solidity
event OwnershipTransferStarted(address previousOwner, address newOwner)
```

inherits Ownable:
### OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```

inherits ERC20Votes:
inherits ERC20Permit:
inherits EIP712:
inherits IERC20Permit:
inherits ERC20Burnable:
inherits ERC20:
inherits IERC20Metadata:
inherits IERC20:
### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

_Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero._

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

_Emitted when the allowance of a `spender` for an `owner` is set by
a call to {approve}. `value` is the new allowance._

inherits IVotes:
### DelegateChanged

```solidity
event DelegateChanged(address delegator, address fromDelegate, address toDelegate)
```

_Emitted when an account changes their delegate._

### DelegateVotesChanged

```solidity
event DelegateVotesChanged(address delegate, uint256 previousBalance, uint256 newBalance)
```

_Emitted when a token transfer or delegate change results in changes to a delegate's number of votes._

