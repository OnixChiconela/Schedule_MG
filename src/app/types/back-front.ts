
export type User = {
    id: string
    email: string
    firstName: string
    lastName: string
    role: "OWNER" | "ADMIN" | "COLABORATOR" | "GUEST";
    createdAt: string
    updatedAt: string

    visualType: "emoji" | "initial" | undefined
    visualValue: string
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