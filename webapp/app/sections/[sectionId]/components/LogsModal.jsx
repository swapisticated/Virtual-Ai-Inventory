// 'use client';

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import { XMarkIcon } from '@heroicons/react/24/outline';

// function EditRemark({ log, onUpdate }) {
//   const [editing, setEditing] = useState(false);
//   const [remark, setRemark] = useState(log.remarks || '');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const updateRemark = async () => {
//     if (!remark.trim()) return;
    
//     setLoading(true);
//     setError(null);
//     try {
//       await axios.patch(`/api/logs/${log.id}`, { remarks: remark });
//       setEditing(false);
//       if (onUpdate) await onUpdate();
//     } catch (error) {
//       console.error('Error updating remark:', error);
//       setError(error.response?.data?.message || 'Failed to update remark');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mt-2">
//       {editing ? (
//         <div className="flex flex-col gap-2">
//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={remark}
//               onChange={(e) => setRemark(e.target.value)}
//               placeholder="Enter your remark"
//               className="flex-1 px-2 py-1 text-sm rounded bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//               disabled={loading}
//               autoFocus
//             />
//             <button
//               onClick={updateRemark}
//               disabled={loading}
//               className="px-3 py-1 text-sm rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
//             >
//               {loading ? 'Saving...' : 'Save'}
//             </button>
//             <button
//               onClick={() => {
//                 setEditing(false);
//                 setError(null);
//               }}
//               disabled={loading}
//               className="px-3 py-1 text-sm rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//           {error && (
//             <p className="text-sm text-red-400">{error}</p>
//           )}
//         </div>
//       ) : (
//         <button 
//           onClick={() => setEditing(true)}
//           className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
//         >
//           {log.remarks ? 'Edit Remark' : 'Add Remark'}
//         </button>
//       )}
//     </div>
//   );
// }

// export default function LogsModal({ isOpen, onClose, itemId, currentUserId, itemName }) {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const refreshLogs = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`/api/items/${itemId}/logs`);
//       console.log('Full log data:', JSON.stringify(res.data, null, 2));
//       setLogs(res.data);
//     } catch (error) {
//       console.error('Error fetching logs for item', itemId, error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isOpen) {
//       refreshLogs();
//     }
//   }, [isOpen, itemId]);

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="fixed inset-0 bg-black/50 z-40"
//           />
          
//           {/* Sidebar */}
//           <motion.div
//             initial={{ x: '100%' }}
//             animate={{ x: 0 }}
//             exit={{ x: '100%' }}
//             transition={{ type: "spring", damping: 25, stiffness: 200 }}
//             className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700/50 shadow-xl z-50 overflow-hidden"
//           >
//             <div className="flex flex-col h-full">
//               {/* Header */}
//               <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
//                 <div>
//                   <h2 className="text-lg font-semibold text-white">{itemName} History</h2>
//                   <p className="text-sm text-gray-400">Audit Logs</p>
//                 </div>
//                 <button
//                   onClick={onClose}
//                   className="p-2 hover:bg-gray-800 rounded-full transition-colors"
//                 >
//                   <XMarkIcon className="w-5 h-5 text-gray-400" />
//                 </button>
//               </div>

//               {/* Content */}
//               <div className="flex-1 overflow-y-auto p-4">
//                 <div className="flex justify-end mb-4">
//                   <button
//                     onClick={refreshLogs}
//                     disabled={loading}
//                     className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
//                   >
//                     {loading ? 'Refreshing...' : 'Refresh Logs'}
//                   </button>
//                 </div>

//                 <div className="space-y-3">
//                   {logs.length === 0 ? (
//                     <p className="text-gray-400 text-sm text-center py-8">
//                       No logs available for this item.
//                     </p>
//                   ) : (
//                     logs.map((log) => (
//                       <motion.div
//                         key={log.id}
//                         initial={{ opacity: 0, y: 5 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="bg-gray-800/50 p-4 rounded-xl"
//                       >
//                         <div className="flex flex-col space-y-2">
//                           <div className="flex justify-between items-start">
//                             <span className="text-sm font-medium text-gray-300">
//                               {new Date(log.timestamp).toLocaleString()}
//                             </span>
//                             <span className="text-sm text-gray-400">
//                               by {log.user?.name || log.userName || 'Unknown'}
//                             </span>
//                           </div>
//                           <p className="text-sm text-white">
//                             Changed from {log.oldCount} to {log.newCount}
//                           </p>
//                           {log.remarks && (
//                             <p className="text-sm text-gray-400">
//                               <em>Remark:</em> {log.remarks}
//                             </p>
//                           )}
//                           {String(currentUserId) === String(log.userId) && (
//                             <EditRemark log={log} onUpdate={refreshLogs} />
//                           )}
//                         </div>
//                       </motion.div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// } 