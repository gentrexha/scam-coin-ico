const hre = require("hardhat");

async function main() {
  // We get the contracts to deploy
  const ScamCoin = await hre.ethers.getContractFactory("ScamCoin");
  const scamcoin = await ScamCoin.deploy(
      "ScamCoin",
      "SCAM",
      "18",
      "2000000000000000000000"
  );

  await scamcoin.deployed();

  console.log("ScamCoin deployed to:", scamcoin.address);

  const ICO = await hre.ethers.getContractFactory("ICO");
  const ico = await ICO.deploy(
      "10",
      "0xa0C605ac88359F8E50035A5708bAe45F050Dd3f5",  // My wallet
      scamcoin.address,
      "0xc778417E063141139Fce010982780140Aa0cD5Ab", // WETH9 Address on Rinkeby
      "1000",
      "120"
  );

  await ico.deployed();

  console.log("ICO deployed to:", ico.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
