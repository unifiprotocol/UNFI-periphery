import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import {
  SampleERC20,
  UnifiProtocolVotingToken,
  UnifiStaking,
} from "../typechain";

describe("vUNFI", () => {
  let owner: Signer;
  let user1: Signer;

  let baseToken: SampleERC20;
  let stakingContract: UnifiStaking;
  let votingToken: UnifiProtocolVotingToken;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    baseToken = await ethers
      .getContractFactory("SampleERC20")
      .then((factory) => factory.deploy("Token", "TKN", 100));

    votingToken = await ethers
      .getContractFactory("UnifiProtocolVotingToken")
      .then((factory) => factory.deploy());

    stakingContract = await ethers
      .getContractFactory("UnifiStaking")
      .then((factory) =>
        factory.deploy(baseToken.address, votingToken.address)
      );
  });

  describe("constructor", () => {
    it("should set the correct name and symbol", async () => {
      expect(await votingToken.name()).to.equal("Unifi Protocol Voting Token");
      expect(await votingToken.symbol()).to.equal("vUNFI");
    });
  });

  describe("Access Control", function () {
    it("Should allow the owner to grant the DELEGATED_ROLE", async () => {
      await votingToken.setDelegated(await user1.getAddress());
      expect(await votingToken.delegated()).to.be.equal(
        await user1.getAddress()
      );
    });

    it("Should allow to DELEGATED_ROLE to mint and burn tokens", async () => {
      await votingToken.setDelegated(await user1.getAddress());
      const votingTokenAsUser1 = votingToken.connect(user1);
      await votingTokenAsUser1.mint(await user1.getAddress(), 100);
      expect(await votingToken.balanceOf(await user1.getAddress())).to.equal(
        100
      );

      await votingTokenAsUser1["burn(address,uint256)"](
        await user1.getAddress(),
        100
      );
      expect(await votingToken.balanceOf(await user1.getAddress())).to.equal(0);
    });

    it("Should allow to DELEGATED_ROLE to transfer tokens #0", async () => {
      await votingToken.setDelegated(stakingContract.address);
      await baseToken.approve(stakingContract.address, 100);
      await stakingContract.stake(100);
      expect(await votingToken.balanceOf(await owner.getAddress())).to.equal(
        100
      );
    });

    it("Should allow to DELEGATED_ROLE to transfer using transferFrom tokens #1", async () => {
      await votingToken.setDelegated(await user1.getAddress());
      const votingTokenAsUser1 = votingToken.connect(user1);
      await votingTokenAsUser1.mint(await user1.getAddress(), 100);
      await votingTokenAsUser1.approve(await user1.getAddress(), 100);
      await votingTokenAsUser1.transferFrom(
        await user1.getAddress(),
        await owner.getAddress(),
        100
      );
      expect(await votingToken.balanceOf(await owner.getAddress())).to.equal(
        100
      );
      expect(await votingToken.balanceOf(await user1.getAddress())).to.equal(0);
    });

    it("Should prevent to transfer tokens because the user doesn't have DELEGATED_ROLE", async () => {
      const votingTokenAsUser1 = votingToken.connect(user1);
      await votingToken.mint(await user1.getAddress(), 100);
      await expect(
        votingTokenAsUser1.transfer(await owner.getAddress(), 100)
      ).to.be.revertedWith("UnifiProtocolVotingToken: onlyOwnerOrDelegated");
    });

    it("Should prevent to mint tokens because the user doesn't have DELEGATED_ROLE", async () => {
      const votingTokenAsUser1 = votingToken.connect(user1);
      await expect(
        votingTokenAsUser1.mint(await user1.getAddress(), 100)
      ).to.be.revertedWith("UnifiProtocolVotingToken: onlyOwnerOrDelegated");
    });

    it("Should prevent to burn tokens because the user doesn't have DELEGATED_ROLE", async () => {
      const votingTokenAsUser1 = votingToken.connect(user1);
      await expect(
        votingTokenAsUser1["burn(address,uint256)"](
          await owner.getAddress(),
          100
        )
      ).to.be.revertedWith("UnifiProtocolVotingToken: onlyOwnerOrDelegated");
    });

    it("Should prevent to transferFrom tokens because the user doesn't have DELEGATED_ROLE", async () => {
      const votingTokenAsUser1 = votingToken.connect(user1);
      const ownerAddr = await owner.getAddress();
      await expect(
        votingTokenAsUser1.transferFrom(ownerAddr, ownerAddr, 100)
      ).to.be.revertedWith("UnifiProtocolVotingToken: onlyOwnerOrDelegated");
    });
  });

  describe("delegating", () => {
    it("should allow users to delegate their voting power to another user, then delegate to a different user", async () => {
      const ownerAddr = await owner.getAddress();
      const user1Address = await user1.getAddress();

      await votingToken.mint(user1Address, ethers.utils.parseEther("100"));
      await votingToken.connect(user1).delegate(ownerAddr);
      expect(await votingToken.getVotes(ownerAddr)).to.equal(
        ethers.utils.parseEther("100")
      );
      expect(await votingToken.delegates(user1Address)).to.equal(ownerAddr);
      expect(await votingToken.delegates(ownerAddr)).to.equal(
        ethers.constants.AddressZero
      );
      expect(await votingToken.connect(user1).delegate(user1Address));
      expect(await votingToken.delegates(user1Address)).to.equal(user1Address);
      expect(await votingToken.getVotes(ownerAddr)).to.equal(
        ethers.utils.parseEther("0")
      );
      expect(await votingToken.getVotes(user1Address)).to.equal(
        ethers.utils.parseEther("100")
      );
    });
  });
});
