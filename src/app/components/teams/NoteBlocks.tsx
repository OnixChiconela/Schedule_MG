// "use client";

// import { useTheme } from "@/app/themeContext";
// import { AnimatePresence, motion } from "framer-motion";
// import { MoreHorizontal } from "lucide-react";
// import { useCallback, useEffect, useRef, useState } from "react";

// type Folder = {
//     id: number;
//     title: string;
//     description: string; // Substitui "subfragments"
//     imageUrl?: string;
//     bgColor: string;
//     shadow: string;
//     opacity: number;
//     titleColor?: string;
// };

// type NotesFoldersProps = {
//     onOpenFolder: (folderId: number) => void;
// };

// const NotesFolders = ({ onOpenFolder }: NotesFoldersProps) => {
//     const { theme } = useTheme();
//     const [folders, setFolders] = useState<Folder[]>([
//         {
//             id: 1,
//             title: "Meeting Notes",
//             description: "Notes from the team meeting on May 31st.",
//             imageUrl: undefined, // Pode adicionar uma URL de imagem aqui
//             bgColor: theme === "light" ? "#F3F4F6" : "#1F2937",
//             shadow: theme === "light" ? "0px 4px 6px rgba(0, 0, 0, 0.1)" : "0px 4px 6px rgba(0, 0, 0, 0.3)",
//             opacity: 1,
//             titleColor: theme === "light" ? "#1F2937" : "#FFFFFF",
//         },
//         {
//             id: 2,
//             title: "Project Ideas",
//             description: "Brainstorming ideas for the new project.",
//             imageUrl: undefined,
//             bgColor: theme === "light" ? "#F3F4F6" : "#1F2937",
//             shadow: theme === "light" ? "0px 4px 6px rgba(0, 0, 0, 0.1)" : "0px 4px 6px rgba(0, 0, 0, 0.3)",
//             opacity: 1,
//             titleColor: theme === "light" ? "#1F2937" : "#FFFFFF",
//         },
//     ]);
//     const [openMenuId, setOpenMenuId] = useState<number | null>(null);
//     const menuRef = useRef<HTMLDivElement>(null);

//     const getTitleLimit = useCallback(() => 15, []); // Limite de caracteres para o título

//     const handleOpenFolder = (folderId: number) => {
//         onOpenFolder(folderId);
//     };

//     const handleCustomizeFolder = (folderId: number) => {
//         // Placeholder para customização (ex.: mudar cor, imagem)
//         console.log(`Customize folder ${folderId}`);
//     };

//     const handleRenameFolder = (folderId: number) => {
//         const newTitle = prompt("Enter new folder title:");
//         if (newTitle) {
//             setFolders((prev) =>
//                 prev.map((folder) =>
//                     folder.id === folderId ? { ...folder, title: newTitle } : folder
//                 )
//             );
//         }
//     };

//     const handleDuplicateFolder = (folderId: number) => {
//         const folder = folders.find((f) => f.id === folderId);
//         if (folder) {
//             setFolders((prev) => [
//                 ...prev,
//                 { ...folder, id: Date.now(), title: `${folder.title} (Copy)` },
//             ]);
//         }
//     };

