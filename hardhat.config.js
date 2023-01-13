require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

const QUICKNODE_HTTP_URL_GOERLI = process.env.QUICKNODE_HTTP_URL_GOERLI;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GANACHE_URL = process.env.GANACHE_URL;
const GANACHE_ACCOUNT_1_PRIVATE_KEYS = process.env.GANACHE_ACCOUNT_1_PRIVATE_KEYS;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    // defaultNetwork: "ganache",
    goerli: {
      url: QUICKNODE_HTTP_URL_GOERLI,
      accounts: [PRIVATE_KEY],
    },
    ganache: {
      url: GANACHE_URL,
      // accounts: [privateKey1, privateKey2, ...]
      accounts: [
        PRIVATE_KEY,                      // This is Macias account
        GANACHE_ACCOUNT_1_PRIVATE_KEYS,   // This is the first account that Ganache creates by default
      ],
    }
  },
};
