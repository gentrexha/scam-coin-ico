const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("ICO", function () {
  const name = "Scam Coin";
  const symbol = "ScamCoin";
  const decimalPlaces = "18";
  const initialSupply = "20000000000000000000000";
  const rate = "10";
  const cap = "1000000000000000000000";
  const waitTime = "120";
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  let scamcoin;
  let ico;
  let weth;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Scam Coin Deployment
    const ScamCoin = await ethers.getContractFactory("ScamCoin");
    scamcoin = await ScamCoin.deploy(
        name,
        symbol,
        decimalPlaces,
        initialSupply
    );
    await scamcoin.deployed();

    // Weth Deployment
    const Weth = await ethers.getContractFactory("FakeWETH");
    weth = await Weth.deploy();
    await weth.deployed();

    // ICO Deployment
    const ICO = await ethers.getContractFactory("ICO");
    ico = await ICO.deploy(
        rate,
        addr1.address,
        scamcoin.address,
        weth.address,
        cap,
        waitTime
    );
    await ico.deployed();

    // Set ICO as new Minter
    await scamcoin.setMinter(ico.address);
  });

  async function transferApproveWETHFixture() {
    await weth.transfer(addr1.address, ethers.utils.parseEther("1000"));
    await weth
        .connect(addr1)
        .approve(ico.address, ethers.utils.parseEther("1000"));
    return { scamcoin, ico, weth, owner, addr1, addr2 };
  }

  it("should successfully deploy", async function () {
    expect(await ico.address).to.not.equal(
        zeroAddress
    );
  });

  it("requires a non-zero rate", async function () {
    const ICO = await ethers.getContractFactory("ICO");
    await expect(
        ICO.deploy(
            "0",
            addr1.address,
            scamcoin.address,
            weth.address,
            cap,
            waitTime
        )
    ).to.be.revertedWith("Crowdsale: rate is 0");
  });

  it("requires a non-null wallet", async function () {
    const ICO = await ethers.getContractFactory("ICO");
    await expect(
        ICO.deploy(
            rate,
            zeroAddress,
            scamcoin.address,
            weth.address,
            cap,
            waitTime
        )
    ).to.be.revertedWith("Crowdsale: wallet is the zero address");
  });

  it("requires a non-null token", async function () {
    const ICO = await ethers.getContractFactory("ICO");
    await expect(
        ICO.deploy(rate, addr1.address, zeroAddress, weth.address, cap, waitTime)
    ).to.be.revertedWith("Crowdsale: token is the zero address");
  });

  it("requires a non-null acceptedToken", async function () {
    const ICO = await ethers.getContractFactory("ICO");
    await expect(
        ICO.deploy(
            rate,
            addr1.address,
            scamcoin.address,
            zeroAddress,
            cap,
            waitTime
        )
    ).to.be.revertedWith("Accepted Token: accepted token is the zero address");
  });

  it("requires a non-null cap", async function () {
    const ICO = await ethers.getContractFactory("ICO");
    await expect(
        ICO.deploy(
            rate,
            addr1.address,
            scamcoin.address,
            weth.address,
            "0",
            waitTime
        )
    ).to.be.revertedWith("Crowdsale: cap is 0");
  });

  it("should let you know if the cap was reached", async function () {
    expect(await ico.capReached()).to.equal(false);
  });

  it("should let you buy tokens", async function () {
    const { scamcoin, ico, weth, owner, addr1, addr2 } = await loadFixture(
        transferApproveWETHFixture
    );
    await ico.connect(addr1).buyTokens(ethers.utils.parseEther("1"));
    expect(await ico.balanceOf(addr1.address)).to.equal(
        ethers.utils.parseEther("10")
    );
  });

  it("should not let you buy 0 tokens", async function () {
    const { scamcoin, ico, weth, owner, addr1, addr2 } = await loadFixture(
        transferApproveWETHFixture
    );
    await expect(ico.connect(addr1).buyTokens(ethers.utils.parseEther("0"))).to.be.revertedWith("ICO: amount is 0'");
  });

  it("should not let you exceed the cap", async function () {
    await weth.transfer(addr1.address, ethers.utils.parseEther("1001"));
    await weth
        .connect(addr1)
        .approve(ico.address, ethers.utils.parseEther("1001"));
    await expect(ico.connect(addr1).buyTokens(ethers.utils.parseEther("1001"))).to.be.revertedWith("ICO: cap exceeded'");
  });

  it("should not let you buy tokens without receiving weth first", async function () {
    await weth.transfer(addr1.address, ethers.utils.parseEther("1000"));
    await expect(ico.connect(addr1).buyTokens(ethers.utils.parseEther("1"))).to.be.revertedWith("ERC20: insufficient allowance");
  });

  it("should let you withdraw tokens if the cap is reached and enough time has passed", async function () {
    const { scamcoin, ico, weth, owner, addr1, addr2 } = await loadFixture(
        transferApproveWETHFixture
    );
    await ico.connect(addr1).buyTokens(ethers.utils.parseEther("1000"));
    expect(await ico.capReached()).to.equal(true);
    expect(await ico.balanceOf(addr1.address)).to.equal(
        ethers.utils.parseEther("10000")
    );
    expect(await ico.ended()).to.equal(true);
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ico.connect(addr1).claimTokens();
  });

  it("should not let you withdraw tokens if the cap is not reached", async function () {
    const { scamcoin, ico, weth, owner, addr1, addr2 } = await loadFixture(
        transferApproveWETHFixture
    );
    await ico.connect(addr1).buyTokens(ethers.utils.parseEther("999"));
    expect(await ico.capReached()).to.equal(false);
    expect(await ico.balanceOf(addr1.address)).to.equal(
        ethers.utils.parseEther("9990")
    );
    expect(await ico.ended()).to.equal(false);
    await expect(ico.connect(addr1).claimTokens()).to.be.revertedWith("ICO not closed");
  });

  it("should not let you withdraw tokens if the cap is reached and not enough time has passed", async function () {
    const { scamcoin, ico, weth, owner, addr1, addr2 } = await loadFixture(
        transferApproveWETHFixture
    );
    await ico.connect(addr1).buyTokens(ethers.utils.parseEther("1000"));
    expect(await ico.capReached()).to.equal(true);
    expect(await ico.balanceOf(addr1.address)).to.equal(
        ethers.utils.parseEther("10000")
    );
    expect(await ico.ended()).to.equal(true);
    await ethers.provider.send("evm_increaseTime", [60]);
    await expect(ico.connect(addr1).claimTokens()).to.be.revertedWith("Waiting Time is not over");
  });

  it("should not let you withdraw tokens if you are not due any", async function () {
    const { scamcoin, ico, weth, owner, addr1, addr2 } = await loadFixture(
        transferApproveWETHFixture
    );
    await ico.connect(addr1).buyTokens(ethers.utils.parseEther("1000"));
    expect(await ico.capReached()).to.equal(true);
    expect(await ico.balanceOf(addr1.address)).to.equal(
        ethers.utils.parseEther("10000")
    );
    expect(await ico.ended()).to.equal(true);
    await ethers.provider.send("evm_increaseTime", [3600]);
    await expect(ico.connect(addr2).claimTokens()).to.be.revertedWith("msg.sender is not due any tokens");
  });
});
