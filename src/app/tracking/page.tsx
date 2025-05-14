"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
    NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import LandingFooter from "../components/footers/LandingFooter";
import Container from "../components/Container";
import { useTheme } from "../themeContext";
import { motion } from "framer-motion";
import { IoMdAdd, IoMdCalendar, IoMdMenu } from "react-icons/io";
import { TaskNodeData, CategoryColors } from "@/app/types/index";
import CustomDropdown from "../components/CustomDropdown";
import TaskNodeComponent from "../components/roadmap/TaskNodeComponent";
import TrackingNav from "../components/navbars/trackingNav";
import { Corner, Task } from "../tasks/page";
import { Plus, Trash2 } from "lucide-react";

type RawEdge = {
    id?: string;
    source?: string;
    target?: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    style?: React.CSSProperties;
};

const defaultCategoryColors: CategoryColors = {
    Work: "#3b82f6",
    Personal: "#22c55e",
    Study: "#f59e0b",
    Other: "#6b7280",
};

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

    const [corners, setCorners] = useState<Corner[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("corners");
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map((corner: Corner) => ({
                    id: corner.id.toString(),
                    title: corner.title,
                    tasks: corner.tasks || [],
                }));
            }
        }
        return [];
    });

    const initialNodes: Node<TaskNodeData>[] = (() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("corners");
            if (saved) {
                const parsed = JSON.parse(saved);
                const nodes: Node<TaskNodeData>[] = [];
                parsed.forEach((corner: Corner, cornerIndex: number) => {
                    corner.tasks.forEach((task: Task, taskIndex: number) => {
                        const position =
                            task.position &&
                                typeof task.position.x === "number" &&
                                typeof task.position.y === "number"
                                ? task.position
                                : {
                                    x: 100 + cornerIndex * 300 + taskIndex * 50,
                                    y: 100 + taskIndex * 150,
                                };
                        nodes.push({
                            id: task.id.toString(),
                            type: "custom",
                            data: {
                                title: task.title,
                                status: task.status === "Done" ? "Done" : "Todo",
                                createdDate: task.createdDate,
                                dueDate: task.dueDate,
                                priority: task.priority,
                                category: task.category || "Other",
                                cornerId: corner.id.toString(),
                                position,
                            },
                            position,
                        });
                    });
                });
                return nodes;
            }
        }
        return [];
    })();

    const initialEdges: Edge[] = (() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("edges");
            if (saved) {
                const parsed: RawEdge[] = JSON.parse(saved);
                const nodeIds = new Set(initialNodes.map((node) => node.id));
                return parsed
                    .filter(
                        (edge): edge is Required<Pick<RawEdge, "id" | "source" | "target">> =>
                            edge.id != null &&
                            edge.source != null &&
                            edge.target != null &&
                            nodeIds.has(edge.source) &&
                            nodeIds.has(edge.target)
                    )
                    .map((edge) => ({
                        ...edge,
                        style: {
                            stroke: theme === "light" ? "#a855f7" : "#7e22ce",
                            strokeWidth: 2,
                        },
                    }));
            }
        }
        return [];
    })();

    const [nodes, setNodes, onNodesChange] = useNodesState<TaskNodeData>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<TaskNodeData["priority"]>("Medium");
    const [newTaskCategory, setNewTaskCategory] = useState<TaskNodeData["category"]>("Other");
    const [newTaskCorner, setNewTaskCorner] = useState<string>("");

    const [categoryColors, setCategoryColors] = useState<CategoryColors>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("categoryColors");
            return saved ? JSON.parse(saved) : defaultCategoryColors;
        }
        return defaultCategoryColors;
    });
    const [showAllCorners, setShowAllCorners] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState("#000000");

    useEffect(() => {
        localStorage.setItem("categoryColors", JSON.stringify(categoryColors));
    }, [categoryColors]);

    useEffect(() => {
        try {
            localStorage.setItem("edges", JSON.stringify(edges));
        } catch (error) {
            console.error("Error saving edges to localStorage:", error);
        }
    }, [edges]);

    useEffect(() => {
        const handleStorageChange = () => {
            const savedCorners = localStorage.getItem("corners");
            if (savedCorners) {
                const parsed = JSON.parse(savedCorners);
                setCorners(
                    parsed.map((corner: Corner) => ({
                        id: corner.id.toString(),
                        title: corner.title,
                    }))
                );
                const newNodes: Node<TaskNodeData>[] = [];
                parsed.forEach((corner: Corner, cornerIndex: number) => {
                    corner.tasks.forEach((task: Task, taskIndex: number) => {
                        const position =
                            task.position &&
                                typeof task.position.x === "number" &&
                                typeof task.position.y === "number"
                                ? task.position
                                : {
                                    x: 100 + cornerIndex * 300 + taskIndex * 50,
                                    y: 100 + taskIndex * 150,
                                };
                        newNodes.push({
                            id: task.id.toString(),
                            type: "custom",
                            data: {
                                title: task.title,
                                status: task.status === "Done" ? "Done" : "Todo",
                                createdDate: task.createdDate,
                                dueDate: task.dueDate,
                                priority: task.priority,
                                category: task.category || "Other",
                                cornerId: corner.id.toString(),
                                position,
                            },
                            position,
                        });
                    });
                });
                setNodes(newNodes);
            }

            const savedEdges = localStorage.getItem("edges");
            if (savedEdges) {
                const parsedEdges: RawEdge[] = JSON.parse(savedEdges);
                const nodeIds = new Set(nodes.map((node) => node.id));
                const validEdges = parsedEdges
                    .filter(
                        (edge): edge is Required<Pick<RawEdge, "id" | "source" | "target">> =>
                            edge.id != null &&
                            edge.source != null &&
                            edge.target != null &&
                            nodeIds.has(edge.source) &&
                            nodeIds.has(edge.target)
                    )
                    .map((edge) => ({
                        ...edge,
                        style: {
                            stroke: theme === "light" ? "#a855f7" : "#7e22ce",
                            strokeWidth: 2,
                        },
                    }));
                setEdges(validEdges);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [setNodes, setEdges, theme]);

    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            onNodesChange(changes);
            changes.forEach((change) => {
                if (change.type === "position" && change.position) {
                    const saved = localStorage.getItem("corners");
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        const updatedCorners = parsed.map((corner: Corner) => ({
                            ...corner,
                            tasks: corner.tasks.map((task: Task) =>
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
                        localStorage.setItem("corners", JSON.stringify(updatedCorners));
                    }
                }
            });
        },
        [onNodesChange]
    );

    const progress = useMemo(() => {
        const categories = Object.keys(categoryColors);
        return categories.map((category) => {
            const total = nodes.filter((node) => node.data.category === category).length;
            const completed = nodes.filter(
                (node) => node.data.category === category && node.data.status === "Done"
            ).length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            return { category, total, completed, percentage };
        });
    }, [nodes, categoryColors]);

    const nodeTypes = useMemo(
        () => ({
            custom: (props: NodeProps<TaskNodeData>) => (
                <TaskNodeComponent {...props} categoryColors={categoryColors} />
            ),
        }),
        [categoryColors]
    );

    const generateId = () => Date.now().toString();

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds: Edge[]) => {
                const newEdge = {
                    ...params,
                    id: `e${params.source}-${params.target}`,
                    style: { stroke: theme === "light" ? "#a855f7" : "#7e22ce", strokeWidth: 2 },
                };
                const updatedEdges = addEdge(newEdge, eds);
                return updatedEdges;
            });
        },
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
        if (!newTaskTitle.trim() || !newTaskCorner) return;
        const newPosition = { x: Math.random() * 300, y: Math.random() * 300 };
        const newTask = {
            id: parseInt(generateId()),
            title: newTaskTitle,
            status: "To Do" as const,
            createdDate: new Date().toISOString().split("T")[0],
            dueDate: newTaskDueDate || new Date().toISOString().split("T")[0],
            priority: newTaskPriority,
            isCompleted: false,
            category: newTaskCategory,
            position: newPosition,
        };
        const saved = localStorage.getItem("corners");
        let parsed = saved ? JSON.parse(saved) : [];
        parsed = parsed.map((corner: Corner) =>
            corner.id.toString() === newTaskCorner
                ? { ...corner, tasks: [...corner.tasks, newTask] }
                : corner
        );
        localStorage.setItem("corners", JSON.stringify(parsed));

        const newNode: Node<TaskNodeData> = {
            id: newTask.id.toString(),
            type: "custom",
            data: {
                title: newTaskTitle,
                status: "Todo",
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
        setNewTaskTitle("");
        setNewTaskDueDate("");
        setNewTaskPriority("Medium");
        setNewTaskCategory("Other");
        setNewTaskCorner("");
    };

    const updateCategoryColor = (category: string, color: string) => {
        setCategoryColors((prev) => ({ ...prev, [category]: color }));
    };

    const addCategory = () => {
        if (newCategory && !categoryColors[newCategory] && newCategory.toLowerCase() !== "other") {
            updateCategoryColor(newCategory, newCategoryColor);
            setNewCategory("");
            setNewCategoryColor("#000000");
            // Remover esta parte:
            // setCategoryOptions((prev) => [
            //     ...prev.filter((opt) => opt.value.toLowerCase() !== "other"),
            //     { value: newCategory, label: newCategory },
            //     { value: "Other", label: "Other" },
            // ]);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (isNavbarOpen) setIsNavbarOpen(false);
    };

    const categoryOptions = useMemo(() => {
        return Object.keys(categoryColors)
            .map((category) => ({ value: category, label: category }))
            .sort((a, b) => (a.value.toLowerCase() === "other" ? 1 : b.value.toLowerCase() === "other" ? -1 : 0));
    }, [categoryColors]);

    const priorityOptions = [
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" },
    ];

    const cornerOptions = corners.map((corner) => ({
        value: corner.id.toString(),
        label: corner.title,
    }));

    const removeCategory = (categoryToRemove: string) => {
        if (categoryToRemove.toLowerCase() === "other") return;
    
        const updatedCategoryColors = { ...categoryColors };
        delete updatedCategoryColors[categoryToRemove];
        setCategoryColors(updatedCategoryColors);
        localStorage.setItem("categoryColors", JSON.stringify(updatedCategoryColors));
    
        // setCategoryOptions((prev) =>
        //     prev
        //         .filter((opt) => opt.value !== categoryToRemove)
        //         .filter((opt) => opt.value.toLowerCase() !== "other")
        //         .concat({ value: "Other", label: "Other" })
        // );
    
        const updatedNodes = nodes.map((node) => {
            if (node.data.category === categoryToRemove) {
                return {
                    ...node,
                    data: { ...node.data, category: "Other" },
                };
            }
            return node;
        });
        setNodes(updatedNodes);
    
        const savedCorners = localStorage.getItem("corners");
        if (savedCorners) {
            const parsed = JSON.parse(savedCorners);
            const updatedCorners = parsed.map((corner: Corner) => ({
                ...corner,
                tasks: corner.tasks.map((task: Task) =>
                    task.category === categoryToRemove
                        ? { ...task, category: "Other" }
                        : task
                ),
            }));
            localStorage.setItem("corners", JSON.stringify(updatedCorners));
        }
    };

    return (
        <div className={`flex flex-col min-h-screen ${theme === "light" ? "bg-gray-100" : "bg-slate-900"}`}>
            <TrackingNav themeButton={true}/>
            <main className="flex-1 py-12">
                <Container>
                    <div className="max-w-screen-4xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-6 mt-20">
                            <button
                                onClick={toggleSidebar}
                                className={`lg:hidden p-2 rounded-md text-white mb-4 ${isSidebarOpen ? "block bg-fuchsia-600" : "block bg-fuchsia-900"} transition-colors`}
                            >
                                <IoMdMenu size={20} />
                            </button>
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`w-full lg:w-80 h-[calc(100vh-200px)] p-4 rounded-lg ${theme === "light" ? "bg-white" : "bg-slate-700"} shadow-md overflow-y-auto ${isSidebarOpen ? "block" : "hidden lg:block"}`}
                            >
                                <div className="mb-6">
                                    <h2 className={`text-lg font-semibold mb-2 ${theme === "light" ? "text-gray-900" : "text-neutral-200"}`}>
                                        Add New Task
                                    </h2>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            placeholder="Task title"
                                            className={`w-full px-3 py-1.5 rounded-md text-sm ${theme === "light" ? "bg-white text-gray-900 border border-gray-300" : "bg-slate-600 text-neutral-200 border border-slate-500"} focus:outline-none focus:ring-2 focus:ring-fuchsia-700`}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={newTaskDueDate}
                                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                                className={`w-full px-3 py-1.5 rounded-md text-sm ${theme === "light" ? "bg-white text-gray-900 border border-gray-300" : "bg-slate-600 text-neutral-200 border border-slate-500"} focus:outline-none focus:ring-2 focus:ring-fuchsia-700`}
                                            />
                                            <IoMdCalendar size={20} className="text-fuchsia-600 mt-2" />
                                        </div>
                                        <CustomDropdown
                                            options={priorityOptions}
                                            value={newTaskPriority}
                                            onChange={(value) => setNewTaskPriority(value as TaskNodeData["priority"])}
                                            placeholder="Select Priority"
                                        />
                                        <CustomDropdown
                                            options={categoryOptions}
                                            value={newTaskCategory}
                                            onChange={(value) => setNewTaskCategory(value)}
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
                                    <h2 className={`text-lg font-semibold mb-2 ${theme === "light" ? "text-gray-900" : "text-neutral-200"}`}>
                                        Corners
                                    </h2>
                                    <ul className="space-y-2">
                                        {corners.slice(0, showAllCorners ? undefined : 3).map((corner) => {
                                            const taskCount = nodes.filter((node) => node.data.cornerId === corner.id.toString()).length;
                                            return (
                                                <li key={corner.id} className={`p-2 rounded-md ${theme === "light" ? "bg-gray-50" : "bg-slate-800"}`}>
                                                    <span className={`text-sm font-medium ${theme === "light" ? "text-gray-900" : "text-neutral-200"}`}>
                                                        {corner.title} ({taskCount} tasks)
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {corners.length > 3 && (
                                        <button
                                            onClick={() => setShowAllCorners(!showAllCorners)}
                                            className={`mt-2 text-sm ${theme === "light" ? "text-fuchsia-600" : "text-fuchsia-400"} hover:underline`}
                                        >
                                            {showAllCorners ? "Show Less" : "Show More"}
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h2 className={`text-lg font-semibold mb-1 ${theme === "light" ? "text-gray-900" : "text-neutral-200"}`}>
                                        Spaces
                                    </h2>
                                    <div className="flex flex-col gap-3">
                                        {Object.entries(categoryColors)
                                            .filter(([category]) => category.toLowerCase() !== "other")
                                            .map(([category, color]) => (
                                                <div
                                                    key={category}
                                                    className={`flex items-center justify-between gap-2 rounded-md p-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-slate-600"} transition-all duration-150`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={color}
                                                            onChange={(e) => updateCategoryColor(category, e.target.value)}
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
                                                                appearance: "none",
                                                                backgroundColor: color,
                                                                border: "1px solid",
                                                                borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
                                                                padding: 0,
                                                                margin: 0,
                                                            }}
                                                        />
                                                        <span
                                                            className={`text-sm font-medium ${theme === "light" ? "text-gray-900" : "text-neutral-200"} cursor-pointer hover:underline`}
                                                            onClick={() => {
                                                                const node = nodes.find((n) => n.data.category === category);
                                                                if (node) {
                                                                    setViewport(
                                                                        { x: -node.position.x + 300, y: -node.position.y + 300, zoom: 1 },
                                                                        { duration: 500 }
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {category}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeCategory(category)}
                                                        className={`p-1 rounded-full ${theme === "light" ? "text-gray-500 hover:bg-gray-200" : "text-neutral-400 hover:bg-slate-500"} transition-all duration-150`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        {Object.keys(categoryColors).some((key) => key.toLowerCase() === "other") && (
                                            <div
                                                key="other"
                                                className={`flex items-center justify-between gap-2 rounded-md p-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-slate-600"} transition-all duration-150`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={categoryColors["Other"] || categoryColors["other"]}
                                                        onChange={(e) => updateCategoryColor("Other", e.target.value)}
                                                        onClick={() => {
                                                            const node = nodes.find((n) => n.data.category === "Other" || n.data.category === "other");
                                                            if (node) {
                                                                setViewport(
                                                                    { x: -node.position.x + 300, y: -node.position.y + 300, zoom: 1 },
                                                                    { duration: 500 }
                                                                );
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded cursor-pointer"
                                                        style={{
                                                            appearance: "none",
                                                            backgroundColor: categoryColors["Other"] || categoryColors["other"],
                                                            border: "1px solid",
                                                            borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
                                                            padding: 0,
                                                            margin: 0,
                                                        }}
                                                    />
                                                    <span
                                                        className={`text-sm font-medium ${theme === "light" ? "text-gray-900" : "text-neutral-200"} cursor-pointer hover:underline`}
                                                        onClick={() => {
                                                            const node = nodes.find((n) => n.data.category === "Other" || n.data.category === "other");
                                                            if (node) {
                                                                setViewport(
                                                                    { x: -node.position.x + 300, y: -node.position.y + 300, zoom: 1 },
                                                                    { duration: 500 }
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Other
                                                    </span>
                                                </div>
                                                <button
                                                    disabled
                                                    className={`p-1 rounded-full ${theme === "light" ? "text-gray-300" : "text-neutral-600"} cursor-not-allowed`}
                                                    title="Cannot delete the default category"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2 text-neutral-500"> <hr /></div>
                                    <div className="flex flex-col justify-start  gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="Add space"
                                            className={`p-1 rounded-md border text-sm ${theme === "light" ? "bg-gray-50 text-gray-900 border-gray-300" : "bg-slate-700 text-gray-200 border-slate-600"} focus:outline-none focus:ring-2 focus:ring-neutral-800 transition-all duration-200`}
                                        />
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={newCategoryColor}
                                                onChange={(e) => setNewCategoryColor(e.target.value)}
                                                className={`w-6 h-7 rounded-md cursor-pointer border-1 ${theme == "light" ? "border-gray-300" : "border-slate-600"}`}
                                                style={{ padding: 0, margin: 0 }}
                                            />
                                            <button
                                                onClick={addCategory}
                                                className={`px-2 flex gap-1  py-1 items-center rounded-lg text-sm font-medium ${theme === "light" ? "bg-neutral-950 text-white hover:bg-black" : "bg-neutral-950 text-white hover:bg-black"} transition-all duration-200 shadow-md hover:shadow-lg`}
                                            >
                                                add <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/*
                                 */}
                            </motion.div>
                            <div className="flex w-full h-[calc(100vh-200px)] rounded-lg overflow-hidden shadow-md z-0">
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
                                    className={`${theme === "light" ? "bg-gray-50" : "bg-slate-800"}`}
                                >
                                    <Background
                                        gap={20}
                                        size={2}
                                        color={theme === "light" ? "#d1d5db" : "#4b5563"}
                                    />
                                    <Controls style={{ background: theme === "light" ? "#f1f1f1" : "#26304A" }} />
                                    <MiniMap
                                        nodeColor={(node) =>
                                            node.data.status === "Done"
                                                ? theme === "light"
                                                    ? "#a855f7"
                                                    : "#7e22ce"
                                                : theme === "light"
                                                    ? "#d1d5db"
                                                    : "#4b5563"
                                        }
                                        className={`rounded-lg ${theme === "light" ? "bg-gray-100" : "bg-slate-700"} w-36 h-28 md:w-44 md:h-32 lg:w-52 lg:h-36`}
                                        maskColor="transparent"
                                        style={{ background: theme === "light" ? "#f1f1f1" : "#26304A" }}
                                    />
                                </ReactFlow>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mt-6 p-4 rounded-lg ${theme === "light" ? "bg-white" : "bg-slate-700"} shadow-md`}
                        >
                            <h2 className={`text-lg font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-neutral-200"}`}>
                                Spaces Progress
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {progress.map(({ category, total, completed, percentage }) => (
                                    <div key={category} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium ${theme === "light" ? "text-gray-900" : "text-neutral-200"}`}>
                                                {category}
                                            </span>
                                            <span className={`text-sm ${theme === "light" ? "text-gray-600" : "text-neutral-400"}`}>
                                                {percentage}% ({completed}/{total})
                                            </span>
                                        </div>
                                        <div className={`w-full ${theme === "light" ? "bg-gray-200" : "bg-slate-600"} rounded-full h-2.5`}>
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%`, backgroundColor: categoryColors[category] || "#6b7280" }}
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