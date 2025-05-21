'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { IoMdArrowForward } from 'react-icons/io'
import { FaCalendarAlt, FaChartLine, FaClock, FaMagic } from 'react-icons/fa'
import { MdBusinessCenter, MdChecklist, MdLightbulbOutline, MdPeople, MdTrendingUp } from 'react-icons/md'
import { BiGlobe } from 'react-icons/bi'
import Container from './components/Container'
import { useTheme } from './themeContext'
import ClientOnly from './components/ClientOnly'
import Card from './components/cards/Card'
import InfoCard from './components/cards/CardInfo'
import LandingNavbar from './components/navbars/LandingNavbar'
import LandingFooter from './components/footers/LandingFooter'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LandingPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const router = useRouter()

  const handleRegisterClose = () => setIsRegisterOpen(false)
  const { theme } = useTheme()

  const getStart = () => {
    if (!localStorage.getItem("userPreferences")) return router.push("/onboarding")
    router.push("/dashboard")
  }

  return (
    <ClientOnly>
      {/* <ThemeProvider> */}
      <div className={`flex flex-col items-center ${theme == "light" ? "bg-white" : "bg-slate-800"} transition-colors duration-300`}>
        <LandingNavbar />
        {/* Hero Section */}
        <section id="landing" className={`pt-16 pb-16 relative overflow-hidden justify-center`}>
          <div>
            <div className="max-w-screen-xl mx-auto">
              <Container>
                <div className="flex flex-col justify-center ">
                  <div className="flex flex-col md:flex-row gap-8 pt-24 md:pt-24">
                    <div className={`flex p-8 shadow-lg hover:shadow-fuchsia-700/80
                      shadow-fuchsia-900/70 bg-clip-border bg-gradient-to-b
                        py-24 rounded-3xl  ${theme == "light" ? "" : "bg-slate-950/50"} transition`}
                    >
                      <Container>
                        <div className="flex flex-col ">
                          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center  ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`}>
                            {`Design your path`}
                            <br />
                            <span
                              style={{
                                backgroundImage: 'linear-gradient(to right, #d946ef, #701a75)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                              className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-900 text-transparent"
                            >                              {`Shape your life`}
                            </span>
                          </h1>
                          <p className={`text-lg sm:text-xl max-w-2xl mb-8 text-center ${theme == "light" ? "text-gray-600" : "text-neutral-400/90"}`}>
                            {`Bring your goals, habits, and priorities together in one place, Scheuor helps you stay on track, and grow with intention`}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <div
                              onClick={() => getStart()}
                              className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-900 hover:gap-2 transition flex items-center justify-center cursor-pointer"
                            >
                              {`Get Started`} <IoMdArrowForward size={20} className="ml-2 hover:scale-120 transition" />
                            </div>
                            <a
                              href="mailto:josechiconela@icloud.com"
                              className={`text-sm font-semibold py-3 px-8 rounded-full border border-gray-300 hover:bg-gray-100 ${theme == "light" ? "text-gray-900" : "text-neutral-200 hover:text-gray-900"} transition`}
                            >
                              {`Talk to Us`}
                            </a>
                          </div>
                        </div>
                      </Container>
                    </div>
                  </div>
                </div>
              </Container>
            </div>
          </div>
        </section>

        {/* How Scheuor Can Help */}
        <section id="connect-with-us" className="relative overflow-hidden py-20 sm:py-32">
          <Container>
            <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">

              <div className="text-center mb-12">
                <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-neutral-200"} `}>{`How Scheuor Can Help`}</h2>
                <p className={`text-lg mt-4 ${theme == "light" ? "text-gray-600" : "text-neutral-300"}`}>{`Tools to boost your your clarity, focus, and progress`}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoCard
                  icon={MdTrendingUp}
                  title="Actionable Clarity"
                  content="Visualize your priorities clearly and take intentional steps toward your goals."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={BiGlobe}
                  title="Stay Aligned"
                  content="Organize tasks, routines, and reflections in one place to keep your day aligned with your purpose."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={MdPeople}
                  title="Build Habits That Sticks"
                  content="Track your progress and reinforce behaviors that move you forward, consistently."
                  iconColor="fuchsia"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="relative overflow-hidden py-20 sm:py-32">
          <Container>
            <div className="flex flex-col items-center max-w-screen-xl mx-auto">
              <div className="text-center mb-12">
                <h2 className={`mb-4 text-3xl font-bold text-center sm:text-4xl ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`} style={{
                  translate: "none", rotate: "none", scale: "none"
                }}>{`How It Works`}</h2>
                <p className={`text-lg leading-8 ${theme == "light" ? "text-gray-800" : "text-gray-300"} text-center`}>
                  {`Get started with Scheuor in simple steps`}
                </p>
              </div>
              {/* <div className="mt-16"> */}
              <div className="space-y-16 lg:space-y-20">

                <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded hover:scale-102 ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>
                  <div className="flex-none md:flex-1 lg:max-w-xl">
                    <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">
                      <Image
                        alt="calendar"
                        src={require("@/../public/images/mybss.png")}
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      ${theme == "light" ? "text-neutral-800" : "text-neutral-200"} rounded-xl`}>
                      {`1`}
                    </div>
                    <h3 className={`mb-4 text-2xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`Set Your Intentions`}</h3>
                    <p className={`text-lg leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      <a className='font-semibold'>{`Define what matters to you: `}</a>{`Start by adding your goals, projects, or areas of focus, this is your personal map.`}
                    </p>
                  </div>
                </div>
                <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded hover:scale-102 ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>

                  <div className="flex-1 text-center lg:text-left">
                    <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      ${theme == "light" ? "text-neutral-800" : "text-neutral-200"} rounded-xl`}>
                      {`2`}
                    </div>
                    <h3 className={`mb-4 text-2xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`Organize Your Space`}</h3>
                    <p className={`text-lg leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      <a className='font-semibold'>{`Create your flow: `}</a>{`Add tasks, notes, and reflections. Use visual boards and sections to structure your day your wasy`}
                    </p>
                  </div>
                  <div className="flex-1 lg:max-w-xl">
                    <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">
                      <Image
                        alt="calendar"
                        src={require("@/../public/images/calendar.png")}
                      />
                    </div>
                  </div>
                </div>
                <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded hover:scale-102 ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>
                  <div className="flex-none md:flex-1 lg:max-w-xl">
                    <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">
                      <Image
                        alt="calendar"
                        src={require("@/../public/images/road.png")}
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      ${theme == "light" ? "text-neutral-800" : "text-neutral-200"} rounded-xl`}>
                      {`3`}
                    </div>
                    <h3 className={`mb-4 text-2xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`Track & Grow`}</h3>
                    <p className={`text-lg leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      <a className='font-semibold'>{`Stay aligned and evolve: `}</a>{`Review progress, adjust priorities, and build habits that support your journey`}
                    </p>
                  </div>
                </div>
              </div>
              {/* </div> */}
            </div>
          </Container>
          <div className="h-3 md:h-5" />
        </section>



        {/* Why Scheuor */}
        <section id="why-scheuor" className={`py-16 ${theme == "light" ? "bg-neutral-50" : ""}`}>
          <Container>
            <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">

              <div className="text-center mb-12">
                <div className="inline-flex text-center rounded-full bg-fuchsia-100 px-4 py-2 text-sm font-semibold text-fuchsia-600 mb-6">
                  Why Choose Scheuor
                </div>
                <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-neutral-200"} `}>
                  Empower Your Journey with Scheuor
                </h2>
                <p className={`text-lg  ${theme == "light" ? "text-gray-600" : "text-neutral-300"} mt-4 max-w-2xl mx-auto`}>
                  Join a platform built to help you focus, organize, and grow - your way.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                <InfoCard
                  icon={MdTrendingUp}
                  title="Clarity that drives action"
                  content="Cut through the noise. Visualize your priorities and turn ideas into meaningful progress."
                  iconColor="fuchsia"
                  className='h-full'
                />
                <InfoCard
                  icon={FaClock}
                  title="Time, on your side"
                  content="Spend less time managing and more time creating. Scheuor helps you stay focused without friction."
                  iconColor="fuchsia"
                  className='h-full'
                />
                <InfoCard
                  icon={BiGlobe}
                  title="Grow with intention"
                  content="Track your habits, reflect on your journey, and make space for the things that matters most."
                  iconColor="fuchsia"
                  className='h-full'
                />
              </div>
              <div className="mt-12 text-center">
                <h3 className={`text-2xl font-bold ${theme == "light" ? "text-slate-800" : "text-neutral-200"} mb-4`}>Build Momentum, Your Way.</h3>
                <p className={`text-lg ${theme == "light" ? "text-slate-700" : "text-neutral-300"} mb-8`}>Start organizing with purpose, one step at a time.</p>
                <div className='flex justify-center'>
                  <Link
                    href="/onboarding"
                    className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition flex items-center justify-center mx-auto"
                  >
                    Get Started <IoMdArrowForward size={20} className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features */}
        <section id="features" className="py-16">
          <Container>
            <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">

              <div className="text-center mb-12">
                <h2 className={`text-3xl sm:text-4xl font-bold  ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`}>Tools That Keep You Moving.</h2>
                <p className={`text-lg  ${theme == "light" ? "text-gray-600" : "text-neutral-300"} mt-4 max-w-2xl mx-auto`}>
                  Stay in control, stay on track, stay growing.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoCard
                  icon={MdChecklist}
                  title="Smart Task Management"
                  content="Organize, prioritize, and track your tasks with clarity and ease."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={FaCalendarAlt}
                  title="Integrated Calendar"
                  content="Visualize your schedule and plan your days with confidence."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={MdLightbulbOutline}
                  title="Personalized Suggestions"
                  content="Get thoughtful insights based on your habits and priorities."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={MdBusinessCenter}
                  title="My Business"
                  content="Manage your personal and professional projects in one place."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={FaChartLine}
                  title="Progress Tracking"
                  content="Monitor your growth with visual metrics and reflection tools."
                  iconColor="fuchsia"
                  soon="coming soon"
                />
                <InfoCard
                  icon={FaMagic}
                  title="AI Assist"
                  content="Let smart automation help you stay focused and organized."
                  iconColor="fuchsia"
                  soon="coming soon"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className={`py-16 ${theme == "light" ? "" : ""}`}>
          <Container>
            <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">

              <div className="text-center mb-12">
                <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-slate-800" : "text-neutral-200"}`}>What Our Users Say</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <div className="p-6">
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      {`"Scheuor gave me the clarity I needed to finally stay on top of my tasks and goals."`}
                    </p>
                    <h4 className={`font-semibold mt-4 ${theme == "light" ? "text-black" : "text-white"}`}>{`— Maria, Freelancer`}</h4>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      {`"I use Scheuor every day to organize my week, it keeps me focused without feeling overwhelmed."`}
                    </p>
                    <h4 className={`font-semibold mt-4 ${theme == "light" ? "text-black" : "text-white"}`}>{`— John, Designer`}</h4>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      {`"The suggestions and clean interface help me reflect and stay intentional with my time."`}
                    </p>
                    <h4 className={`font-semibold mt-4 ${theme == "light" ? "text-black" : "text-white"}`}>{`— Ana, Creative`}</h4>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* Video Demo Section */}
        <section id="video-demo" className={`py-16 ${theme == "light" ? "" : "bg-slate-800/50"}`}>
          <Container>
            <div className="text-center mb-12">
              <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`}>
                See Scheuor in Action
                <br />
                <span className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-900 bg-clip-text text-transparent">
                  Watch Our Demo
                </span>
              </h2>
              <p className={`text-lg  ${theme == "light" ? "text-gray-600" : "text-neutral-300"} mt-4 max-w-2xl mx-auto`}>
                Discover how Scheuor helps you connect with your self while keeping everthing in control.
              </p>
            </div>
          </Container>


        </section>


        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto aspect-video">
            <video
              className="w-full h-full object-cover rounded-lg shadow-lg shadow-fuchsia-300"
              controls
              poster="/demo-poster.jpg"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="mt-8 text-center">
          <div className='flex justify-center'>
            <Link
              href="/onboarding"
              className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition flex items-center justify-center mx-auto"
            >
              Try Scheuor Now <IoMdArrowForward size={20} className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Final CTA */}
        <section id="final-cta" className="py-16 text-center">
          <Container>
            <h2 className={`text-3xl sm:text-4xl font-bold  ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`}>Join Scheuor Today!</h2>
            <p className={`text-lg mt-4 max-w-2xl mx-auto  ${theme == "light" ? "text-gray-600" : "text-neutral-300"}`}>
              Sign up now to become part of the crew.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className="text-sm font-semibold py-3 px-6 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
              >
                Get Started
              </Link>
              <a
                // href="mailto:contact@scheuor.com"
                href="mailto:josechiconela@icloud.com"
                className="text-sm font-semibold py-3 px-6 rounded-full border border-fuchsia-600 text-fuchsia-600 hover:bg-fuchsia-50 transition"
              >
                Contact Us
              </a>
            </div>
          </Container>
        </section>

        {/* Footer */}
        <LandingFooter />

        {/* Register Modal (Simplified) */}
        {isRegisterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign Up</h2>
              <p className="text-gray-600 mb-6">Start your journey with Scheuor!</p>
              <div className="flex gap-4">
                <Link
                  href="/onboarding"
                  className="flex-1 text-center text-sm font-semibold py-2 px-4 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
                >
                  Continue
                </Link>
                <button
                  onClick={handleRegisterClose}
                  className="flex-1 text-sm font-semibold py-2 px-4 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ClientOnly>
  )
}