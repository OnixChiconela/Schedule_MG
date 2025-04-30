'use client';

import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    Connection,
    useReactFlow,
    Handle,
    Position,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import LandingNavbar from '../components/navbars/LandingNavbar';
import LandingFooter from '../components/footers/LandingFooter';
import Container from '../components/Container';
import { useTheme } from '../themeContext';
import { motion } from 'framer-motion';
import { IoMdCheckmark, IoMdCreate, IoMdAdd, IoMdCalendar, IoMdMenu } from 'react-icons/io';

// Type for node data
type TaskNodeData = {
    title: string;
    status: 'Todo' | 'Done';
    createdDate: string;
    dueDate?: string;
    priority: 'Low' | 'Medium' | 'High';
    category: 'Work' | 'Personal' | 'Study' | 'Other';
    cornerId?: string;
};

// Type for corners
type Corner = {
    id: string;
    title: string;
};

// Mock corners
const mockCorners: Corner[] = [
    { id: 'c1', title: 'Onixin' },
    { id: 'c2', title: 'Project X' },
    { id: 'c3', title: 'Personal Goals' },
    { id: 'c4', title: 'Study Plan' },
];

// Mock nodes
const mockNodes: Node<TaskNodeData>[] = [
    {
        id: '1',
        type: 'custom',
        data: {
            title: 'Get out of bed',
            status: 'Done',
            createdDate: '2025-04-30',
            dueDate: '2025-04-30',
            priority: 'Low',
            category: 'Personal',
            cornerId: 'c3',
        },
        position: { x: 100, y: 100 },
    },
    {
        id: '2',
        type: 'custom',
        data: {
            title: 'Write blog post',
            status: 'Todo',
            createdDate: '2025-04-30',
            dueDate: '2025-05-02',
            priority: 'Medium',
            category: 'Work',
            cornerId: 'c1',
        },
        position: { x: 300, y: 100 },
    },
    {
        id: '3',
        type: 'custom',
        data: {
            title: 'Attend meeting',
            status: 'Todo',
            createdDate: '2025-04-30',
            dueDate: '2025-05-01',
            priority: 'High',
            category: 'Work',
            cornerId: 'c1',
        },
        position: { x: 100, y: 300 },
    },
    {
        id: '4',
        type: 'custom',
        data: {
            title: 'Prepare notes',
            status: 'Done',
            createdDate: '2025-04-30',
            dueDate: '2025-04-29',
            priority: 'Medium',
            category: 'Study',
            cornerId: 'c4',
        },
        position: { x: 300, y: 300 },
    },
];

// Mock edges
const mockEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', style: { stroke: '#a855f7', strokeWidth: 2 } },
    { id: 'e3-4', source: '3', target: '4', style: { stroke: '#a855f7', strokeWidth: 2 } },
    { id: 'e1-3', source: '1', target: '3', style: { stroke: '#a855f7', strokeWidth: 2 } },
];

// Custom node component
const TaskNodeComponent = ({
    data,
    id,
    categoryColors,
}: {
    data: TaskNodeData;
    id: string;
    categoryColors: Record<TaskNodeData['category'], string>;
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
                    <select
                        value={editData.priority}
                        onChange={(e) => setEditData({ ...editData, priority: e.target.value as TaskNodeData['priority'] })}
                        className={`w-full px-2 py-1 text-sm ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-600 text-neutral-200'} border rounded focus:outline-none`}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                    <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value as TaskNodeData['category'] })}
                        className={`w-full px-2 py-1 text-sm ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-600 text-neutral-200'} border rounded focus:outline-none`}
                    >
                        <option value="Work">Work</option>
                        <option value="Personal">Personal</option>
                        <option value="Study">Study</option>
                        <option value="Other">Other</option>
                    </select>
                    <select
                        value={editData.cornerId || ''}
                        onChange={(e) => setEditData({ ...editData, cornerId: e.target.value || undefined })}
                        className={`w-full px-2 py-1 text-sm ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-600 text-neutral-200'} border rounded focus:outline-none`}
                    >
                        <option value="">No Corner</option>
                        {mockCorners.map((corner) => (
                            <option key={corner.id} value={corner.id}>
                                {corner.title}
                            </option>
                        ))}
                    </select>
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

// Category colors
const defaultCategoryColors: Record<TaskNodeData['category'], string> = {
    Work: '#3b82f6',
    Personal: '#22c55e',
    Study: '#f59e0b',
    Other: '#6b7280',
};