//     const handleDeleteFolder = (folderId: number) => {
//         setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
//     };

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//                 setOpenMenuId(null);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     return (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
//             <AnimatePresence>
//                 {folders.map((folder) => (
//                     <motion.div
//                         key={folder.id}
//                         layout
//                         initial={{ opacity: 1 }}
//                         exit={{ opacity: 0, scale: 0.95 }}
//                         transition={{ duration: 0.3, ease: "easeInOut" }}
//                     >
//                         <motion.div
//                             className={`aspect-square rounded-2xl transition border-2 flex overflow-hidden ${theme === "light" ? "border-white" : "border-slate-900"}`}
//                             style={{
//                                 backgroundColor: folder.bgColor,
//                                 boxShadow: folder.shadow,
//                                 opacity: folder.opacity,
//                             }}
//                             onClick={() => handleOpenFolder(folder.id)}
//                             whileHover={{ scale: 1.05, boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.15)" }}
//                             transition={{ duration: 0.2, ease: "easeInOut" }}
//                         >
//                             <div
//                                 className="w-[38%] h-full"
//                                 style={{
//                                     backgroundImage: folder.imageUrl ? `url(${folder.imageUrl})` : "none",
//                                     backgroundColor: !folder.imageUrl ? (theme === "light" ? "#e5e7eb" : "#475569") : "transparent",
//                                     backgroundSize: "cover",
//                                     backgroundPosition: "center",
//                                 }}
//                             >
//                                 {!folder.imageUrl && (
//                                     <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
//                                         Image
//                                     </div>
//                                 )}
//                             </div>
//                             <div className="w-[60%] p-2 flex flex-col justify-between">
//                                 <h2
//                                     className="text-base font-semibold"
//                                     style={{
//                                         color: folder.titleColor || (theme === "light" ? "#1F2937" : "#FFFFFF"),
//                                     }}
//                                 >
//                                     {folder.title.length > getTitleLimit() ? folder.title.slice(0, getTitleLimit()) + "..." : folder.title}
//                                 </h2>
//                                 <p className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
//                                     {folder.description.length > 30 ? folder.description.slice(0, 30) + "..." : folder.description}
//                                 </p>
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleCustomizeFolder(folder.id);
//                                     }}
//                                     className={`p-1 rounded-full self-end ${theme === "light"
//                                         ? "bg-white text-gray-900 hover:bg-gray-200"
//                                         : "bg-slate-800 text-gray-100 hover:bg-slate-600"}`}
//                                 >
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={2}
//                                             d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
//                                         />
//                                     </svg>
//                                 </button>
//                             </div>
//                         </motion.div>
//                         <div className="py-1 flex items-center justify-between px-2 relative">
//                             <div className={`${theme === "light" ? "text-neutral-700" : "text-neutral-300"}`}>
//                                 {folder.description}
//                             </div>
//                             <div
//                                 className={`p-1 ${theme === "light" ? "text-neutral-700 hover:bg-neutral-200" : "text-neutral-300 hover:bg-slate-700"} rounded-full cursor-pointer`}
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     setOpenMenuId(openMenuId === folder.id ? null : folder.id);
//                                 }}
//                             >
//                                 <MoreHorizontal size={22} />
//                             </div>
//                             <AnimatePresence>
//                                 {openMenuId === folder.id && (
//                                     <motion.div
//                                         ref={menuRef}
//                                         className={`absolute right-2 p-1 top-8 z-10 rounded-md shadow-lg ${theme === "light" ? "bg-white" : "bg-slate-800"}`}
//                                         initial={{ opacity: 0, scale: 0.95 }}
//                                         animate={{ opacity: 1, scale: 1 }}
//                                         exit={{ opacity: 0, scale: 0.95 }}
//                                         transition={{ duration: 0.1 }}
//                                     >
//                                         <div className="py-1">
//                                             <button
//                                                 className={`block w-full text-left px-4 rounded-md py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"}`}
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleRenameFolder(folder.id);
//                                                 }}
//                                             >
//                                                 Rename
//                                             </button>
//                                             <button
//                                                 className={`block w-full text-left px-4 rounded-md py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"}`}
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleDuplicateFolder(folder.id);
//                                                 }}
//                                             >
//                                                 Duplicate
//                                             </button>
//                                             <button
//                                                 className={`block w-full text-left px-4 rounded-md py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"}`}
//                                                 onClick={(e) => console.log("Share your thoughts, may be good for someone else!")}
//                                             >
//                                                 Share
//                                             </button>
//                                             <button
//                                                 className={`block w-full text-left px-4 rounded-md py-2 text-sm ${theme === "light" ? "text-red-600 hover:bg-red-400/10" : "text-red-500 hover:bg-red-700/20"}`}
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleDeleteFolder(folder.id);
//                                                 }}
//                                             >
//                                                 Delete
//                                             </button>
//                                         </div>
//                                     </motion.div>
//                                 )}
//                             </AnimatePresence>
//                         </div>
//                     </motion.div>
//                 ))}
//             </AnimatePresence>
//         </div>
//     );
// };

// export default NotesFolders;
