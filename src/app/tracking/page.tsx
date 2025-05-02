'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
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
    ReactFlowProvider,
    NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import LandingFooter from '../components/footers/LandingFooter';
import Container from '../components/Container';
import { useTheme } from '../themeContext';
import { motion } from 'framer-motion';
import { IoMdAdd, IoMdCalendar, IoMdMenu } from 'react-icons/io';
import { TaskNodeData, CategoryColors, Corner } from "@/app/types/index"
import CustomDropdown from '../components/CustomDropdown';
import TaskNodeComponent from '../components/roadmap/TaskNodeComponent';
import MainNavbar from '../components/navbars/MainNavbar';

// Type for corners
const defaultCategoryColors: CategoryColors = {
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
    const { setViewport } = useReactFlow();

    // Initialize corners from localStorage
    const [corners, setCorners] = useState<Corner[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('corners');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map((corner: any) => ({
                    id: corner.id.toString(),
                    title: corner.title,
                }));
            }
        }
        return [];
    });

    // Initialize nodes from localStorage
    const initialNodes: Node<TaskNodeData>[] = (() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('corners');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('Initial localStorage corners:', parsed); // Debug
                let nodes: Node<TaskNodeData>[] = [];
                parsed.forEach((corner: any, cornerIndex: number) => {
                    corner.tasks.forEach((task: any, taskIndex: number) => {
                        const position = task.position && typeof task.position.x === 'number' && typeof task.position.y === 'number'
                            ? task.position
                            : {
                                  x: 100 + (cornerIndex * 300) + (taskIndex * 50),
                                  y: 100 + (taskIndex * 150),
                              };
                        nodes.push({
                            id: task.id.toString(),
                            type: 'custom',
                            data: {
                                title: task.title,
                                status: task.status === 'Done' ? 'Done' : 'Todo',
                                createdDate: task.createdDate,
                                dueDate: task.dueDate,
                                priority: task.priority,
                                category: task.category || 'Other',
                                cornerId: corner.id.toString(),
                                position,
                            },
                            position,
                        });
                    });
                });
                console.log('Initial Nodes:', nodes); // Debug
                return nodes;
            }
        }
        return [];
    })();

    const initialEdges: Edge[] = (() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('edges');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('Initial localStorage edges:', parsed); // Debug
                // Validate edges: ensure source and target nodes exist
                const nodeIds = new Set(initialNodes.map(node => node.id));
                return parsed.filter((edge: any) => 
                    edge.id && edge.source && edge.target && 
                    nodeIds.has(edge.source) && nodeIds.has(edge.target)
                ).map((edge: any) => ({
                    ...edge,
                    style: {
                        stroke: theme === 'light' ? '#a855f7' : '#7e22ce',
                        strokeWidth: 2,
                    },
                }));
            }
        }
        return [];
    })();

    const [nodes, setNodes, onNodesChange] = useNodesState<TaskNodeData>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskNodeData['priority']>('Medium');
    const [newTaskCategory, setNewTaskCategory] = useState<TaskNodeData['category']>('Other');
    const [newTaskCorner, setNewTaskCorner] = useState<string>('');
    const [categoryColors, setCategoryColors] = useState<CategoryColors>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('categoryColors');
            return saved ? JSON.parse(saved) : defaultCategoryColors;
        }
        return defaultCategoryColors;
    });
    const [showAllCorners, setShowAllCorners] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);

    // Persist category colors
    useEffect(() => {
        localStorage.setItem('categoryColors', JSON.stringify(categoryColors));
    }, [categoryColors]);

     // Persist edges to localStorage
     useEffect(() => {
        try {
            console.log('Saving edges to localStorage:', edges); // Debug
            localStorage.setItem('edges', JSON.stringify(edges));
        } catch (error) {
            console.error('Error saving edges to localStorage:', error);
        }
    }, [edges]);

    // Sync nodes with localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            // Sync corners and nodes
            const savedCorners = localStorage.getItem('corners');
            if (savedCorners) {
                const parsed = JSON.parse(savedCorners);
                console.log('Storage Change localStorage corners:', parsed); // Debug
                setCorners(
                    parsed.map((corner: any) => ({
                        id: corner.id.toString(),
                        title: corner.title,
                    }))
                );
                let newNodes: Node<TaskNodeData>[] = [];
                parsed.forEach((corner: any, cornerIndex: number) => {
                    corner.tasks.forEach((task: any, taskIndex: number) => {
                        const position = task.position && typeof task.position.x === 'number' && typeof task.position.y === 'number'
                            ? task.position
                            : {
                                  x: 100 + (cornerIndex * 300) + (taskIndex * 50),
                                  y: 100 + (taskIndex * 150),
                              };
                        newNodes.push({
                            id: task.id.toString(),
                            type: 'custom',
                            data: {
                                title: task.title,
                                status: task.status === 'Done' ? 'Done' : 'Todo',
                                createdDate: task.createdDate,
                                dueDate: task.dueDate,
                                priority: task.priority,
                                category: task.category || 'Other',
                                cornerId: corner.id.toString(),
                                position,
                            },
                            position,
                        });
                    });
                });
                console.log('Storage Change Nodes:', newNodes); // Debug
                setNodes(newNodes);
            }

            // Sync edges
            const savedEdges = localStorage.getItem('edges');
            if (savedEdges) {
                const parsedEdges = JSON.parse(savedEdges);
                console.log('Storage Change localStorage edges:', parsedEdges); // Debug
                // Validate edges
                const nodeIds = new Set(nodes.map(node => node.id));
                const validEdges = parsedEdges.filter((edge: any) => 
                    edge.id && edge.source && edge.target && 
                    nodeIds.has(edge.source) && nodeIds.has(edge.target)
                ).map((edge: any) => ({
                    ...edge,
                    style: {
                        stroke: theme === 'light' ? '#a855f7' : '#7e22ce',
                        strokeWidth: 2,
                    },
                }));
                console.log('Storage Change Edges:', validEdges); // Debug
                setEdges(validEdges);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [setNodes, setEdges, theme]);

    // Save node positions to localStorage on change
    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            onNodesChange(changes);
            changes.forEach((change) => {
                console.log('Node Change:', change); // Debug
                if (change.type === 'position' && change.position) {
                    const saved = localStorage.getItem('corners');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        const updatedCorners = parsed.map((corner: any) => ({
                            ...corner,
                            tasks: corner.tasks.map((task: any) =>
                                task.id.toString() === change.id
                                    ? {
                                          ...task,
                                          position: {
                                              x: Math.round(change.position!.x),
                                              y: Math.round(change.position!.y),
                                          },
                                      }
                                    : task
                            ),
                        }));
                        console.log('Saving Positions:', updatedCorners); // Debug
                        localStorage.setItem('corners', JSON.stringify(updatedCorners));
                    }
                }
            });
        },
        [onNodesChange]
    );

    // Calculate progress for each category
    const progress = useMemo(() => {
        const categories: TaskNodeData['category'][] = ['Work', 'Personal', 'Study', 'Other'];
        return categories.map((category) => {
            const total = nodes.filter((node) => node.data.category === category).length;
            const completed = nodes.filter(
                (node) => node.data.category === category && node.data.status === 'Done'
            ).length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            return { category, total, completed, percentage };
        });
    }, [nodes]);

    // Memoize nodeTypes
    const nodeTypes = useMemo(
        () => ({
            custom: (props: any) => (
                <TaskNodeComponent {...props} categoryColors={categoryColors} />
            ),
        }),
        [categoryColors]
    );

    // Generate simple ID
    const generateId = () => Date.now().toString();

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds: Edge[]) => {
                const newEdge = {
                    ...params,
                    id: `e${params.source}-${params.target}`,
                    style: { stroke: theme === 'light' ? '#a855f7' : '#7e22ce', strokeWidth: 2 },
                };
                const updatedEdges = addEdge(newEdge, eds);
                return updatedEdges;
            });
        },
        [setEdges, theme]
    );

    const onEdgeClick = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            setEdges((eds) => {
                const updatedEdges = eds.filter((e) => e.id !== edge.id);
                return updatedEdges;
            });
        },
        [setEdges]
    );

    const onEdgeDoubleClick = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            setEdges((eds) => {
                const updatedEdges = eds.filter((e) => e.id !== edge.id);
                console.log('Deleting Edge (Double Click):', edge, 'Updated Edges:', updatedEdges); // Debug
                return updatedEdges;
            });
        },
        [setEdges]
    );

    const addTask = () => {
        if (!newTaskTitle.trim() || !newTaskCorner) return;
        const newPosition = { x: Math.random() * 300, y: Math.random() * 300 };
        const newTask = {
            id: parseInt(generateId()),
            title: newTaskTitle,
            status: 'To Do' as const,
            createdDate: new Date().toISOString().split('T')[0],
            dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
            priority: newTaskPriority,
            isCompleted: false,
            category: newTaskCategory,
            position: newPosition,
        };
        const saved = localStorage.getItem('corners');
        let parsed = saved ? JSON.parse(saved) : [];
        parsed = parsed.map((corner: any) =>
            corner.id.toString() === newTaskCorner
                ? { ...corner, tasks: [...corner.tasks, newTask] }
                : corner
        );
        console.log('Adding Task:', newTask, 'Corners:', parsed); // Debug
        localStorage.setItem('corners', JSON.stringify(parsed));

        const newNode: Node<TaskNodeData> = {
            id: newTask.id.toString(),
            type: 'custom',
            data: {
                title: newTaskTitle,
                status: 'Todo',
                createdDate: newTask.createdDate,
                dueDate: newTaskDueDate || undefined,
                priority: newTaskPriority,
                category: newTaskCategory,
                cornerId: newTaskCorner,
                position: newPosition,
            },
            position: newPosition,
        };
        setNodes((nds) => [...nds, newNode]);
        setNewTaskTitle('');
        setNewTaskDueDate('');
        setNewTaskPriority('Medium');
        setNewTaskCategory('Other');
        setNewTaskCorner('');
    };

    const updateCategoryColor = (category: TaskNodeData['category'], color: string) => {
        setCategoryColors((prev) => ({ ...prev, [category]: color }));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (isNavbarOpen) setIsNavbarOpen(false);
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

    const cornerOptions = corners.map((corner) => ({
        value: corner.id,
        label: corner.title,
    }));

    return (
        <div
            className={`flex flex-col min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-900'}`}
        >
            <MainNavbar />
            {/* <LandingNavbar /> */}
            <main className="flex-1 py-12">
                <Container>
                    <div className="max-w-screen-4xl mx-auto">
                        {/* <h1
                            className={`text-3xl sm:text-4xl font-bold mb-8 text-center ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                        >
                            Roadmap
                        </h1> */}
                        <div className="flex flex-col lg:flex-row gap-6 mt-20">
                            <button
                                onClick={toggleSidebar}
                                className={`lg:hidden p-2 rounded-md bg-fuchsia-600 text-white mb-4 ${isSidebarOpen ? 'hidden' : 'block'}`}
                            >
                                <IoMdMenu size={20} />
                            </button>
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`w-full lg:w-80 h-[calc(100vh-200px)] p-4 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-700'} shadow-md overflow-y-auto ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}
                            >
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
                                        <CustomDropdown
                                            options={priorityOptions}
                                            value={newTaskPriority}
                                            onChange={(value) => setNewTaskPriority(value as TaskNodeData['priority'])}
                                            placeholder="Select Priority"
                                        />
                                        <CustomDropdown
                                            options={categoryOptions}
                                            value={newTaskCategory}
                                            onChange={(value) => setNewTaskCategory(value as TaskNodeData['category'])}
                                            placeholder="Select Category"
                                        />
                                        <CustomDropdown
                                            options={cornerOptions}
                                            value={newTaskCorner}
                                            onChange={(value) => setNewTaskCorner(value)}
                                            placeholder="Select Corner"
                                        />
                                        <button
                                            onClick={addTask}
                                            className="px-3 py-1.5 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition flex items-center justify-center gap-2"
                                        >
                                            <IoMdAdd size={16} /> Add Task
                                        </button>
                                    </div>
                                </div>
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
                            <div className="flex-1 w-full h-[calc(100vh-200px)] rounded-lg overflow-hidden shadow-md z-0">
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={handleNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    onEdgeClick={onEdgeClick}
                                    onEdgeDoubleClick={onEdgeDoubleClick}
                                    nodeTypes={nodeTypes}
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
                                        className={`rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-700'}`}
                                        maskColor="transparent"
                                        style={{ background: theme === 'light' ? '#f1f1f1' : '#26304A' }}
                                    />
                                </ReactFlow>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mt-6 p-4 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-700'} shadow-md`}
                        >
                            <h2
                                className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                            >
                                Category Progress
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {progress.map(({ category, total, completed, percentage }) => (
                                    <div key={category} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}
                                            >
                                                {category}
                                            </span>
                                            <span
                                                className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'}`}
                                            >
                                                {percentage}% ({completed}/{total})
                                            </span>
                                        </div>
                                        <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-slate-600'} rounded-full h-2.5`}>
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%`, backgroundColor: categoryColors[category] }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </main>
            <LandingFooter />
        </div>
    );
}

// Optional: Custom Edge with Delete Button (uncomment to enable)
// import { EdgeProps } from 'reactflow';
// const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style }: EdgeProps) => {
//     const { setEdges } = useReactFlow();
//     return (
//         <>
//             <path
//                 id={id}
//                 style={style}
//                 d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
//             />
//             <foreignObject
//                 width="24"
//                 height="24"
//                 x={(sourceX + targetX) / 2 - 12}
//                 y={(sourceY + targetY) / 2 - 12}
//             >
//                 <button
//                     className="bg-fuchsia-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
//                     onClick={() => setEdges((eds) => eds.filter((e) => e.id !== id))}
//                 >
//                     ×
//                 </button>
//             </foreignObject>
//         </>
//     );
// };
// const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);
// Update mockEdges: { id: 'e1-2', source: '1', target: '2', type: 'custom', style: { stroke: '#a855f7', strokeWidth: 2 } }
// Update onConnect: { ...params, id: `e${params.source}-${params.target}`, type: 'custom', style: ... }
// Update ReactFlow: edgeTypes={edgeTypes}
