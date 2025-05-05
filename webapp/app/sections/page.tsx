'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Define types for our data
interface Section {
  id: string;
  name: string;
  description?: string | null;
  items?: { id: string }[];
  children?: { id: string }[];
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSection, setNewSection] = useState<{ name: string; description: string }>({ 
    name: '', 
    description: '' 
  });
  const router = useRouter();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection),
      });
      
      if (!response.ok) throw new Error('Failed to create section');
      
      setShowAddModal(false);
      setNewSection({ name: '', description: '' });
      fetchSections();
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Inventory Sections</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Section
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FolderIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No sections yet</h3>
          <p className="text-gray-400 mb-6">Create your first section to start organizing your inventory</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Section
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              href={`/sections/${section.id}`}
              key={section.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <FolderIcon className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-medium text-white">{section.name}</h3>
              </div>
              {section.description && (
                <p className="text-gray-400 text-sm mb-4">{section.description}</p>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>{section.items?.length || 0} items</span>
                <span>{section.children?.length || 0} subsections</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Section</h2>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newSection.description || ''}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
