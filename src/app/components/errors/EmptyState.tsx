"use client"

import Heading from "../Heading"

interface EmptyState {
    title?: string
    subtitle?: string
    dashboard?: boolean
    reload?: boolean
}

const EmptyState: React.FC<EmptyState> = ({
    title = "Uh oh",
    subtitle = "Something went wrong. Try again!",
    dashboard,
    reload
}) => {
    return (
        <div className="
            h-[60vh]
            flex
            flex-col
            gap-2
            justify-center
            items-center
        ">
            <Heading
                center
                title={title}
                subtitle={subtitle}
            />
            <div className="w-48 mt-4">

            </div>
        </div>
    )
}

export default EmptyState