export type Users = {
    id: string
    email: string
    image?: string
    firstName: string
    lastName: string
    role: string

    createdAt: Date
    updatedAt: string

    visualType: "emoji" | "initial" | undefined
    visualValue: string
}

export type TaskNodeData = {
    title: string;
    status: 'Todo' | 'Done';
    createdDate: string;
    dueDate?: string;
    priority: 'Low' | 'Medium' | 'High';
    category: string;
    cornerId?: string;
    position?: { x: number; y: number }; // Added for node position
};

export type Corner = {
    id: string;
    title: string;
};

export type CategoryColors = Record<TaskNodeData['category'], string>;