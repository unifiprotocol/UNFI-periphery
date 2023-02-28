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

    // deploy UNFI contract for testing
    unifiToken = await (
      await ethers.getContractFactory("UNFI")
    ).deploy("UNFI", "Unifi Protocol DAO", 0);

    // deploy UnifiProtocolVotingToken contract
    votingToken = await (
      await ethers.getContractFactory("UnifiProtocolVotingToken")
    ).deploy(unifiToken.address);

    // transfer UNFI tokens to the users for testing
    await unifiToken.transfer(
      await user1.getAddress(),
      ethers.utils.parseEther("100")
    );
    await unifiToken.transfer(
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
        ethers.utils.parseEther("175")
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
        ethers.utils.parseEther("75")
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
      ).to.be.revertedWith("vUNFI: INSUFFICIENT_BALANCE");

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
});