// Main component
export default function TrackingPage() {
    return (
        <ReactFlowProvider>
            <TrackingPageContent />
        </ReactFlowProvider>
    );
}

function TrackingPageContent() {
    const { theme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState<TaskNodeData>(mockNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(mockEdges);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskNodeData['priority']>('Medium');
    const [newTaskCategory, setNewTaskCategory] = useState<TaskNodeData['category']>('Work');
    const [newTaskCorner, setNewTaskCorner] = useState<string>('c1');
    const [categoryColors, setCategoryColors] = useState<Record<TaskNodeData['category'], string>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('categoryColors');
            return saved ? JSON.parse(saved) : defaultCategoryColors;
        }
        return defaultCategoryColors;
    });
    const [corners, setCorners] = useState<Corner[]>(mockCorners);
    const [showAllCorners, setShowAllCorners] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);
    const { setViewport } = useReactFlow();

    // Persist category colors
    useEffect(() => {
        localStorage.setItem('categoryColors', JSON.stringify(categoryColors));
    }, [categoryColors]);

    // Generate simple ID
    const generateId = () => Date.now().toString();

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds: Edge[]) =>
                addEdge(
                    {
                        ...params,
                        id: `e${params.source}-${params.target}`,
                        style: { stroke: theme === 'light' ? '#a855f7' : '#7e22ce', strokeWidth: 2 },
                    },
                    eds
                )
            ),
        [setEdges, theme]
    );

    const onEdgeClick = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        },
        [setEdges]
    );

    const onEdgeDoubleClick = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        },
        [setEdges]
    );

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const newNode: Node<TaskNodeData> = {
            id: generateId(),
            type: 'custom',
            data: {
                title: newTaskTitle,
                status: 'Todo',
                createdDate: new Date().toISOString().split('T')[0],
                dueDate: newTaskDueDate || undefined,
                priority: newTaskPriority,
                category: newTaskCategory,
                cornerId: newTaskCorner,
            },
            position: { x: Math.random() * 300, y: Math.random() * 300 },
        };
        setNodes((nds) => [...nds, newNode]);
        setNewTaskTitle('');
        setNewTaskDueDate('');
        setNewTaskPriority('Medium');
        setNewTaskCategory('Work');
        setNewTaskCorner('c1');
    };

    const updateCategoryColor = (category: TaskNodeData['category'], color: string) => {
        setCategoryColors((prev) => ({ ...prev, [category]: color }));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (isNavbarOpen) setIsNavbarOpen(false); // Close navbar if open
    };

    return (
        <div
            className={`flex flex-col min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-900'}`}
        >
            <LandingNavbar />
            <main className="flex-1 py-12">
                <Container>
                    <div className="max-w-screen-4xl mx-auto">
                        <h1
                            className={`text-3xl sm:text-4xl font-bold mb-8 text-center ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                        >
                            Roadmap
                        </h1>
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Sidebar Toggle Button (Mobile) */}
                            <button
                                onClick={toggleSidebar}
                                className={`lg:hidden p-2 rounded-md bg-fuchsia-600 text-white mb-4 ${isSidebarOpen ? 'hidden' : 'block'}`}
                            >
                                <IoMdMenu size={20} />
                            </button>
                            {/* Sidebar */}
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`w-full lg:w-80 h-[calc(100vh-200px)] p-4 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-700'} shadow-md overflow-y-auto ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}
                            >
                                {/* Add Task */}
                                <div className="mb-6">
                                    <h2
                                        className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                                    >
                                        Add New Task
                                    </h2>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            placeholder="Task title"
                                            className={`w-full px-3 py-1.5 rounded-md text-sm ${theme === 'light' ? 'bg-white text-gray-900 border border-gray-300' : 'bg-slate-600 text-neutral-200 border border-slate-500'} focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={newTaskDueDate}
                                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                                className={`w-full px-3 py-1.5 rounded-md text-sm ${theme === 'light' ? 'bg-white text-gray-900 border border-gray-300' : 'bg-slate-600 text-neutral-200 border border-slate-500'} focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
                                            />
                                            <IoMdCalendar size={20} className="text-fuchsia-600 mt-2" />
                                        </div>
                                        <select
                                            value={newTaskPriority}
                                            onChange={(e) => setNewTaskPriority(e.target.value as TaskNodeData['priority'])}
                                            className={`w-full px-3 py-1.5 rounded-md text-sm ${theme === 'light' ? 'bg-white text-gray-900 border border-gray-300' : 'bg-slate-600 text-neutral-200 border border-slate-500'} focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                        <select
                                            value={newTaskCategory}
                                            onChange={(e) => setNewTaskCategory(e.target.value as TaskNodeData['category'])}
                                            className={`w-full px-3 py-1.5 rounded-md text-sm ${theme === 'light' ? 'bg-white text-gray-900 border border-gray-300' : 'bg-slate-600 text-neutral-200 border border-slate-500'} focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
                                        >
                                            <option value="Work">Work</option>
                                            <option value="Personal">Personal</option>
                                            <option value="Study">Study</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <select
                                            value={newTaskCorner}
                                            onChange={(e) => setNewTaskCorner(e.target.value)}
                                            className={`w-full px-3 py-1.5 rounded-md text-sm ${theme === 'light' ? 'bg-white text-gray-900 border border-gray-300' : 'bg-slate-600 text-neutral-200 border border-slate-500'} focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
                                        >
                                            {corners.map((corner) => (
                                                <option key={corner.id} value={corner.id}>
                                                    {corner.title}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={addTask}
                                            className="px-3 py-1.5 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition flex items-center justify-center gap-2"
                                        >
                                            <IoMdAdd size={16} /> Add Task
                                        </button>
                                    </div>
                                </div>
                                {/* Corners */}
                                <div className="mb-6">
                                    <h2
                                        className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                                    >
                                        Corners
                                    </h2>
                                    <ul className="space-y-2">
                                        {corners.slice(0, showAllCorners ? undefined : 3).map((corner) => {
                                            const taskCount = nodes.filter((node) => node.data.cornerId === corner.id).length;
                                            return (
                                                <li
                                                    key={corner.id}
                                                    className={`p-2 rounded-md ${theme === 'light' ? 'bg-gray-50' : 'bg-slate-800'}`}
                                                >
                                                    <span
                                                        className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                                                    >
                                                        {corner.title} ({taskCount} tasks)
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {corners.length > 3 && (
                                        <button
                                            onClick={() => setShowAllCorners(!showAllCorners)}
                                            className={`mt-2 text-sm ${theme === 'light' ? 'text-fuchsia-600' : 'text-fuchsia-400'} hover:underline`}
                                        >
                                            {showAllCorners ? 'Show Less' : 'Show More'}
                                        </button>
                                    )}
                                </div>
                                {/* Categories */}
                                <div>
                                    <h2
                                        className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                                    >
                                        Categories
                                    </h2>
                                    <div className="flex flex-col gap-3">
                                        {Object.entries(categoryColors).map(([category, color]) => (
                                            <div key={category} className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={color}
                                                    onChange={(e) => updateCategoryColor(category as TaskNodeData['category'], e.target.value)}
                                                    onClick={() => {
                                                        const node = nodes.find((n) => n.data.category === category);
                                                        if (node) {
                                                            setViewport(
                                                                { x: -node.position.x + 300, y: -node.position.y + 300, zoom: 1 },
                                                                { duration: 500 }
                                                            );
                                                        }
                                                    }}
                                                    className="w-5 h-5 rounded cursor-pointer"
                                                    style={{
                                                        appearance: 'none',
                                                        backgroundColor: color,
                                                        border: '1px solid',
                                                        borderColor: theme === 'light' ? '#d1d5db' : '#4b5563',
                                                        padding: 0,
                                                        margin: 0,
                                                    }}
                                                />
                                                <span
                                                    className={`text-sm ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                                                >
                                                    {category}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                            {/* React Flow Canvas */}
                            <div className="flex-1 w-full h-[calc(100vh-200px)] rounded-lg overflow-hidden shadow-md z-0">
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    onEdgeClick={onEdgeClick}
                                    onEdgeDoubleClick={onEdgeDoubleClick}
                                    nodeTypes={{
                                        custom: (props) => <TaskNodeComponent {...props} categoryColors={categoryColors} />,
                                    }}
                                    fitView
                                    className={`${theme === 'light' ? 'bg-gray-50' : 'bg-slate-800'}`}
                                >
                                    <Background
                                        gap={20}
                                        size={2}
                                        color={theme === 'light' ? '#d1d5db' : '#4b5563'}
                                    />
                                    <Controls />
                                    <MiniMap
                                        nodeColor={(node) =>
                                            node.data.status === 'Done'
                                                ? theme === 'light'
                                                    ? '#a855f7'
                                                    : '#7e22ce'
                                                : theme === 'light'
                                                    ? '#d1d5db'
                                                    : '#4b5563'
                                        }
                                    />
                                </ReactFlow>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
            <LandingFooter />
        </div>
    );
}