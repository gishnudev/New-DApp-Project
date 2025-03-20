import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useContract } from "../../hooks/useContract";
import { useMetaMask } from "../../hooks/useMetaMask";

const Marketplace = () => {
  const { contract } = useContract();
  const { account } = useMetaMask(); // ✅ Get the user's connected wallet
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(null); // Track which product is being bought

  // 🔥 Fetch NFTs from blockchain
  const fetchNFTs = async () => {
    if (!contract) {
      setError("❌ Contract not connected!");
      setLoading(false);
      return;
    }

    try {
      console.log("⏳ Fetching NFTs from blockchain...");
      const mintEvents = await contract.queryFilter(contract.filters.ProductMinted());

      if (!mintEvents.length) {
        setError("⚠️ No products found.");
        setLoading(false);
        return;
      }

      let nfts = [];

      for (let event of mintEvents) {
        try {
          const { productId, manufacturer, ipfsHash, price } = event.args;

          const owner = await contract.ownerOf(productId);
          const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash.replace("ipfs://", "")}`;

          console.log(`🌐 Fetching metadata from: ${ipfsUrl}`);
          const response = await fetch(ipfsUrl);
          if (!response.ok) throw new Error("IPFS fetch failed");

          const metadata = await response.json();

          const nft = {
            id: BigInt(productId).toString(),
            name: metadata.name || "Unknown Product",
            image: metadata.image || "https://via.placeholder.com/150",
            description: metadata.description || "No description available.",
            price: ethers.formatEther(price),
            owner,
            manufacturer,
          };

          nfts.push(nft);
        } catch (err) {
          console.warn(`⚠️ Token fetch failed:`, err);
        }
      }

      setProducts(nfts);
      setLoading(false);
    } catch (err) {
      console.error("🚨 Error fetching NFTs:", err);
      setError("❌ Error fetching NFTs");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchNFTs();
  }, [contract]);

  // 🔥 Buy Product Function
  const buyNFT = async (productId, price) => {
    if (!contract || !account) {
      alert("❌ Connect your wallet first!");
      return;
    }

    setBuying(productId); // Track which item is being purchased

    try {
      console.log(`💰 Purchasing product ID: ${productId} for ${price} ETH...`);

      const transaction = await contract.purchaseProduct(productId, {
        value: ethers.parseEther(price.toString()),
      });

      await transaction.wait();
      alert("🎉 Purchase Successful!");
      fetchNFTs(); // Refresh products after purchase
    } catch (error) {
      console.error("🚨 Transaction failed:", error);
      alert("❌ Transaction Failed!");
    }

    setBuying(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🛒 Marketplace</h1>

      {loading && <p className="text-yellow-400">⏳ Loading products...</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((nft) => (
          <div key={nft.id} className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <img
              src={nft.image || "https://via.placeholder.com/150"}
              alt={nft.name}
              className="w-full h-48 object-cover rounded-md"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            />
            <h3 className="text-xl font-bold mt-3">{nft.name}</h3>
            <p className="text-gray-400 text-sm">{nft.description}</p>
            <p className="mt-2 font-bold text-green-400">💰 {nft.price} ETH</p>
            <p className="text-sm text-gray-300">👤 Owner: {nft.owner}</p>
            <p className="text-sm text-gray-300">🏭 Manufacturer: {nft.manufacturer}</p>

            <button
              className={`mt-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg w-full ${
                buying === nft.id ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => buyNFT(nft.id, nft.price)}
              disabled={buying === nft.id}
            >
              {buying === nft.id ? "Processing..." : "Buy Product"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
