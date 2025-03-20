export const NFT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const TOKEN_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

import NFT_ABI from "../src/ElectronicSupplyChain.json";  // NFT contract JSON
import TOKEN_ABI from "../src/SupplyChainToken.json";  // ERC-20 contract JSON

export const NFT_CONTRACT_ABI = NFT_ABI.abi;  // ✅ Extract only the `.abi` part
export const TOKEN_CONTRACT_ABI = TOKEN_ABI.abi;  // ✅ Extract only the `.abi` part
