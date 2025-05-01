'use client';

import { useState } from 'react';
import { useReactFlow, Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { IoMdCheckmark, IoMdCreate, IoMdCalendar } from 'react-icons/io';
import { useTheme } from '@/app/themeContext';
import CustomDropdown from '../CustomDropdown';

// Type for node data
export type TaskNodeData = {
    title: string;
    status: 'Todo' | 'Done';
    createdDate: string;
    dueDate?: string;
    priority: 'Low' | 'Medium' | 'High';
    category: 'Work' | 'Personal' | 'Study' | 'Other';
    cornerId?: string;
};

// Type for category colors
export type CategoryColors = Record<TaskNodeData['category'], string>;

// Custom node component
const TaskNodeComponent = ({
    data,
    id,
    categoryColors,
}: {
    data: TaskNodeData;
    id: string;
    categoryColors: CategoryColors;
}) => {
    const { theme } = useTheme();
    const { setNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<TaskNodeData>(data);

    const saveChanges = () => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: editData } : node
            )
        );
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setEditData(data);
        setIsEditing(false);
    };

    const priorityOptions = [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
    ];

    const categoryOptions = [
        { value: 'Work', label: 'Work' },
        { value: 'Personal', label: 'Personal' },
        { value: 'Study', label: 'Study' },
        { value: 'Other', label: 'Other' },
    ];

    const cornerOptions = [
        { value: '', label: 'No Corner' },
        ...mockCorners.map((corner) => ({
            value: corner.id,
            label: corner.title,
        })),
    ];

    return (
        <motion.div
            className={`p-4 rounded-lg shadow-md w-48 relative ${theme === 'light' ? 'bg-white' : 'bg-slate-700'} border-2`}
            style={{ borderColor: categoryColors[data.category] }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            {/* Bullet for Connections */}
            <Handle
                type="source"
                position={Position.Right}
                id="source"
                className="w-3 h-3 bg-fuchsia-600 rounded-full"
                style={{ top: '20px', right: '-6px' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target"
                className="w-3 h-3 bg-fuchsia-600 rounded-full"
                style={{ top: '20px', left: '-6px' }}
            />

            {isEditing ? (
                <div className="flex flex-col gap-2">
                    <input
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        placeholder="Task title"
                        className={`w-full px-2 py-1 text-sm ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-600 text-neutral-200'} border rounded focus:outline-none`}
                    />
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={editData.dueDate || ''}
                            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value || undefined })}
                            className={`w-full px-2 py-1 text-sm ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-600 text-neutral-200'} border rounded focus:outline-none`}
                        />
                        <IoMdCalendar size={16} className="text-fuchsia-600 mt-2" />
                    </div>
                    <CustomDropdown
                        options={priorityOptions}
                        value={editData.priority}
                        onChange={(value) => setEditData({ ...editData, priority: value as TaskNodeData['priority'] })}
                        placeholder="Select Priority"
                    />
                    <CustomDropdown
                        options={categoryOptions}
                        value={editData.category}
                        onChange={(value) => setEditData({ ...editData, category: value as TaskNodeData['category'] })}
                        placeholder="Select Category"
                    />
                    <CustomDropdown
                        options={cornerOptions}
                        value={editData.cornerId || ''}
                        onChange={(value) => setEditData({ ...editData, cornerId: value || undefined })}
                        placeholder="Select Corner"
                    />
                    <div className="flex items-center gap-2">
                        <label
                            className={`text-sm ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                        >
                            Done:
                            <input
                                type="checkbox"
                                checked={editData.status === 'Done'}
                                onChange={(e) =>
                                    setEditData({ ...editData, status: e.target.checked ? 'Done' : 'Todo' })
                                }
                                className="ml-2"
                            />
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={saveChanges}
                            className="px-2 py-1 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 text-sm"
                        >
                            Save
                        </button>
                        <button
                            onClick={cancelEdit}
                            className={`px-2 py-1 rounded-md text-sm ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-600 text-neutral-200'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setNodes((nds) =>
                                        nds.map((node) =>
                                            node.id === id
                                                ? {
                                                      ...node,
                                                      data: {
                                                          ...node.data,
                                                          status: node.data.status === 'Todo' ? 'Done' : 'Todo',
                                                      },
                                                  }
                                                : node
                                        )
                                    )
                                }
                                className={`p-1 rounded-full ${data.status === 'Done' ? 'bg-fuchsia-600 text-white' : 'bg-gray-200 text-gray-900'}`}
                            >
                                <IoMdCheckmark size={16} />
                            </button>
                            <span
                                className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'} ${data.status === 'Done' ? 'line-through' : ''}`}
                            >
                                {data.title}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`p-1 rounded-md ${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'} hover:text-fuchsia-600`}
                        >
                            <IoMdCreate size={16} />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500">
                        <p>Due: {data.dueDate || 'N/A'}</p>
                        <p>Priority: {data.priority}</p>
                        <p>Category: {data.category}</p>
                        <p>Corner: {mockCorners.find((c) => c.id === data.cornerId)?.title || 'None'}</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Mock corners (temporary, can be moved to a shared file if needed)
const mockCorners: { id: string; title: string }[] = [
    { id: 'c1', title: 'Onixin' },
    { id: 'c2', title: 'Project X' },
    { id: 'c3', title: 'Personal Goals' },
    { id: 'c4', title: 'Study Plan' },
];

export default TaskNodeComponent;