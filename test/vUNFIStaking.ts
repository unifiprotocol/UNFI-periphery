import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import {
  UnifiProtocolVotingToken,
  SampleERC20,
  UnifiStaking,
} from "../typechain";

describe("vUNFIStaking", () => {
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let user3: Signer;

  let token0: SampleERC20;
  let govUnfi: UnifiProtocolVotingToken;
  let staking: UnifiStaking;

  beforeEach(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners();

    token0 = await ethers
      .getContractFactory("SampleERC20")
      .then((factory) =>
        factory.deploy("UNFI", "Unifi Protocol DAO", 1000000000)
      );
    govUnfi = await ethers
      .getContractFactory("UnifiProtocolVotingToken")
      .then((factory) => factory.deploy());

    staking = await ethers
      .getContractFactory("UnifiStaking")
      .then((factory) => factory.deploy(token0.address, govUnfi.address));

    await govUnfi.setDelegated(staking.address);

    //mint unfi tokens to the users for testing
    await token0.mint(
      await owner.getAddress(),
      ethers.utils.parseEther("1000")
    );
    await token0.mint(await user1.getAddress(), ethers.utils.parseEther("100"));
    await token0.mint(await user2.getAddress(), ethers.utils.parseEther("200"));
  });

  describe("constructor", () => {
    it("should match with token addresses", async () => {
      expect(await staking.token()).to.equal(token0.address);
      expect(await staking.wrappedToken()).to.equal(govUnfi.address);
    });
  });

  describe("stake", () => {
    it("should not allow staking zero tokens", async () => {
      await expect(staking.connect(user1).stake(0)).to.be.revertedWith(
        "vUNFI: NO_UNFI_TO_STAKE"
      );
    });

    it("should fail to stake tokens with not enough balances", async () => {
      const amount = ethers.utils.parseEther("5214124124120");
      await token0.connect(user1).approve(staking.address, amount);
      await expect(staking.connect(user1).stake(amount)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      );
    });

    it("should allow users to stake UNFI tokens and receive vUNFI tokens", async () => {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      // user1 stakes 50 UNFI tokens
      await token0
        .connect(user1)
        .approve(staking.address, ethers.utils.parseEther("50"));
      await staking.connect(user1).stake(ethers.utils.parseEther("50"));

      // user2 stakes 100 UNFI tokens
      await token0
        .connect(user2)
        .approve(staking.address, ethers.utils.parseEther("100"));
      await staking.connect(user2).stake(ethers.utils.parseEther("100"));

      // check user balances
      expect(await token0.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await token0.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );
      expect(await govUnfi.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await govUnfi.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );

      // check total staked amount
      expect(await staking.totalStaked()).to.equal(
        ethers.utils.parseEther("150")
      );
    });
  });

  describe("withdraw", () => {
    it("should not allow withdrawing zero tokens", async () => {
      await expect(staking.connect(user1).withdraw(0)).to.be.revertedWith(
        "vUNFI: CANNOT_UNSTAKE_ZERO"
      );
    });

    it("should fail withdrawing tokens with no staking made", async () => {
      const stakingAddr1 = staking.connect(user1);
      await expect(stakingAddr1.withdraw(12412)).to.be.revertedWith(
        "ERC20: burn amount exceeds balance"
      );
    });

    it("should allow users to withdraw their staked tokens", async () => {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      // user1 stakes 50 UNFI tokens
      await token0
        .connect(user1)
        .approve(staking.address, ethers.utils.parseEther("50"));
      await staking.connect(user1).stake(ethers.utils.parseEther("50"));

      // user2 stakes 100 UNFI tokens
      await token0
        .connect(user2)
        .approve(staking.address, ethers.utils.parseEther("100"));
      await staking.connect(user2).stake(ethers.utils.parseEther("100"));

      // user1 withdraws 25 vUNFI tokens
      await staking.connect(user1).withdraw(ethers.utils.parseEther("25"));

      // check user balances
      expect(await token0.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("75")
      );
      expect(await token0.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );
      expect(await govUnfi.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("25")
      );
      expect(await govUnfi.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );

      // check total staked amount
      expect(await staking.totalStaked()).to.equal(
        ethers.utils.parseEther("125")
      );

      // user2 withdraws all their vUNFI tokens
      await staking.connect(user2).withdraw(ethers.utils.parseEther("100"));

      // check user balances
      expect(await token0.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("75")
      );
      expect(await token0.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("200")
      );
      expect(await govUnfi.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("25")
      );
      expect(await govUnfi.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("0")
      );

      // check total staked amount
      expect(await staking.totalStaked()).to.equal(
        ethers.utils.parseEther("25")
      );
    });

    it("should not allow users to withdraw more than their balance", async () => {
      const user1Address = await user1.getAddress();

      // user1 stakes 50 UNFI tokens
      await token0
        .connect(user1)
        .approve(staking.address, ethers.utils.parseEther("50"));
      await staking.connect(user1).stake(ethers.utils.parseEther("50"));

      // user1 tries to withdraw 100 vUNFI tokens, which is more than their balance
      await expect(
        staking.connect(user1).withdraw(ethers.utils.parseEther("100"))
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");

      // check user balances
      expect(await token0.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await govUnfi.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );

      // check total staked amount
      expect(await staking.totalStaked()).to.equal(
        ethers.utils.parseEther("50")
      );
    });
  });

  describe("staking rewards", () => {
    it("should allow users to claim their staking rewards and show increased balance of UNFI", async () => {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      // user1 stakes 50 UNFI tokens
      await token0
        .connect(user1)
        .approve(staking.address, ethers.utils.parseEther("50"));
      await staking.connect(user1).stake(ethers.utils.parseEther("50"));

      // user2 stakes 100 UNFI tokens
      await token0
        .connect(user2)
        .approve(staking.address, ethers.utils.parseEther("100"));
      await staking.connect(user2).stake(ethers.utils.parseEther("100"));

      await token0
        .connect(owner)
        .approve(staking.address, ethers.utils.parseEther("1000"));
      await token0
        .connect(owner)
        .transfer(staking.address, ethers.utils.parseEther("1000"));
      await staking.connect(owner).setRewardsDuration(60);
      await staking
        .connect(owner)
        .setRewardAmount(ethers.utils.parseEther("1"));

      await ethers.provider.send("evm_increaseTime", [60]); // Advance time by 60 seconds
      await ethers.provider.send("evm_mine", []); // Mine a new block to update the block timestamp

      // user1 claims their staking rewards
      await staking.connect(user1).getReward();

      // check user balances
      expect(await token0.balanceOf(user1Address)).to.be.greaterThan(
        ethers.utils.parseEther("50")
      );
      expect(await token0.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );
      expect(await govUnfi.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await govUnfi.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );

      // check total staked amount
      expect(await staking.totalStaked()).to.equal(
        ethers.utils.parseEther("150")
      );

      // user2 claims their staking rewards
      await staking.connect(user2).getReward();

      // check user balances
      expect(await token0.balanceOf(user1Address)).to.be.greaterThan(
        ethers.utils.parseEther("50")
      );
      expect(await token0.balanceOf(user2Address)).to.be.greaterThan(
        ethers.utils.parseEther("100")
      );
      expect(await govUnfi.balanceOf(user1Address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await govUnfi.balanceOf(user2Address)).to.equal(
        ethers.utils.parseEther("100")
      );

      // check total staked amount
      expect(await staking.totalStaked()).to.equal(
        ethers.utils.parseEther("150")
      );
    });
  });
});
