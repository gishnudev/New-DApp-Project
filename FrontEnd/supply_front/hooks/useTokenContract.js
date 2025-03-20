import { useState, useEffect } from "react";
import { ethers } from "ethers";
import tokenABI from "../src/SupplyChainToken.json"; // Import ABI

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with your deployed address

export const useTokenContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, tokenABI, web3Signer);

        setProvider(web3Provider);
        setSigner(web3Signer);
        setContract(tokenContract);
        setAccount(await web3Signer.getAddress());
      }
    };
    initProvider();
  }, []);

  return { provider, signer, contract, account };
};
