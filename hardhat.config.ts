import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const RPC = process.env.ETH_RPC_URL || 'http://localhost:8545';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    localhost: { url: RPC },
  },
};
export default config;
