import { expect } from "chai";
import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import {
  AMOUNT_OUT_MIN,
  CHAIN_ID,
  deadline,
  HOP_RELAYER,
  RELAYER_FEE,
} from "../shared/constants";

chai.use(solidity);

export async function shouldSendEthToHop() {
  const SEND_AMOUNT = 200;

  const [owner] = await ethers.getSigners();
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();
  await myToken.deployed();
  const RootManager = await ethers.getContractFactory("RootManager");
  const rootManager = await RootManager.deploy();
  await rootManager.deployed();

  const HopBridgeEth = await ethers.getContractFactory("HopBridge");
  const hopBridgeEth = await HopBridgeEth.deploy();
  await hopBridgeEth.deployed();

  const HopBridgeErc20 = await ethers.getContractFactory("HopBridge");
  const hopBridgeErc20 = await HopBridgeErc20.deploy();
  await hopBridgeErc20.deployed();

  const HydraBridge = await ethers.getContractFactory("HydraBridge");
  const hydraBridge = await HydraBridge.deploy(
    rootManager.address,
    myToken.address,
    hopBridgeEth.address,
    hopBridgeErc20.address
  );

  await hydraBridge.deployed();

  const tx = await hydraBridge.functions.sendEthToL2Hop(
    owner.address,
    CHAIN_ID,
    AMOUNT_OUT_MIN,
    deadline,
    HOP_RELAYER,
    RELAYER_FEE,
    {
      value: SEND_AMOUNT,
    }
  );
  await expect(tx).to.changeEtherBalance(owner, -SEND_AMOUNT);
}
