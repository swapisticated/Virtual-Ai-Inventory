'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateOrganizationPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/organization/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (res.ok) {
      // Navigate to dashboard or organization page
      router.push('/dashboard');
    } else {
      alert(data.error || 'Something went wrong');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-xl">
        <h2 className="text-2xl font-semibold">Create a New Organization</h2>
        <input
          className="w-full px-4 py-2 text-white rounded"
          placeholder="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
