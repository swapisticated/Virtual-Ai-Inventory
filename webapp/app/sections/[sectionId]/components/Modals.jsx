// 'use client';

// import { Dialog } from '@headlessui/react';
// import { Fragment } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';

// const overlayVariants = {
//   hidden: { opacity: 0 },
//   visible: { 
//     opacity: 1,
//     transition: { duration: 0.2 }
//   }
// };

// const modalVariants = {
//   hidden: { 
//     opacity: 0,
//     scale: 0.98,
//     y: 8,
//     transition: { duration: 0.15 }
//   },
//   visible: { 
//     opacity: 1, 
//     scale: 1, 
//     y: 0,
//     transition: { 
//       duration: 0.15,
//       ease: "easeOut"
//     }
//   }
// };

// function BaseModal({ isOpen, onClose, title, children }) {
//   return (
//     <AnimatePresence mode="wait">
//       {isOpen && (
//         <Dialog
//           static
//           as={motion.div}
//           className="relative z-50"
//           open={isOpen}
//           onClose={onClose}
//         >
//           <motion.div 
//             className="fixed inset-0 bg-black/75"
//             initial="hidden"
//             animate="visible"
//             exit="hidden"
//             variants={overlayVariants}
//             style={{ willChange: 'opacity' }}
//           />

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <Dialog.Panel
//                 as={motion.div}
//                 className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl border border-gray-700/50"
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={modalVariants}
//                 style={{ 
//                   willChange: 'transform, opacity',
//                   translateZ: 0,
//                   backfaceVisibility: 'hidden'
//                 }}
//               >
//                 <Dialog.Title
//                   as="h3"
//                   className="text-xl font-semibold leading-6 text-white mb-4"
//                 >
//                   {title}
//                 </Dialog.Title>
//                 {children}
//               </Dialog.Panel>
//             </div>
//           </div>
//         </Dialog>
//       )}
//     </AnimatePresence>
//   );
// }

// export function DeleteItemModal({ isOpen, onClose, onConfirm }) {
//   return (
//     <BaseModal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Delete Item"
//     >
//       <div className="mt-2">
//         <p className="text-gray-300">
//           Are you sure you want to delete this item? This action cannot be undone.
//         </p>
//       </div>

//       <div className="mt-6 flex gap-3 justify-end">
//         <button
//           type="button"
//           className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
//           onClick={onClose}
//         >
//           Cancel
//         </button>
//         <button
//           type="button"
//           className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
//           onClick={onConfirm}
//         >
//           Delete
//         </button>
//       </div>
//     </BaseModal>
//   );
// }

// export function DeleteSectionModal({ isOpen, onClose, onConfirm }) {
//   return (
//     <BaseModal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Delete Section"
//     >
//       <div className="mt-2">
//         <p className="text-gray-300">
//           Are you sure you want to delete this section? This action cannot be undone and will delete all items within this section.
//         </p>
//       </div>

//       <div className="mt-6 flex gap-3 justify-end">
//         <button
//           type="button"
//           className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
//           onClick={onClose}
//         >
//           Cancel
//         </button>
//         <button
//           type="button"
//           className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
//           onClick={onConfirm}
//         >
//           Delete Section
//         </button>
//       </div>
//     </BaseModal>
//   );
// }

// export function AddItemModal({ isOpen, onClose, newItem, setNewItem, onSubmit }) {
//   return (
//     <BaseModal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Add New Item"
//     >
//       <form onSubmit={onSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-300 mb-2">
//             Name
//           </label>
//           <input
//             type="text"
//             value={newItem.name}
//             onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
//             className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-300 mb-2">
//             Description
//           </label>
//           <textarea
//             value={newItem.description}
//             onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
//             className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             rows={3}
//           />
//         </div>
//         <div className="mt-6 flex gap-3 justify-end">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"
//           >
//             Add Item
//           </button>
//         </div>
//       </form>
//     </BaseModal>
//   );
// }