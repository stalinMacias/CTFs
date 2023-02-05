require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

const QUICKNODE_HTTP_URL_GOERLI = process.env.QUICKNODE_HTTP_URL_GOERLI;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Ganache UI
const GANACHE_URL = process.env.GANACHE_URL;
const GANACHE_ACCOUNT_1_PRIVATE_KEYS = process.env.GANACHE_ACCOUNT_1_PRIVATE_KEYS;
const GANACHE_ACCOUNT_2_PRIVATE_KEYS = process.env.GANACHE_ACCOUNT_2_PRIVATE_KEYS;

// Ganache CLI
const GANACHE_CLI_URL = process.env.GANACHE_CLI_URL;
const GANACHE_CLI_ACCOUNT_1_PRIVATE_KEYS = process.env.GANACHE_CLI_ACCOUNT_1_PRIVATE_KEYS;
const GANACHE_CLI_ACCOUNT_2_PRIVATE_KEYS = process.env.GANACHE_CLI_ACCOUNT_2_PRIVATE_KEYS;

const FORK_GOERLI_URL = process.env.FORK_GOERLI_URL;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.0",
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.5.0",
      },
      {
        version: "0.8.9",
        settings: {},
      },
    ],
  },
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
        GANACHE_ACCOUNT_2_PRIVATE_KEYS,   // This is the second account that Ganache creates by default
      ],
    },
    ganache_cli_latest_version: {
      url: GANACHE_CLI_URL,
      accounts: [
        PRIVATE_KEY,                      // This is Macias account
        GANACHE_CLI_ACCOUNT_1_PRIVATE_KEYS,   // This is the first account that Ganache-CLI creates by default
        GANACHE_CLI_ACCOUNT_2_PRIVATE_KEYS,   // This is the second account that Ganache-CLI creates by default
      ],
      // issue: https://github.com/NomicFoundation/hardhat/issues/3136
      // workaround: https://github.com/NomicFoundation/hardhat/issues/2672#issuecomment-1167409582
      timeout: 100_000,
    },
    goerli_fork: {
      url: FORK_GOERLI_URL,
      accounts: [PRIVATE_KEY],
    }
  },
};
