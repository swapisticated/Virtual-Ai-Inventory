'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
// import { useRouter } from "next/navigation";
import CreateSectionModal from '@/components/CreateSectionModal';
import { HomeIcon, LogOut, Plus, SettingsIcon } from "lucide-react";
import { signOut } from "next-auth/react"
import { FloatingDock } from "@/components/ui/floating-dock";

export default function Dashboard() {
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch('/api/sections');
        if (!res.ok) throw new Error('Failed to fetch sections');
        const data = await res.json();
        setSections(data);
      } catch (err) {
        console.error(err);
        setSections([]); // fallback
      }
    };

    fetchSections();
  }, []);


  const handleCreateSection = (newSection) => {
    setSections([newSection, ...sections]);
  };

  //   if (isLoading) {
  //     return (
  //       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
  //         <div className="flex flex-col items-center gap-4">
  //           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  //           <p className="text-gray-400 text-lg font-medium">Loading sections...</p>
  //         </div>
  //       </div>
  //     );
  //   }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Inventory Dashboard
            </h1>
            <div className='flex gap-4'>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-[#1D2838] border  hover:bg-[#3c4b61] text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                <div className='flex gap-2'>
                  <Plus />

                </div>

              </button>

              <button
                onClick={() => signOut({ redirectTo: "/dashboard" })}
                className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 "
              >
                <div className='flex gap-2'>
                  <LogOut />

                </div>

              </button>
            </div>

          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Sections</h3>
              <p className="text-3xl font-bold text-white">{sections.length}</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Items</h3>
              <p className="text-3xl font-bold text-white">
                {sections.reduce((acc, section) => acc + (section._count?.items || 0), 0)}
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Recent Updates</h3>
              <p className="text-3xl font-bold text-white">
                {sections.length > 0 ? 'Active' : 'None'}
              </p>
            </div>
          </div>

          {/* Recent Sections */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-white mb-6">Recent Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sections.slice(0, 3).map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/sections/${section.id}`}
                    className="group block bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {section.name}
                    </h3>
                    <p className="mt-2 text-gray-400 line-clamp-2">{section.description}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <span className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300">
                        {section._count?.items || 0} items
                      </span>
                      <span className="text-blue-400 text-sm group-hover:translate-x-1 transition-transform duration-200">
                        View details →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* All Sections */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">All Sections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/sections/${section.id}`}
                    className="group block bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {section.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">{section.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300">
                        {section._count?.items || 0} items
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <CreateSectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSection}
      />
      <FloatingDock
        items={[
          { title: "Home", icon: <HomeIcon />, href: "/" },
          { title: "Settings", icon: <SettingsIcon />, href: "/settings" },
        ]}
      />
    </div>
  );
}