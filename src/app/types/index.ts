export type TaskNodeData = {
    title: string;
    status: 'Todo' | 'Done';
    createdDate: string;
    dueDate?: string;
    priority: 'Low' | 'Medium' | 'High';
    category: 'Work' | 'Personal' | 'Study' | 'Other';
    cornerId?: string;
};

export type Corner = {
    id: string;
    title: string;
};

export type CategoryColors = Record<TaskNodeData['category'], string>;