'use client'

import MyBusinessTab from "../components/my-business/MyBusinessTab"

import TrackingNav from "../components/navbars/trackingNav"

export default function Business() {

    return (
        <>
            <main className={`h-screen w-full duration-300 relative`}>
            <TrackingNav
                themeButton={false}
            />
                <div className="pt-20">
                    <MyBusinessTab />
                </div>
            </main>
        </>
    )
}