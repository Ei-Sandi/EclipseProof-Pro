import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Shield, AlertTriangle } from 'lucide-react';

interface ProofVerification {
  valid: boolean;
  threshold: number; // proveAmount from circuit - the income threshold
  proofId: string;
  verificationHash?: string; // on-chain commitment hash from circuit
  generatedAt: string;
  expiresAt: string;
  verified: boolean;
  circuitVerified?: boolean; // indicates ZK circuit proof was validated
}

export default function VerifierPage() {
  const { proofId } = useParams<{ proofId: string }>();
  const [searchParams] = useSearchParams();
  const [verification, setVerification] = useState<ProofVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyProof = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get proof ID from URL params or query string
        const id = proofId || searchParams.get('id');
        
        if (!id) {
          throw new Error('No proof ID provided');
        }

        // Call verification API
        const response = await fetch(`/api/proof/verify/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to verify proof');
        }

        const data = await response.json();
        setVerification(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyProof();
  }, [proofId, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Proof</h2>
          <p className="text-gray-600">Please wait while we verify the zero-knowledge proof...</p>
        </div>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to verify this proof'}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <p className="text-sm text-red-800">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
              <li>Invalid or expired proof</li>
              <li>Proof ID not found</li>
              <li>Network connection error</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(verification.expiresAt) < new Date();
  const isValid = verification.valid && verification.verified && !isExpired;

  return (
    <div className={`min-h-screen ${
      isValid 
        ? 'bg-gradient-to-br from-green-50 to-emerald-100' 
        : 'bg-gradient-to-br from-amber-50 to-orange-100'
    } flex items-center justify-center p-4`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {isValid ? (
              <CheckCircle className="w-24 h-24 text-green-500" />
            ) : isExpired ? (
              <Clock className="w-24 h-24 text-orange-500" />
            ) : (
              <AlertTriangle className="w-24 h-24 text-amber-500" />
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {isValid ? 'Proof Verified' : isExpired ? 'Proof Expired' : 'Invalid Proof'}
          </h1>
          
          <p className="text-gray-600">
            {isValid 
              ? 'This zero-knowledge proof has been successfully verified'
              : isExpired
              ? 'This proof has expired and is no longer valid'
              : 'This proof could not be validated'}
          </p>
        </div>

        {/* Main Proof Statement */}
        <div className={`${
          isValid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
        } border-2 rounded-xl p-6 mb-6`}>
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Shield className={`w-8 h-8 ${isValid ? 'text-green-600' : 'text-amber-600'}`} />
            <h2 className="text-2xl font-bold text-gray-800">Verified Statement</h2>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-2">The prover has demonstrated that:</p>
            <div className={`${
              isValid ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-900'
            } text-3xl font-bold py-4 px-6 rounded-lg inline-block`}>
              Income &gt; £{verification.threshold.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Without revealing the exact income amount
            </p>
          </div>
        </div>

        {/* Proof Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
            Proof Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Proof ID</span>
              <span className="text-gray-800 font-mono text-sm">{verification.proofId}</span>
            </div>
            
            {verification.verificationHash && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Verification Hash</span>
                <span className="text-gray-800 font-mono text-xs break-all">
                  {verification.verificationHash.slice(0, 10)}...{verification.verificationHash.slice(-8)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Status</span>
              <span className={`font-semibold ${
                isValid ? 'text-green-600' : isExpired ? 'text-orange-600' : 'text-red-600'
              }`}>
                {isValid ? 'Valid' : isExpired ? 'Expired' : 'Invalid'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Generated</span>
              <span className="text-gray-800">
                {new Date(verification.generatedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Expires</span>
              <span className={`${isExpired ? 'text-red-600 font-semibold' : 'text-gray-800'}`}>
                {new Date(verification.expiresAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            🔒 Privacy Preserved via Zero-Knowledge Proofs
          </h3>
          <p className="text-sm text-indigo-800 leading-relaxed mb-3">
            This verification uses Midnight Network's zero-knowledge circuit technology. 
            The prover's actual income, identity (name, date of birth), and sensitive financial details 
            remain completely private and were never revealed during this verification.
          </p>
          <div className="bg-indigo-100 rounded-lg p-3 text-xs text-indigo-900">
            <p className="font-semibold mb-1">🔐 What's Hidden:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Prover's actual name (hashed in circuit)</li>
              <li>Prover's date of birth (hashed in circuit)</li>
              <li>Exact net pay amount (only proves &gt; threshold)</li>
            </ul>
            <p className="font-semibold mt-2 mb-1">✅ What's Verified:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Income exceeds stated threshold</li>
              <li>Cryptographic proof validity</li>
              <li>On-chain commitment verification</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-indigo-600">EclipseProof</span> 
            {' '}- Zero-Knowledge Income Verification
          </p>
        </div>
      </div>
    </div>
  );
}
