'use client';

import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold">Welcome!</h1>
        <p className="text-gray-400">Choose an option to get started:</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/onboarding/create')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg"
          >
            Create Organization
          </button>
          <button
            onClick={() => router.push('/onboarding/join')}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg"
          >
            Join Organization
          </button>
        </div>
      </div>
    </div>
  );
}
