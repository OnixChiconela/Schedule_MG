"use client"
import { createContext, useContext, useEffect, useState } from "react"

type Location = {
    latitude: number; 
    longitude: number
} | null

const LocationContext = createContext<Location | undefined>(undefined)

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
    const [location,setLocation] = useState<Location>(null)

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    })
                },
                (err) => {
                    console.log("Error location fail")
                }
            )
        }
    }, [])

    return (
        <LocationContext.Provider value={location}>
            {children}
        </LocationContext.Provider>
    )
}

export const useLocation = () => {
    const ctx = useContext(LocationContext)
    if (ctx === undefined) throw new Error("useLocation must be with LocationProvider")
    return ctx
}