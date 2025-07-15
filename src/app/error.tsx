"use client"
import { useEffect } from "react"
import EmptyState from "./components/errors/EmptyState"

interface ErrorStateProps {
    error: Error
}

const ErrorState: React.FC<ErrorStateProps> = ({
    error
}) => {
    useEffect(() => {
        console.error(error)
    }, [])

    return (
        <div className="pt-28">
            <EmptyState />
        </div>
    )
}

export default ErrorState