// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contracts to deploy
  const ScamCoin = await hre.ethers.getContractFactory("ScamCoin");
  const scamcoin = await ScamCoin.deploy("ScamCoin", "SCAM", "18", "2000000000000000000000");

  await scamcoin.deployed();

  console.log("ScamCoin deployed to:", scamcoin.address);

  const ICO = await hre.ethers.getContractFactory("ICO");
  const ico = await ICO.deploy("10", "0xa0C605ac88359F8E50035A5708bAe45F050Dd3f5", scamcoin.address, "1000", "120");

  await ico.deployed();

  console.log("ICO deployed to:", ico.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
