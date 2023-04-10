import { ethers } from "hardhat";
import { expect } from "chai";
import { constants } from "ethers";
import {
  SampleERC20,
  TimelockController,
  UnifiGovernor,
} from "../typechain-types";

describe("vUNIFIGovernor", function () {
  let vUNIFIGovernor: UnifiGovernor;
  let token: SampleERC20;
  let timeLock: TimelockController;

  beforeEach(async function () {
    const [addr0] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("SampleERC20");
    token = await Token.deploy("UNFI", "Unifi Protocol DAO", 1000000000);

    const TimelockController = await ethers.getContractFactory(
      "@openzeppelin/contracts/governance/TimelockController.sol:TimelockController"
    );
    timeLock = await TimelockController.deploy(
      5,
      [],
      [constants.AddressZero],
      addr0.address
    );

    const vUNIFIGovernorFactory = await ethers.getContractFactory(
      "UnifiGovernor"
    );
    vUNIFIGovernor = await vUNIFIGovernorFactory
      .deploy(token.address, timeLock.address)
      .then((x) => x.deployed());

    await timeLock.grantRole(
      await timeLock.PROPOSER_ROLE(),
      vUNIFIGovernor.address
    );
  });

  describe("constructor", function () {
    it('Should match the "token" address', async function () {
      expect(await vUNIFIGovernor.token()).to.equal(token.address);
    });

    it('Should match the "timelock" address', async function () {
      const contractTimelock = await vUNIFIGovernor.timelock();
      expect(contractTimelock).to.equal(timeLock.address);
    });
  });

  describe("vars", function () {
    it("Should fail trying to update quorum because not enough permissions", async function () {
      await expect(vUNIFIGovernor.setQuorum(40000000)).revertedWith(
        "Governor: onlyGovernance"
      );
    });

    it("Should fail trying to update proposalThreshold because not enough permissions", async function () {
      await expect(vUNIFIGovernor.setProposalThreshold(10000000)).revertedWith(
        "Governor: onlyGovernance"
      );
    });
  });
});
