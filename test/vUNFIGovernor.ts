import { ethers } from "hardhat";
import { expect } from "chai";
import { constants } from "ethers";
import { SampleERC20, TimelockController, UnifiGovernor } from "../typechain";

describe("vUNFIGovernor", function () {
  let vUNFIGovernor: UnifiGovernor;
  let token: SampleERC20;
  let timeLock: TimelockController;

  beforeEach(async function () {
    const [addr0] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("SampleERC20");
    token = await Token.deploy("UNFI", "Unifi Protocol DAO", 1000000000);

    const TimelockController = await ethers.getContractFactory(
      "TimelockController"
    );
    timeLock = await TimelockController.deploy(
      5,
      [],
      [constants.AddressZero],
      addr0.address
    );

    const vUNFIGovernorFactory = await ethers.getContractFactory(
      "UnifiGovernor"
    );
    vUNFIGovernor = await vUNFIGovernorFactory
      .deploy(token.address, timeLock.address)
      .then((x) => x.deployed());

    await timeLock.grantRole(
      await timeLock.PROPOSER_ROLE(),
      vUNFIGovernor.address
    );
  });

  describe("constructor", function () {
    it('Should match the "token" address', async function () {
      expect(await vUNFIGovernor.token()).to.equal(token.address);
    });

    it('Should match the "timelock" address', async function () {
      const contractTimelock = await vUNFIGovernor.timelock();
      expect(contractTimelock).to.equal(timeLock.address);
    });
  });

  describe("vars", function () {
    it("Should fail trying to update quorum because not enough permissions", async function () {
      await expect(vUNFIGovernor.setQuorum(40000000)).revertedWith(
        "Governor: onlyGovernance"
      );
    });

    it("Should fail trying to update proposalThreshold because not enough permissions", async function () {
      await expect(vUNFIGovernor.setProposalThreshold(10000000)).revertedWith(
        "Governor: onlyGovernance"
      );
    });
  });
});
