
export type User = {
    id: string
    email: string
    firstName: string
    lastName: string
    role: "OWNER" | "ADMIN" | "COLLABORATOR" | "GUEST";
    createdAt: string
    updatedAt: string

    visualType?: "emoji" | "initial"
    visualValue?: string
    planType: "FREE" | "PRO"
    subscriptions?: Array<{
        id: string
        planId: string
        status: "ACTIVE" | "PENDING" | "CANCELLED"
        startDate: string
        endDate?: string | null
    }>
}

export type PartnershipMembers = {
    id: string
    partnershipId: string
    userId: string
    status: string
    invitedAt: string
    acceptedAt: string
    role: string
    user: User
}

export type Plan = {
    id: string
    paypalPlanId?: string
    name: string
    description?: string
    price: number,
    currency: string
    responseLimit?: string
    charLimit?: string
    partnershipLimit?: number
    collaboratorLimit?: string
    contextWindow?: string
    features?: {
        hearsAudio?: boolean
        summarizeChats?: 'limited' | 'unlimited'
        telepathy?: boolean
        [key: string]: any
    }

    createdAt: Date
    updatedAt: Date
}