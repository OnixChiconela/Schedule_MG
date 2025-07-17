"use client"
import { useEffect } from "react"
import EmptyState from "./components/errors/EmptyState"
import toast from "react-hot-toast"

interface ErrorStateProps {
    error: Error
}

const ErrorState: React.FC<ErrorStateProps> = ({
    error
}) => {
    useEffect(() => {
        toast.error(error.message)
        console.error(error)
    }, [])

    return (
        <div className="pt-28">
            <EmptyState />
        </div>
    )
}

export default ErrorState