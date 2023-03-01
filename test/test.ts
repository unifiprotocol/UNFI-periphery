import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { UnifiProtocolVotingToken } from "../typechain-types/contracts/vUNFIVan.sol";
import { UNFI } from "../typechain-types/contracts/UNFI";

describe("UnifiProtocolVotingToken", () => {
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;

  let unifiToken: UNFI;
  let votingToken: UnifiProtocolVotingToken;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    unifiToken = await (
      await ethers.getContractFactory("UNFI")
    ).deploy("UNFI", "Unifi Protocol DAO", 18);

    //deploy UnifiProtocolVotingToken contract
    votingToken = await (
      await ethers.getContractFactory("UnifiProtocolVotingToken")
    ).deploy(unifiToken.address);

    //mint unfi tokens to the users for testing
    await unifiToken.mint(
      await owner.getAddress(),
      ethers.utils.parseEther("1000")
    );
    await unifiToken.mint(
      await user1.getAddress(),
      ethers.utils.parseEther("100")
    );
    await unifiToken.mint(
      await user2.getAddress(),
      ethers.utils.parseEther("200")
    );
  });

  describe("constructor", () => {
    it("should set the correct name and symbol", async () => {
      expect(await votingToken.name()).to.equal("Unifi Protocol Voting Token");
      expect(await votingToken.symbol()).to.equal("vUNFI");
    });

    it("should set the UNFI token address", async () => {
      expect(await votingToken.unfiToken()).to.equal(unifiToken.address);
    });
  });

  describe("stake", () => {
    it("should not allow staking zero tokens", async () => {
      await expect(votingToken.connect(user1).stake(0)).to.be.revertedWith(
        "vUNFI: NO_UNFI_TO_STAKE"
      );
    });

    it("should allow users to stake UNFI tokens and receive vUNFI tokens", async () => {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      // user1 stakes 50 UNFI tokens
      await unifiToken
        .connect(user1)
        .approve(votingToken.address, ethers.utils.parseEther("50"));
      await votingToken.connect(user1).stake(ethers.utils.parseEther("50"));

      // user2 stakes 100 UNFI tokens
      await unifiToken
        .connect(user2)
        .approve(votingToken.address, ethers.utils.parseEther("100"));
      await votingToken.connect(user2).stake(ethers.utils.parseEther("100"));

      // check user balances
      expect(await unifiToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await unifiToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );
      expect(await votingToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await votingToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );

      // check total staked amount
      expect(await votingToken.totalStaked()).to.equal(
        ethers.utils.parseEther("150")
      );
    });
  });

  describe("withdraw", () => {
    it("should not allow withdrawing zero tokens", async () => {
      await expect(votingToken.connect(user1).withdraw(0)).to.be.revertedWith(
        "vUNFI: CANNOT_UNSTAKE_ZERO"
      );
    });

    it("should allow users to withdraw their staked tokens", async () => {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      // user1 stakes 50 UNFI tokens
      await unifiToken
        .connect(user1)
        .approve(votingToken.address, ethers.utils.parseEther("50"));
      await votingToken.connect(user1).stake(ethers.utils.parseEther("50"));

      // user2 stakes 100 UNFI tokens
      await unifiToken
        .connect(user2)
        .approve(votingToken.address, ethers.utils.parseEther("100"));
      await votingToken.connect(user2).stake(ethers.utils.parseEther("100"));

      // user1 withdraws 25 vUNFI tokens
      await votingToken.connect(user1).withdraw(ethers.utils.parseEther("25"));

      // check user balances
      expect(await unifiToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("75")
      );
      expect(await unifiToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );
      expect(await votingToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("25")
      );
      expect(await votingToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );

      // check total staked amount
      expect(await votingToken.totalStaked()).to.equal(
        ethers.utils.parseEther("125")
      );

      // user2 withdraws all their vUNFI tokens
      await votingToken.connect(user2).withdraw(ethers.utils.parseEther("100"));

      // check user balances
      expect(await unifiToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("75")
      );
      expect(await unifiToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("200")
      );
      expect(await votingToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("25")
      );
      expect(await votingToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("0")
      );

      // check total staked amount
      expect(await votingToken.totalStaked()).to.equal(
        ethers.utils.parseEther("25")
      );
    });

    it("should not allow users to withdraw more than their balance", async () => {
      const user1Address = await user1.getAddress();

      // user1 stakes 50 UNFI tokens
      await unifiToken
        .connect(user1)
        .approve(votingToken.address, ethers.utils.parseEther("50"));
      await votingToken.connect(user1).stake(ethers.utils.parseEther("50"));

      // user1 tries to withdraw 100 vUNFI tokens, which is more than their balance
      await expect(
        votingToken.connect(user1).withdraw(ethers.utils.parseEther("100"))
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");

      // check user balances
      expect(await unifiToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await votingToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );

      // check total staked amount
      expect(await votingToken.totalStaked()).to.equal(
        ethers.utils.parseEther("50")
      );
    });
  });

  describe("transfer of vUNFI between non-wrapper contracts", () => {
    it("should not allow users to transfer vUNFI between users", async () => {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      await expect(
        votingToken
          .connect(user1)
          .transfer(user2Address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("vUNFI: TRANSFER_DISABLED");
    });
  });

  describe("staking rewards", () => {
    it("should allow users to claim their staking rewards and show increased balance of UNFI", async () => {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      // user1 stakes 50 UNFI tokens
      await unifiToken
        .connect(user1)
        .approve(votingToken.address, ethers.utils.parseEther("50"));
      await votingToken.connect(user1).stake(ethers.utils.parseEther("50"));

      // user2 stakes 100 UNFI tokens
      await unifiToken
        .connect(user2)
        .approve(votingToken.address, ethers.utils.parseEther("100"));
      await votingToken.connect(user2).stake(ethers.utils.parseEther("100"));

      await unifiToken
        .connect(owner)
        .approve(votingToken.address, ethers.utils.parseEther("1000"));
      await unifiToken
        .connect(owner)
        .transfer(votingToken.address, ethers.utils.parseEther("1000"));
      await votingToken.connect(owner).setRewardsDuration(60);
      await votingToken
        .connect(owner)
        .setRewardAmount(ethers.utils.parseEther("1"));

      await ethers.provider.send("evm_increaseTime", [60]); // Advance time by 60 seconds
      await ethers.provider.send("evm_mine", []); // Mine a new block to update the block timestamp

      // user1 claims their staking rewards
      await votingToken.connect(user1).getReward();

      // check user balances
      expect(await unifiToken.balanceOf(user1Address)).to.be.greaterThan(
        ethers.utils.parseEther("50")
      );
      expect(await unifiToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );
      expect(await votingToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await votingToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );

      // check total staked amount
      expect(await votingToken.totalStaked()).to.equal(
        ethers.utils.parseEther("150")
      );

      // user2 claims their staking rewards
      await votingToken.connect(user2).getReward();

      // check user balances
      expect(await unifiToken.balanceOf(user1Address)).to.be.greaterThan(
        ethers.utils.parseEther("50")
      );
      expect(await unifiToken.balanceOf(user2Address)).to.be.greaterThan(
        ethers.utils.parseEther("100")
      );
      expect(await votingToken.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await votingToken.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );

      // check total staked amount
      expect(await votingToken.totalStaked()).to.equal(
        ethers.utils.parseEther("150")
      );
    });
  });
});
