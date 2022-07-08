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
1. Gas fees are payments made by users to compensate for the computing energy required to process and validate 
transactions on the Ethereum blockchain. 
"Gas limit" refers to the maximum amount of gas (or energy) that you're willing to spend on a particular transaction.
Miners set the price of gas based on supply and demand for the computational power of the network needed to process
smart contracts and other transactions.
2. Nonce is the number of transactions sent from a given address. This value prevents double-spending, as the nonce 
will always specify the order of transactions.
3. A transaction hash/id is a unique string of characters that is given to every transaction that is verified and 
added to the blockchain.
4. As of right now I'm using `hardhat-gas-reporter`. TODO: Add more here
5. The primary difference is that no single private key is utilized to validate transactions for smart contracts. 
Instead, the smart contract code defines the logic behind how the account completes transactions. 
Smart contracts are programs that operate on the Ethereum blockchain when certain criteria are satisfied. 
Where as, for a private key controlled account they consist of a single private key that can be used to make 
transactions and sign messages