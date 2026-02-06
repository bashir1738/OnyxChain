import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
// import { generateWallet } from "../utils/wallet";
import { useToast } from "../components/Toast";
import { getBalance, getTransactions, NETWORKS, getCurrentNetwork, setNetwork } from "../utils/wallet";
import type { Transaction } from "../utils/wallet";

function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [balance, setBalance] = useState("0");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(getCurrentNetwork());
  const mockAddress: string | null = localStorage.getItem("originalAddress");

  useEffect(() => {
    const fetchData = async () => {
      if (mockAddress) {
        setLoading(true);
        const bal = await getBalance(mockAddress);
        setBalance(bal);
        setTransactions(getTransactions());
        setLoading(false);
      }
    };
    fetchData();
  }, [mockAddress, selectedNetwork]);

  const handleNetworkChange = (network: keyof typeof NETWORKS) => {
    setNetwork(network);
    setSelectedNetwork(network);
    showToast(`Switched to ${NETWORKS[network].name}`, "info");
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyAddress = async () => {
    if (!mockAddress) {
      showToast("No address found, There is no address to copy.", "error");
      return;
    }

    await navigator.clipboard.writeText(mockAddress);

    showToast("Copied!, Wallet address had copied to clipboard.", "info");
  };

  return (
    <div className="min-h-full bg-black flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-48 h-10 rounded-full overflow-hidden ">
            <img
              src={logo}
              alt="OnyxChain"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Network Selector */}
          <select
            value={selectedNetwork}
            onChange={(e) => handleNetworkChange(e.target.value as keyof typeof NETWORKS)}
            className="bg-blue-900/20 border border-blue-500/30 w-16 rounded-lg px-3 py-2 text-blue-200 text-sm hover:bg-blue-900/40 transition-colors cursor-pointer"
          >
            {Object.entries(NETWORKS).map(([key, value]) => (
              <option key={key} value={key} className="bg-gray-900 text-white">
                {value.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate("/settings")}
            className="text-blue-400 hover:text-blue-300 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <span className="text-blue-200 text-sm font-mono">
              {mockAddress ? truncateAddress(mockAddress) : "No Address"}
            </span>
          </div>
          <button
            className="text-blue-400 hover:text-blue-300 transition-colors"
            onClick={handleCopyAddress}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-linear-to-br from-blue-600/30 to-blue-800/30 border border-blue-500/30 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-blue-300 text-sm">Total Balance</p>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-blue-300/70 text-xs">{NETWORKS[selectedNetwork].name}</span>
          </div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-1">
          {loading ? "..." : `${parseFloat(balance).toFixed(4)} ETH`}
        </h2>
        <p className="text-blue-300/70 text-sm">Network: {NETWORKS[selectedNetwork].name}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => navigate("/send")}
          className="flex flex-col items-center justify-center bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 hover:bg-blue-900/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-600/30 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
          <span className="text-blue-200 text-sm">Send</span>
        </button>

        <button
          onClick={() => navigate("/receive")}
          className="flex flex-col items-center justify-center bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 hover:bg-blue-900/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-600/30 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          </div>
          <span className="text-blue-200 text-sm">Receive</span>
        </button>

        <button
          onClick={() => navigate("/assets")}
          className="flex flex-col items-center justify-center bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 hover:bg-blue-900/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-600/30 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <span className="text-blue-200 text-sm">Assets</span>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-blue-300/50 text-sm">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.hash}
                className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'send' ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${tx.type === 'send' ? 'text-red-400' : 'text-green-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={tx.type === 'send' ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M17 13l-5 5m0 0l-5-5m5 5V6"}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {tx.type === 'send' ? 'Sent' : 'Received'}
                    </p>
                    <p className="text-blue-300/70 text-xs">
                      {tx.type === 'send' ? `To: ${truncateAddress(tx.to)}` : `From: ${truncateAddress(tx.from)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${tx.type === 'send' ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.value} ETH
                  </p>
                  <p className="text-blue-300/50 text-xs">{formatDate(tx.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
