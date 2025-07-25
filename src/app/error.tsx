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
        const msg = error?.message || "";

        if (msg.includes("Loading chunk") || msg.includes("missing")) {
            toast.error("New version detected. Reloading...");
            // toast.error(error.message)
             sessionStorage.setItem("reload", "true");
            setTimeout(() => {
                window.location.href = "/"
            }, 1500);
        } else {
            toast.error(msg);
            console.error(error);
        }
    }, []);

    return (
        <div className="">
            <EmptyState />
        </div>
    )
}

export default ErrorState