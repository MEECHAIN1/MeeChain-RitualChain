// This file will be overwritten by the deployment script (src/contracts/deploy.ts).
// Keep this default so local dev doesn't crash before first deploy.

export const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || '';
export const RPC_URL = process.env.VITE_RPC_URL || 'http://localhost:8545';
