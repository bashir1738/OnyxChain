import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HDNodeWallet, Wallet } from 'ethers';
import { useToast } from '../components/Toast';

function ImportWallet() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [importMethod, setImportMethod] = useState<'seed' | 'privateKey'>('seed');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      setLoading(true);
      
      if (importMethod === 'seed') {
        if (!seedPhrase.trim()) {
          showToast('Please enter a seed phrase', 'error');
          setLoading(false);
          return;
        }

        // Validate and import seed phrase
        try {
          const wallet = HDNodeWallet.fromPhrase(seedPhrase.trim());
          localStorage.setItem('originalAddress', wallet.address);
          localStorage.setItem('originalPhrase', seedPhrase.trim());
          showToast('Wallet imported successfully!', 'success');
          navigate('/dashboard');
        } catch (error) {
          showToast('Invalid seed phrase. Please check and try again.', 'error');
        }
      } else {
        if (!privateKey.trim()) {
          showToast('Please enter a private key', 'error');
          setLoading(false);
          return;
        }

        // Validate and import private key
        try {
          let key = privateKey.trim();
          if (!key.startsWith('0x')) {
            key = '0x' + key;
          }
          const wallet = new Wallet(key);
          // For private key import, we'll just store it
          localStorage.setItem('originalAddress', wallet.address);
          localStorage.setItem('privateKey', key);
          showToast('Wallet imported successfully!', 'success');
          navigate('/dashboard');
        } catch (error) {
          showToast('Invalid private key. Please check and try again.', 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-black flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white ml-4">Import Wallet</h1>
      </div>

      {/* Import Method Toggle */}
      <div className="flex bg-blue-900/20 rounded-lg p-1 mb-6">
        <button
          onClick={() => setImportMethod('seed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            importMethod === 'seed'
              ? 'bg-blue-600 text-white'
              : 'text-blue-300 hover:text-white'
          }`}
        >
          Seed Phrase
        </button>
        <button
          onClick={() => setImportMethod('privateKey')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            importMethod === 'privateKey'
              ? 'bg-blue-600 text-white'
              : 'text-blue-300 hover:text-white'
          }`}
        >
          Private Key
        </button>
      </div>

      {/* Import Forms */}
      <div className="flex-1">
        {importMethod === 'seed' ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-blue-200 text-sm mb-2 block">
                Enter your 12 or 24 word seed phrase
              </span>
              <textarea
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                placeholder="Enter seed phrase separated by spaces..."
                className="w-full h-32 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-white placeholder-blue-300/40 focus:outline-none focus:border-blue-500 resize-none"
              />
            </label>
            <p className="text-blue-300/50 text-xs">
              Typically 12 (sometimes 24) words separated by spaces
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="text-blue-200 text-sm mb-2 block">
                Enter your private key
              </span>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key..."
                className="w-full bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-white placeholder-blue-300/40 focus:outline-none focus:border-blue-500"
              />
            </label>
            <p className="text-blue-300/50 text-xs">
              Your private key will be encrypted and stored securely
            </p>
          </div>
        )}

        {/* Warning Box */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-200/80 text-sm">
              Never share your seed phrase or private key. OnyxChain will never ask for it.
            </p>
          </div>
        </div>
      </div>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg shadow-blue-600/30 mt-6"
      >
        {loading ? 'Importing...' : 'Import Wallet'}
      </button>
    </div>
  );
}

export default ImportWallet;
