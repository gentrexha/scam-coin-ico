const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Scam Coin", function () {
  const name = "Scam Coin";
  const symbol = "ScamCoin";
  const decimalPlaces = "18";
  const initialSupply = "2000000000000000000000";
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  let scamcoin;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    const ScamCoin = await ethers.getContractFactory("ScamCoin");
    scamcoin = await ScamCoin.deploy(
        name,
        symbol,
        decimalPlaces,
        initialSupply
    );
    await scamcoin.deployed();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  async function approveTransferTokensFixture() {
    await scamcoin
        .connect(addr1)
        .approve(owner.address, ethers.utils.parseEther("1000"));
    await scamcoin.transfer(addr1.address, ethers.utils.parseEther("1000"));
    return { scamcoin, owner, addr1, addr2 };
  }

  it("should successfully deploy", async function () {});

  it("has a name", async function () {
    expect(await scamcoin.name()).to.equal(name);
  });

  it("has a symbol", async function () {
    expect(await scamcoin.symbol()).to.equal(symbol);
  });

  it("has 18 decimals", async function () {
    expect(await scamcoin.decimals()).to.equal(decimalPlaces);
  });

  it("should deploy with `initialSupply` for the owner of the contract", async function () {
    const balance = await scamcoin.balanceOf(owner.address);
    expect(ethers.utils.formatEther(balance)).to.equal(
        ethers.utils.formatEther(initialSupply)
    );
  });

  it("should let you send tokens to another address", async function () {
    await scamcoin.transfer(addr1.address, ethers.utils.parseEther("1000"));
    expect(await scamcoin.balanceOf(addr1.address)).to.equal(
        ethers.utils.parseEther("1000")
    );
  });

  it("should let you give another address the approval to send on your behalf", async function () {
    const { scamcoin, addr1, addr2 } = await loadFixture(
        approveTransferTokensFixture
    );
    await scamcoin.transferFrom(
        addr1.address,
        addr2.address,
        ethers.utils.parseEther("1000")
    );
    expect(await scamcoin.balanceOf(addr2.address)).to.equal(
        ethers.utils.parseEther("1000")
    );
  });

  it("should not let you spend more than you have", async function () {
    await scamcoin.transfer(addr1.address, ethers.utils.parseEther("1000"));
    await expect(
        scamcoin
            .connect(addr1)
            .transfer(addr2.address, ethers.utils.parseEther("2000"))
    ).to.be.revertedWith("Value exceeds sender's balance");
  });

  it("should not let you send to the 0 address", async function () {
    await expect(
        scamcoin.transfer(zeroAddress, ethers.utils.parseEther("1000"))
    ).to.be.revertedWith("Can not transfer to zero address");
  });

  it("should let you give the approval to the 0 address", async function () {
    await expect(
        scamcoin
            .connect(addr1)
            .approve(zeroAddress, ethers.utils.parseEther("1000"))
    ).to.be.revertedWith("Can not approve zero address");
  });

  it("should not let an approved address spend more than you have", async function () {
    const { scamcoin, addr1, addr2 } = await loadFixture(
        approveTransferTokensFixture
    );
    await expect(
        scamcoin.transferFrom(
            addr1.address,
            addr2.address,
            ethers.utils.parseEther("2000")
        )
    ).to.be.revertedWith("Value exceeds balance of from address");
  });

  it("should not let an approved address spend more than you have approved", async function () {
    await scamcoin
        .connect(addr1)
        .approve(owner.address, ethers.utils.parseEther("1000"));
    await scamcoin.transfer(addr1.address, ethers.utils.parseEther("1500"));
    await expect(
        scamcoin.transferFrom(
            addr1.address,
            addr2.address,
            ethers.utils.parseEther("1500")
        )
    ).to.be.revertedWith("Value exceeds allowance of from address for sender'");
  });

  it("should let you mint tokens to another address", async function () {
    await scamcoin.mint(addr1.address, ethers.utils.parseEther("1000"));
    expect(await scamcoin.balanceOf(addr1.address)).to.equal(
        ethers.utils.parseEther("1000")
    );
  });

  it("should not let you mint tokens to the zero address", async function () {
    await expect(
        scamcoin.mint(zeroAddress, ethers.utils.parseEther("1000"))
    ).to.be.revertedWith("Can not mint to the zero address");
  });

  it("should not let you mint from another address", async function () {
    await expect(
        scamcoin
            .connect(addr1)
            .mint(addr1.address, ethers.utils.parseEther("1000"))
    ).to.be.revertedWith("Only owner can mint new coins");
  });

  it("should let you set a new minter address", async function () {
    await scamcoin.setMinter(addr1.address);
    expect(await scamcoin.minter()).to.equal(addr1.address);
  });

  it("should not let you set a new minter to the zero address", async function () {
    await expect(scamcoin.setMinter(zeroAddress)).to.be.revertedWith(
        "Minter can not be changed to the zero address"
    );
  });

  it("should not let you set a new minter from another address", async function () {
    await expect(
        scamcoin.connect(addr1).setMinter(addr1.address)
    ).to.be.revertedWith("Only owner can change minter");
  });
});
