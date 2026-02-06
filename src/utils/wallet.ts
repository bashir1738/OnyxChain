import { HDNodeWallet, Mnemonic, JsonRpcProvider, parseEther, formatEther } from "ethers";

// Network configurations
export const NETWORKS = {
  sepolia: {
    name: 'Ethereum Sepolia',
    rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
    chainId: 11155111,
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    rpc: 'https://eth.llamarpc.com',
    chainId: 1,
  },
  base: {
    name: 'Base',
    rpc: 'https://base.llamarpc.com',
    chainId: 8453,
  },
};

interface WalletVerificationResult {
  isMatch: boolean;
  originalAddress: string;
  enteredAddress: string;
  message: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'send' | 'receive';
}

// Get current network from localStorage or default to Sepolia
export function getCurrentNetwork(): keyof typeof NETWORKS {
  const network = localStorage.getItem("selectedNetwork") as keyof typeof NETWORKS;
  return (network && network in NETWORKS) ? network : 'sepolia';
}

// Set network
export function setNetwork(network: keyof typeof NETWORKS) {
  if (network in NETWORKS) {
    localStorage.setItem("selectedNetwork", network);
  }
}

// Get provider for current network
export function getProvider() {
  const network = getCurrentNetwork();
  const config = NETWORKS[network];
  return new JsonRpcProvider(config.rpc, config.chainId);
}

// Get wallet instance from stored phrase
export function getWalletFromStorage() {
  const phrase = localStorage.getItem("originalPhrase");
  if (!phrase) return null;
  
  const provider = getProvider();
  const wallet = HDNodeWallet.fromPhrase(phrase);
  return wallet.connect(provider);
}

// Get balance in ETH
export async function getBalance(address: string): Promise<string> {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return formatEther(balance);
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0";
  }
}

// Send Sepolia ETH
export async function sendTransaction(
  toAddress: string,
  amountInEth: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const wallet = getWalletFromStorage();
    if (!wallet) {
      return { success: false, error: "No wallet found" };
    }

    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: parseEther(amountInEth),
    });

    // Wait for confirmation
    await tx.wait();

    // Save to local transaction history
    saveTransaction({
      hash: tx.hash,
      from: wallet.address,
      to: toAddress,
      value: amountInEth,
      timestamp: Date.now(),
      type: 'send',
    });

    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error("Transaction error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Transaction failed" 
    };
  }
}

// Save transaction to local storage
export function saveTransaction(tx: Transaction) {
  const transactions = getTransactions();
  transactions.unshift(tx);
  localStorage.setItem("transactions", JSON.stringify(transactions.slice(0, 50)));
}

// Get transactions from local storage
export function getTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem("transactions");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function generateWallet() {
  const wallet = HDNodeWallet.createRandom();
  localStorage.setItem("originalAddress", wallet.address);
  localStorage.setItem("originalPhrase", wallet.mnemonic!.phrase);

  return wallet;
}

export function validateSeedPhrase(phrase: string): boolean {
  const words = phrase.trim().toLowerCase().split(/\s+/);
  return words.length === 12 || words.length === 24;
}


export function validateSeedPhraseStrong(phrase: string): boolean {
  try {
    Mnemonic.fromPhrase(phrase);
    return true;
  } catch {
    return false;
  }
}

export const verifyPhrase = (
  enteredPhrase: string,
): WalletVerificationResult => {
  const originalAddress = localStorage.getItem("originalAddress");

  if (!originalAddress) {
    return {
      isMatch: false,
      originalAddress: "",
      enteredAddress: "",
      message: "No wallet found to verify against",
    };
  }

  try {
    const restoredWallet = HDNodeWallet.fromPhrase(enteredPhrase.trim());
    const enteredAddress = restoredWallet.address;

    const isMatch =
      originalAddress.toLowerCase() === enteredAddress.toLowerCase();

    return {
      isMatch,
      originalAddress,
      enteredAddress,
      message: isMatch
        ? "Phrase matches! Wallet restored successfully."
        : " Phrase does not match the original wallet.",
    };
  } catch (error) {
    return {
      isMatch: false,
      originalAddress,
      enteredAddress: "",
      message: ` Invalid seed phrase: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export function generateMockAddress(): string {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}
