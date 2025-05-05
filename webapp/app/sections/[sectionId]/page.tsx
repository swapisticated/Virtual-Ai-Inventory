'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  ArrowLeftIcon, 
  FolderIcon, 
  ArchiveBoxIcon,
  TrashIcon,
  PencilIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  DeleteItemModal, 
  DeleteSectionModal,
  AddItemModal 
} from './components/Modals';

// Define types for our data
interface Section {
  id: string;
  name: string;
  description?: string | null;
  organizationId: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  location: string;
  sku: string;
  sectionId: string | null;
  organizationId: string;
  createdAt: string;
}

interface Subsection extends Section {
  parentId: string | null;
  _count?: {
    items: number;
  };
}

interface PageParams {
  params: Promise<{
    sectionId: string;
  }>;
}

export default function SectionDetailPage({ params }: PageParams) {
  // Extract sectionId from params using React.use()
  const unwrappedParams = use(params);
  const sectionId = unwrappedParams.sectionId;
  const router = useRouter();
  
  const [section, setSection] = useState<Section | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddSubsectionModal, setShowAddSubsectionModal] = useState(false);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [subsectionToDelete, setSubsectionToDelete] = useState<Subsection | null>(null);
  
  // Form states
  const [newItem, setNewItem] = useState<{
    name: string;
    quantity: number;
    location: string;
    sku: string;
  }>({ 
    name: '', 
    quantity: 0, 
    location: '', 
    sku: '' 
  });
  
  const [newSubsection, setNewSubsection] = useState<{
    name: string;
    description: string;
  }>({ 
    name: '', 
    description: '' 
  });

  // Define fetchSectionDetails outside of useEffect to avoid recreating it on each render
  const fetchSectionDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch section details
      const sectionResponse = await fetch(`/api/sections/${sectionId}`);
      if (!sectionResponse.ok) throw new Error('Failed to fetch section');
      const sectionData = await sectionResponse.json();
      setSection(sectionData);
      
      // Fetch items in this section
      const itemsResponse = await fetch(`/api/sections/${sectionId}/items`);
      if (!itemsResponse.ok) throw new Error('Failed to fetch items');
      const itemsData = await itemsResponse.json();
      setItems(itemsData);
      
      // Fetch subsections
      const subsectionsResponse = await fetch(`/api/sections/${sectionId}/subsections`);
      if (!subsectionsResponse.ok) throw new Error('Failed to fetch subsections');
      const subsectionsData = await subsectionsResponse.json();
      setSubsections(subsectionsData);
      
    } catch (error) {
      console.error('Error fetching section details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect with proper dependency array
  useEffect(() => {
    // Only run when sectionId changes
    if (sectionId) {
      fetchSectionDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]); // Add sectionId as a dependency

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/sections/${sectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) throw new Error('Failed to create item');
      
      setShowAddItemModal(false);
      setNewItem({ name: '', quantity: 0, location: '', sku: '' });
      fetchSectionDetails();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleAddSubsection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/sections/${sectionId}/subsections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSubsection,
          parentId: sectionId
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create subsection');
      
      setShowAddSubsectionModal(false);
      setNewSubsection({ name: '', description: '' });
      fetchSectionDetails();
    } catch (error) {
      console.error('Error creating subsection:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`/api/items/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete item');
      
      setShowDeleteItemModal(false);
      setItemToDelete(null);
      fetchSectionDetails();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDeleteSubsection = async () => {
    if (!subsectionToDelete) return;
    
    try {
      const response = await fetch(`/api/sections/${subsectionToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete subsection');
      
      setShowDeleteSectionModal(false);
      setSubsectionToDelete(null);
      fetchSectionDetails();
    } catch (error) {
      console.error('Error deleting subsection:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-white mb-2">Section not found</h3>
          <Link 
            href="/sections"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block mt-4"
          >
            Back to Sections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/sections"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 w-fit"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Sections
        </Link>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">{section.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Item
            </button>
            <button
              onClick={() => setShowAddSubsectionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Subsection
            </button>
          </div>
        </div>
        
        {section.description && (
          <p className="text-gray-400 mt-2">{section.description}</p>
        )}
      </div>
      
      {/* Subsections */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Subsections</h2>
        
        {subsections.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <FolderIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No subsections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subsections.map((subsection) => (
              <div 
                key={subsection.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:bg-gray-750 transition-colors relative group"
              >
                <Link href={`/sections/${subsection.id}`} className="block">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderIcon className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-medium text-white">{subsection.name}</h3>
                  </div>
                  
                  {subsection.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{subsection.description}</p>
                  )}
                </Link>
                
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubsectionToDelete(subsection);
                      setShowDeleteSectionModal(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                  <span className="text-sm text-gray-500">{subsection._count?.items || 0} items</span>
                  <Link 
                    href={`/sections/${subsection.id}`}
                    className="flex items-center text-sm text-blue-500 hover:text-blue-400"
                  >
                    View <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Items */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Items</h2>
        
        {items.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <ArchiveBoxIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No items in this section</p>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-750">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full"
                            title="Edit Item"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(item);
                              setShowDeleteItemModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                            title="Delete Item"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <DeleteItemModal 
        isOpen={showDeleteItemModal}
        onClose={() => setShowDeleteItemModal(false)}
        onConfirm={handleDeleteItem}
      />
      
      <DeleteSectionModal
        isOpen={showDeleteSectionModal}
        onClose={() => setShowDeleteSectionModal(false)}
        onConfirm={handleDeleteSubsection}
      />
      
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        onSubmit={handleAddItem}
      />
      
      {/* Add Subsection Modal */}
      {showAddSubsectionModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Subsection</h2>
            <form onSubmit={handleAddSubsection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newSubsection.name}
                  onChange={(e) => setNewSubsection({ ...newSubsection, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newSubsection.description || ''}
                  onChange={(e) => setNewSubsection({ ...newSubsection, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddSubsectionModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"
                >
                  Add Subsection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}