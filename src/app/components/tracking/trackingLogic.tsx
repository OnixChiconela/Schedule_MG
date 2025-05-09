"use client"

import { Corner, Task } from "@/app/tasks/page";
import { useTheme } from "@/app/themeContext";
import { CategoryColors, TaskNodeData } from "@/app/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
    addEdge,
    Node,
    Edge,
    Connection,
    NodeChange,
    NodeProps,
    useNodesState,
    useEdgesState,
    useReactFlow,
} from "reactflow";
import TaskNodeComponent from "../roadmap/TaskNodeComponent";

type RawEdge = {
    id?: string;
    source?: string;
    target?: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    style?: React.CSSProperties;
};

export const defaultCategoryColors: CategoryColors = {
    Work: "#3b82f6",
    Personal: "#22c55e",
    Study: "#f59e0b",
    Other: "#6b7280",
};

export const useTrackingLogic = () => {
    const { theme } = useTheme()
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
            // Atualizar categoryOptions dinamicamente
            setCategoryOptions((prev) => [
                ...prev.filter((opt) => opt.value.toLowerCase() !== "other"),
                { value: newCategory, label: newCategory },
                { value: "Other", label: "Other" },
            ]);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (isNavbarOpen) setIsNavbarOpen(false);
    };

    const [categoryOptions, setCategoryOptions] = useState([
        { value: "Work", label: "Work" },
        { value: "Personal", label: "Personal" },
        { value: "Study", label: "Study" },
        { value: "Other", label: "Other" },
    ]);

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
    
        setCategoryOptions((prev) =>
            prev
                .filter((opt) => opt.value !== categoryToRemove)
                .filter((opt) => opt.value.toLowerCase() !== "other")
                .concat({ value: "Other", label: "Other" })
        );
    
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
return {
    corners,
    nodes,
    edges,
    newTaskTitle,
    newTaskDueDate,
    newTaskPriority,
    newTaskCategory,
    newTaskCorner,
    categoryColors,
    showAllCorners,
    isSidebarOpen,
    isNavbarOpen,
    newCategory,
    newCategoryColor,
    categoryOptions,
    priorityOptions,
    cornerOptions,
    setCorners,
    setNodes,
    setEdges,
    setNewTaskTitle,
    setNewTaskDueDate,
    setNewTaskPriority,
    setNewTaskCategory,
    setNewTaskCorner,
    setCategoryColors,
    setShowAllCorners,
    setIsSidebarOpen,
    setIsNavbarOpen,
    setNewCategory,
    setNewCategoryColor,
    setCategoryOptions,
    onNodesChange,
    progress,
    nodeTypes,
    onConnect,
    onEdgeClick,
    onEdgeDoubleClick,
    onEdgesChange,
    addTask,
    updateCategoryColor,
    addCategory,
    removeCategory,
    toggleSidebar,
    handleNodesChange,
};
};