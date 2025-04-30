'use client';

import { useState } from 'react';
import { footer } from 'framer-motion/client';
import Container from '../components/Container';
import { useTheme } from '../themeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdCheckmark, IoMdAdd, IoMdArrowDown, IoMdArrowUp } from 'react-icons/io';
// import { v4 as uuidv4 } from 'uuid';
import LandingFooter from '../components/footers/LandingFooter';

type Task = {
    id: string;
    title: string;
    status: 'Todo' | 'Done';
    parentId: string | null;
};

const mockTasks: Task[] = [
    { id: '1', title: 'Get out of bed', status: 'Done', parentId: null },
    { id: '2', title: 'Write blog post', status: 'Todo', parentId: null },
    { id: '3', title: 'Draft outline', status: 'Todo', parentId: '2' },
    { id: '4', title: 'Write intro', status: 'Todo', parentId: '2' },
    { id: '5', title: 'Attend meeting', status: 'Todo', parentId: null },
    { id: '6', title: 'Prepare notes', status: 'Done', parentId: '5' },
    { id: '7', title: 'Join Zoom', status: 'Todo', parentId: '5' },
];

export default function TrackingPage() {
    const { theme } = useTheme();
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [newId, setNewId] = useState('')
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask: Task = {
            //   id: uuidv4(),
            id: newId,
            title: newTaskTitle,
            status: 'Todo',
            parentId: selectedParentId,
        };
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
        setSelectedParentId(null);
    };

    const toggleStatus = (id: string) => {
        setTasks(
            tasks.map((task) =>
                task.id === id
                    ? { ...task, status: task.status === 'Todo' ? 'Done' : 'Todo' }
                    : task
            )
        );
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedTasks(newExpanded);
    };

    const renderTask = (task: Task, level: number = 0) => {
        const subtasks = tasks.filter((t) => t.parentId === task.id);
        const isExpanded = expandedTasks.has(task.id);

        return (
            <div key={task.id} className={`ml-${level * 4}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-4 mb-2 rounded-lg shadow-md flex items-center justify-between ${theme === 'light'
                            ? 'bg-white border border-fuchsia-200'
                            : 'bg-slate-700 border border-fuchsia-600'
                        } hover:scale-105 transition-transform`}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => toggleStatus(task.id)}
                            className={`p-1 rounded-full ${task.status === 'Done'
                                    ? 'bg-fuchsia-600 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                        >
                            <IoMdCheckmark size={16} />
                        </button>
                        <span
                            className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                } ${task.status === 'Done' ? 'line-through' : ''}`}
                        >
                            {task.title}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {subtasks.length > 0 && (
                            <button
                                onClick={() => toggleExpand(task.id)}
                                className={`p-1 rounded-md ${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                                    }`}
                            >
                                {isExpanded ? <IoMdArrowUp size={16} /> : <IoMdArrowDown size={16} />}
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedParentId(task.id)}
                            className={`p-1 rounded-md ${theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                                } hover:text-fuchsia-600`}
                        >
                            <IoMdAdd size={16} />
                        </button>
                    </div>
                </motion.div>
                <AnimatePresence>
                    {isExpanded && subtasks.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {subtasks.map((subtask) => renderTask(subtask, level + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div
            className={`flex flex-col min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-900'
                }`}
        >
            {/* <Header /> */}
            <main className="flex-1 py-12">
                <Container>
                    <div className="max-w-screen-xl mx-auto">
                        <h1
                            className={`text-3xl sm:text-4xl font-bold mb-8 text-center ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                }`}
                        >
                            Progress Tracking
                        </h1>
                        {/* Add Task Form */}
                        <div
                            className={`mb-8 p-6 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-700'
                                } shadow-md`}
                        >
                            <h2
                                className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'
                                    }`}
                            >
                                Add New Task
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Task title (e.g., Write blog post)"
                                    className={`flex-1 px-4 py-2 rounded-md text-sm ${theme === 'light'
                                            ? 'bg-white text-gray-900 border border-gray-300'
                                            : 'bg-slate-600 text-neutral-200 border border-slate-500'
                                        } focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
                                />
                                <select
                                    value={selectedParentId || ''}
                                    onChange={(e) =>
                                        setSelectedParentId(e.target.value || null)
                                    }
                                    className={`px-4 py-2 rounded-md text-sm ${theme === 'light'
                                            ? 'bg-white text-gray-900 border border-gray-300'
                                            : 'bg-slate-600 text-neutral-200 border border-slate-500'
                                        } focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
                                >
                                    <option value="">No Parent (Root Task)</option>
                                    {tasks.map((task) => (
                                        <option key={task.id} value={task.id}>
                                            {task.title}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={addTask}
                                    className="px-4 py-2 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
                                >
                                    Add Task
                                </button>
                            </div>
                        </div>
                        {/* Task List */}
                        <div>
                            {tasks
                                .filter((task) => task.parentId === null)
                                .map((task) => renderTask(task))}
                        </div>
                    </div>
                </Container>
            </main>
            <LandingFooter />
        </div>
    );
}