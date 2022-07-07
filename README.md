# Scam Coin ICO

## Goal

Write an ICO contract to raise 1000 WETH. Anyone can participate in the sale by transferring WETH (wrapped Ether) 
to the ICO contract. Once the 1000 WETH are raised, the sale is over and no one can participate anymore. 
2 minutes after the sale ended the participants can claim 10 SCAM tokens from the ICO contract for every WETH they invested.

## Requirements

- Write contracts in solidity.
  - Write ICO contract based on upper requirements.
  - Create SCAM token.
    - Decimals: 18
    - Name: Scam Coin
    - Symbol: SCAM
  - Use the WETH wrapped ether token (https://github.com/gnosis/canonical-weth) NOT Ether directly to participate in the ICO.
- Use Hardhat (or Foundry) and ethers.js and use WETH9 as an external dependency.
- Unit tests for your smart contract!
- Use https://github.com/sc-forks/solidity-coverage to test coverage and reach 100% with automated truffle tests.
- Deploy contract on rinkeby testnet using hardat deploy. 
- Save artifacts in a git repository.
- Use https://safe-relay.dev.gnosisdev.com/api/v1/gas-station/ to estimate gas costs for transactions.
- Implementation time: 1-5 days.
- Share the git repository with your mentor.

## Deployment

Deploy using hardhat:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network rinkeby
npx hardhat verify "<ScamCoin Address>" --network rinkeby "ScamCoin" "SCAM" "18" "2000000000000000000000"
npx hardhat verify "<ICO Address>" --network rinkeby "10" "<Wallet Address>" "<ScamCoin Address>" "10000" "120"
```

## Questions

1. What is gas, gas limit and gas price?
2. What is a nonce?
3. What is a transaction hash?
4. How can you estimate gas costs and what is the issue with eth_estimateGas?
5. What is the difference between a smart contract and a private key controlled account?

## Answers

TODO!
