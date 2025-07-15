"use client"

import { Check, Plus } from "lucide-react"
import ClientOnly from "../components/ClientOnly"
import Container from "../components/Container"
import LandingNavbar from "../components/navbars/LandingNavbar"
import { useUser } from "../context/UserContext"
import { useTheme } from "../themeContext"
import { useEffect, useState } from "react"
import { getPlans } from "../api/actions/plans/getPlans"
import toast from "react-hot-toast"
import { Plan } from "../types/back-front"
import { handleSubscribeWithPaypal } from "../api/actions/paypal/handleSubscribeWithPaypal"

const PricingPage = () => {
    const { theme } = useTheme()
    const { currentUser } = useUser()
    const [plans, setPlans] = useState<Plan[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await getPlans()
                setPlans(res)
            } catch (error) {
                toast.error("Cannot get plans. Try again!")
            }
        }
        fetchPlans()
    }, [plans])

    const handleSubscribe = async (planId: string) => {
        setIsLoading(true)
        const loadingToast = toast.loading("Redirecting to PayPal...")

        try {
            // Show modal instead of calling API
            // setIsModalOpen(true)

            const { approvalUrl /* subscriptionId*/ } = await handleSubscribeWithPaypal(currentUser?.id as string, planId)
            if (approvalUrl) {
                window.location.href = approvalUrl
            } else {
                toast.error("Failed to initiate subscription")
            }

        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            toast.dismiss(loadingToast)
            setIsLoading(false)
        }
    }



    return (
        <ClientOnly>
            <div className={`${theme === "light" ? "bg-white" : "bg-slate-800"} transition-colors duration-300 h-full flex flex-col pb-5`}>
                <LandingNavbar />
                <Container>
                    <div className="flex flex-col gap-16">
                        <section id="header" className="pt-28">
                            <div>
                                <div className="flex flex-col space-y-8">
                                    <h2 className={`text-4xl leading-relaxed font-bold ${theme === "light" ? "text-gray-900" : "text-gray-200"}`}>
                                        {`You can always start for free. What matters is the progress.`}
                                    </h2>
                                    <p className={`text-xl leading-relaxed ${theme === "light" ? "text-gray-800" : "text-gray-300"}`}>
                                        {`Whether you're here to chat, host meetings, organize your personal space, or simply explore, you can start without spending a cent.`}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section id="body">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {plans && plans.map(plan => (
                                    <div
                                        key={plan.id}
                                        className={`p-5 border gap-8 flex flex-col rounded-md ${theme === 'light' ? 'border-gray-300' : 'border-slate-600'}`}
                                    >
                                        <div id="card-header" className="flex flex-col">
                                            <h3 className={`text-2xl ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-100'}`}>
                                                {plan.name}
                                            </h3>
                                            <span className={`text-xl ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-200'}`}>
                                                ${plan.price}/{plan.price === 0 ? 'month' : 'month'}
                                            </span>
                                        </div>
                                        <div id="description">
                                            <div className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-neutral-300'}`}>
                                                {plan.description}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={isLoading || (currentUser?.planType === plan.name)}
                                            className={`w-full py-2 items-center rounded-full text-white ${isLoading ? 'bg-gray-500' : 'bg-fuchsia-700 hover:bg-fuchsia-800'}`}
                                        >
                                            {currentUser?.planType === plan.name ? 'Current Plan' : plan.price === 0 ? 'To the action' : 'Subscribe'}
                                        </button>
                                        <div id="features">
                                            <ul className={`${theme === 'light' ? 'text-gray-700' : 'text-neutral-300'} text-sm font-extralight flex flex-col space-y-3`}>
                                                {plan.responseLimit && (
                                                    <li className="flex gap-2 items-center">
                                                        <Check size={15} color="green" />
                                                        {Number(plan.responseLimit) >= 99999
                                                            ? 'Unlimited responses'
                                                            : `${plan.responseLimit} responses per day`}
                                                    </li>
                                                )}
                                                {plan.charLimit && (
                                                    <li className="flex gap-2 items-center">
                                                        <Check size={15} color="green" />
                                                        {plan.charLimit === null ? 'Unlimited character output' : `${plan.charLimit} character output limit`}
                                                    </li>
                                                )}
                                                {plan.features?.hearsAudio && (
                                                    <li className="flex gap-2 items-center">
                                                        <Check size={15} color="green" />
                                                        Hears your audio {plan.name === 'Pro' && <div className="p-[2px] text-xs rounded-full text-white bg-red-500">coming soon</div>}
                                                    </li>
                                                )}
                                                <li className="flex gap-2 items-center">
                                                    <Check size={15} color="green" />
                                                    Reply {plan.contextWindow ? `a ${plan.contextWindow} message context window` : 'a wider context window'}
                                                </li>
                                                {plan.features?.summarizeChats && (
                                                    <li className="flex gap-2 items-center">
                                                        <Check size={15} color="green" />
                                                        Summarize chats ({plan.features.summarizeChats})
                                                    </li>
                                                )}
                                                <li className="flex gap-2 items-center">
                                                    <Check size={15} color="green" />
                                                    {plan.partnershipLimit} partnership{plan.partnershipLimit !== 1 ? 's' : ''}
                                                </li>
                                                <li className="flex gap-2 items-center">
                                                    <Check size={15} color="green" />
                                                    {plan.collaboratorLimit} collaborators in your partnership
                                                </li>
                                                {plan.features?.telepathy && (
                                                    <li className="flex gap-2 items-center">
                                                        <Check size={15} color="green" />
                                                        Telepathy in your call AI modal (for allowed users)
                                                    </li>
                                                )}
                                                {plan.features?.recordAudio && (
                                                    <li className="flex gap-2 items-center">
                                                        <Check size={15} color="green" />
                                                        Record and download meeting audios (yours or from others)
                                                    </li>
                                                )}
                                                {plan.name === 'Pro' && (
                                                    <li className="flex gap-2 items-center">
                                                        <Plus size={15} color="purple" />
                                                        Everything in Free plan
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </Container>

                {/* Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        style={{
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                        }}
                    >
                        <div className={`p-6 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-700'} max-w-md w-full`}>
                            <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
                                Payments are not yet active
                            </h3>
                            <p className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} mb-6`}>
                                We are finalizing the payment integration. Contact us for more information!
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className={`py-2 px-4 rounded-full ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-600 text-gray-200'}`}
                                >
                                    Close
                                </button>
                                <a
                                    href="mailto:josechiconela@icloud.com"
                                    className="py-2 px-4 bg-fuchsia-700 hover:bg-fuchsia-800 rounded-full text-white"
                                >
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientOnly>
    )
}

export default PricingPage