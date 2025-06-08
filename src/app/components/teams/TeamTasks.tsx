"use client"

import { useTheme } from "@/app/themeContext"
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format, parseISO } from "date-fns";
import { GripVertical, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import SortableTeamTask from "./SortableTeamTask";
import { motion } from "framer-motion"

export type TeamTask = {
    id: number;
    title: string;
    status: "To Do" | "In Progress" | "Done";
    createdDate: string;
    dueDate: string;
    priority: "Low" | "Medium" | "High";
    assignedTo: string; // Novo campo para responsável
    isCompleted: boolean;
    slot: string; // Novo campo para associar a um slot

};

const TeamTasks = () => {
    const { theme } = useTheme();
    const [tasks, setTasks] = useState<TeamTask[]>([
        {
            id: 1,
            title: "Plan Team Meeting",
            status: "To Do",
            createdDate: new Date().toISOString(),
            dueDate: new Date(2025, 5, 2).toISOString(), // Segunda, 2 de Jun
            priority: "Medium",
            assignedTo: "João",
            isCompleted: false,
            slot: "Segunda",
        },
        {
            id: 2,
            title: "Review Code",
            status: "In Progress",
            createdDate: new Date().toISOString(),
            dueDate: new Date(2025, 5, 3).toISOString(), // Terça, 3 de Jun
            priority: "High",
            assignedTo: "Maria",
            isCompleted: false,
            slot: "Terça",
        },
    ]);
    const [slots, setSlots] = useState<string[]>(["Segunda", "Terça"]); // Lista de slots
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<keyof TeamTask | null>(null);
    const [editValues, setEditValues] = useState<Partial<TeamTask>>({});
    const editValuesRef = useRef<Partial<TeamTask>>(editValues);
    const [activeTask, setActiveTask] = useState<TeamTask | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [filterMember, setFilterMember] = useState<string | null>(null);

    const teamMembers = ["João", "Maria", "Ana"];

    const startEditing = useCallback((taskId: number, field: keyof TeamTask, value: string) => {
        setEditingTaskId(taskId);
        setEditingField(field);
        setEditValues({ [field]: value });
        editValuesRef.current = { [field]: value };
    }, []);

    const handleEditChange = useCallback((field: keyof TeamTask, value: string) => {
        setEditValues((prev) => {
            const newValues = { ...prev, [field]: value };
            editValuesRef.current = newValues;
            return newValues;
        });
    }, []);

    const submitEdit = useCallback((taskId: number) => {
        const currentEditValues = editValuesRef.current;
        const updates: Partial<TeamTask> = {};
        if (currentEditValues.title && currentEditValues.title.trim()) {
            updates.title = currentEditValues.title.trim();
        }
        if (currentEditValues.status) {
            updates.status = currentEditValues.status as TeamTask["status"];
            updates.isCompleted = currentEditValues.status === "Done";
        }
        if (currentEditValues.dueDate) {
            updates.dueDate = currentEditValues.dueDate;
        }
        if (currentEditValues.priority) {
            updates.priority = currentEditValues.priority as TeamTask["priority"];
        }
        if (currentEditValues.assignedTo) {
            updates.assignedTo = currentEditValues.assignedTo;
        }
        if (currentEditValues.slot) {
            updates.slot = currentEditValues.slot;
        }

        if (Object.keys(updates).length > 0) {
            setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)));
        }

        setEditingTaskId(null);
        setEditingField(null);
        setEditValues({});
        editValuesRef.current = {};
    }, []);

    const handleDragStart = useCallback((event: any) => {
        const task = tasks.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    }, [tasks]);

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            setActiveTask(null);
            return;
        }

        const sourceIndex = tasks.findIndex((task) => task.id === active.id);
        const destinationIndex = tasks.findIndex((task) => task.id === over.id);
        const sourceSlot = tasks[sourceIndex].slot;
        const destinationSlot = tasks[destinationIndex].slot;

        if (sourceIndex !== destinationIndex && sourceSlot === destinationSlot) {
            const reorderedTasks = [...tasks];
            const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
            reorderedTasks.splice(destinationIndex, 0, movedTask);
            setTasks(reorderedTasks);
        } else if (sourceSlot !== destinationSlot) {
            // Permitir arrastar entre slots (opcional, ajustar lógica se necessário)
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === active.id ? { ...task, slot: destinationSlot } : task
                )
            );
        }
        setActiveTask(null);
    }, [tasks]);

    const handleNewTaskClick = (slot: string) => {
        const title = prompt("Enter task title:");
        if (title) {
            const newTask: TeamTask = {
                id: Date.now(),
                title: title.trim(),
                status: "To Do",
                createdDate: new Date().toISOString(),
                dueDate: new Date(2025, 5, 7).toISOString(),
                priority: "Medium",
                assignedTo: teamMembers[0],
                isCompleted: false,
                slot,
            };
            setTasks((prev) => [...prev, newTask]);
        }
    };

    const handleAddSlot = () => {
        const slotName = prompt("Enter slot name (e.g., Segunda, Terça):");
        if (slotName && !slots.includes(slotName)) {
            setSlots((prev) => [...prev, slotName]);
        }
    };

    const handleTaskToggle = (taskId: number, isCompleted: boolean) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? { ...task, isCompleted, status: isCompleted ? "Done" : task.status }
                    : task
            )
        );
    };

    const handleTaskDelete = (taskIds: number[]) => {
        setTasks((prev) => prev.filter((task) => !taskIds.includes(task.id)));
    };

    const filteredTasks = filterMember
        ? tasks.filter((task) => task.assignedTo === filterMember)
        : tasks;

    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);


    return (
        <div className={`w-full p-4 ${theme === "light" ? "bg-white" : "bg-slate-900"}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>Team Tasks</h2>
                <div className="flex gap-2">
                    <select
                        value={filterMember || ""}
                        onChange={(e) => setFilterMember(e.target.value || null)}
                        className={`px-3 py-1 rounded-xl ${theme === "light" ? "bg-gray-200 text-black" : "bg-slate-600 text-gray-200"}`}
                    >
                        <option value="">All Members</option>
                        {teamMembers.map((member) => (
                            <option key={member} value={member}>{member}</option>
                        ))}
                    </select>
                </div>
            </div>
            {slots.map((slot) => {
                const slotTasks = filteredTasks.filter((task) => task.slot === slot);
                return (
                    <div key={slot} className={`mb-4 rounded-2xl shadow-md p-4 ${theme === "light" ? "bg-white" : "bg-slate-700"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-bold ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>{slot}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleNewTaskClick(slot)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-xl transition ${theme === "light" ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-slate-600 text-gray-200 hover:bg-slate-500"}`}
                                >
                                    <Plus size={14} />
                                    New Task
                                </button>
                                <button
                                    onClick={() => setIsMenuOpen((prev) => !prev)}
                                    className={`p-1 rounded-full ${theme === "light" ? "text-gray-600 hover:bg-gray-200" : "text-gray-300 hover:bg-slate-500"} transition-all duration-150`}
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                                {isMenuOpen && (
                                    <motion.div
                                        ref={menuRef}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.75 }}
                                        transition={{ duration: 0.1 }}
                                        className={`absolute right-10 p-2 rounded-lg shadow-md ${theme === "light" ? "bg-white" : "bg-slate-700"} z-20`}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (selectedTasks.length > 0) {
                                                    handleTaskDelete(selectedTasks);
                                                    setSelectedTasks([]);
                                                    setIsMenuOpen(false);
                                                }
                                            }}
                                            disabled={selectedTasks.length === 0}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${selectedTasks.length === 0 ? "text-gray-400 cursor-not-allowed" : theme === "light" ? "text-red-600 hover:bg-gray-100" : "text-red-400 hover:bg-slate-600"}`}
                                        >
                                            <Trash2 size={14} />
                                            Remove
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <SortableContext items={slotTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                                <div className="overflow-x-auto relative z-10">
                                    <div className="min-w-[1200px]">
                                        {slotTasks.length === 0 ? (
                                            <div className={theme === "light" ? "text-gray-400" : "text-gray-500"}>No tasks yet.</div>
                                        ) : (
                                            <div className={`grid grid-cols-8 gap-2 text-sm font-semibold rounded-xl p-2 mb-2 ${theme === "light" ? "text-gray-600 bg-gray-50" : "text-gray-300 bg-slate-600"}`}>
                                                <div>Drag</div>
                                                <div>Completed</div>
                                                <div>Title</div>
                                                <div>Assigned To</div>
                                                <div>Status</div>
                                                <div>Created</div>
                                                <div>Due</div>
                                                <div>Priority</div>
                                            </div>
                                        )}
                                        {slotTasks.map((task) => (
                                            <div key={task.id} className="flex flex-col py-1 max-h-[60px]">
                                                <SortableTeamTask
                                                    task={task}
                                                    editingTaskId={editingTaskId}
                                                    editingField={editingField}
                                                    editValues={editValues}
                                                    startEditing={startEditing}
                                                    handleEditChange={handleEditChange}
                                                    submitEdit={submitEdit}
                                                    onTaskToggle={handleTaskToggle}
                                                    isMenuOpen={isMenuOpen}
                                                    selectedTasks={selectedTasks}
                                                    onTaskSelect={(taskId: number) =>
                                                        setSelectedTasks((prev) =>
                                                            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
                                                        )
                                                    }
                                                    teamMembers={teamMembers}
                                                    theme={theme}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                );
            })}
            <div className="mt-4">
                <button
                    onClick={handleAddSlot}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${theme === "light" ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-slate-600 text-gray-200 hover:bg-slate-500"}`}
                >
                    <Plus size={16} />
                    Add +
                </button>
            </div>
        </div>
    );
};

export default TeamTasks;