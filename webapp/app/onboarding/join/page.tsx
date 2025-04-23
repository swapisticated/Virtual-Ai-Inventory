// pages/onboarding/join/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinOrganization() {
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState(''); // Kept, as it's used in JSX
  const router = useRouter();

  const handleJoinOrganization = async () => {
    try {
      const response = await fetch('/api/organization/join', {
        method: 'POST',
        body: JSON.stringify({ orgCode }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the dashboard or organization management page after successful join
        router.push('/dashboard');
      } else {
        setError(data.error || 'Something went wrong!');
      }
    } catch (error) {
      setError('Failed to join organization.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold">Join Organization</h1>
        <p className="text-gray-400">Enter your organization code</p>
        <input
          type="text"
          value={orgCode}
          onChange={(e) => setOrgCode(e.target.value)}
          placeholder="Organization Code"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg w-80"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={handleJoinOrganization}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg"
        >
          Join Organization
        </button>
      </div>
    </div>
  );
}
