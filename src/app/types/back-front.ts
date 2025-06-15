
export type User = {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    createdAt: string
    updatedAt: string

    visualType: "emoji" | "initial" | undefined
    visualValue: string
}