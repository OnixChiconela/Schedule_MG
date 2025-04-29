'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IoLogoLinkedin, IoLogoTwitter, IoMdArrowForward } from 'react-icons/io'
import { FaClock, FaRobot } from 'react-icons/fa'
import { MdPeople, MdSettings, MdTrendingUp } from 'react-icons/md'
import { BiGlobe, BiSpreadsheet, BiWorld } from 'react-icons/bi'
import Container from './components/Container'
import { useTheme } from './themeContext'
import ClientOnly from './components/ClientOnly'
import { MoonStar, Sun } from 'lucide-react'
import Card from './components/cards/Card'
import InfoCard from './components/cards/CardInfo'
import { HiMenu, HiX } from 'react-icons/hi'
import LandingNavbar from './components/LandingNavbar'


export default function LandingPage() {
  const router = useRouter()
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const handleRegisterOpen = () => setIsRegisterOpen(true)
  const handleRegisterClose = () => setIsRegisterOpen(false)
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <ClientOnly>
      {/* <ThemeProvider> */}
      <div className={`flex flex-col items-center ${theme == "light" ? "bg-white" : "bg-slate-800"} transition-colors duration-300`}>
        <LandingNavbar />
        {/* Hero Section */}
        <section id="landing" className={`pt-16 pb-16 relative overflow-hidden justify-center`}>
          <div className="">
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
                            Manage your destiny
                            <br />
                            <span className={`bg-gradient-to-r from-fuchsia-500 to-fuchsia-900 bg-clip-text text-transparent`}>
                              Engage Your Audience
                            </span>
                          </h1>
                          <p className={`text-lg sm:text-xl max-w-2xl mb-8 text-center ${theme == "light" ? "text-gray-600" : "text-neutral-400/90"}`}>
                            Join Scheuor to connect with your audience, gain actionable insights, and grow your business with ease.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                              href="/onboarding"
                              className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-900 hover:gap-2 transition flex items-center justify-center"
                            >
                              Get Started <IoMdArrowForward size={20} className="ml-2 hover:scale-120 transition" />
                            </Link>
                            <a
                              href="mailto:contact@scheuor.com"
                              className={`text-sm font-semibold py-3 px-8 rounded-full border border-gray-300 hover:bg-gray-100 ${theme == "light" ? "text-gray-900" : "text-neutral-200 hover:text-gray-900"} transition`}
                            >
                              Talk to Us
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
                <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-neutral-200"} `}>How Scheuor Can Help</h2>
                <p className={`text-lg mt-4 ${theme == "light" ? "text-gray-600" : "text-neutral-300"}`}>Tools to boost your engagement</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoCard
                  icon={MdTrendingUp}
                  title="Actionable Insights"
                  content="Gain insights to optimize your strategy and drive growth."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={BiGlobe}
                  title="Connect with Audiences"
                  content="Reach and engage with your target audience effectively."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={MdPeople}
                  title="Build Relationships"
                  content="Foster trust and loyalty through meaningful interactions."
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
                }}>How It Works</h2>
                <p className={`text-lg leading-8 ${theme == "light" ? "text-gray-800" : "text-gray-300"} text-center`}>
                  Get started with Scheuor in simple steps
                </p>
              </div>
              {/* <div className="mt-16"> */}
              <div className="space-y-16 lg:space-y-20">

                <div className="flex flex-col items-center gap-6 lg:gap-16 lg:flex-row">
                  <div className="flex-none md:flex-1 lg:max-w-xl">
                    <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">

                    </div>
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className="
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      text-black rounded-xl">
                      1
                    </div>
                    <h3 className={`mb-4 text-2xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>Create a Track</h3>
                    <p className={`text-lg leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      {`Put your site url and start track your engagement`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-6 lg:gap-16 lg:flex-row">

                  <div className="flex-1 text-center lg:text-left">
                    <div className="
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-b
                      text-black rounded-xl ">
                      2
                    </div>
                    <h3 className={`mb-4 text-2xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>Visualize Your Site Performance</h3>
                    <p className={`text-lg leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      {`!`}
                    </p>
                  </div>
                  <div className="flex-1 lg:max-w-xl">
                    <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">

                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-6 lg:gap-16 lg:flex-row">
                  <div className="flex-none md:flex-1 lg:max-w-xl">
                    <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">

                    </div>
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className="
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      bg-gradient-to-t text-xl font-bold 
                      text-black rounded-xl">
                      3
                    </div>
                    <h3 className={`mb-4 text-2xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>Start Receiving Reservations</h3>
                    <p className={`text-lg leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      {`You're all set! Now it's time to start eaning with Fireus. Welcome your guests, create
                        memorable experiences, and grow your business`}
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
                  Empower Your Business with Scheuor
                </h2>
                <p className={`text-lg  ${theme == "light" ? "text-gray-600" : "text-neutral-300"} mt-4 max-w-2xl mx-auto`}>

                  Join a platform designed to help you connect, engage, and grow.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoCard
                  icon={MdTrendingUp}
                  title="Data-Driven Growth"
                  content="Use insights to make informed decisions and grow faster."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={FaClock}
                  title="Save Time"
                  content="Streamline your workflow with intuitive tools."
                  iconColor="fuchsia"
                />
                <InfoCard
                  icon={BiGlobe}
                  title="Global Reach"
                  content="Connect with audiences worldwide effortlessly."
                  iconColor="fuchsia"
                />
              </div>
              <div className="mt-12 text-center">
                <h3 className={`text-2xl font-bold ${theme == "light" ? "text-slate-800" : "text-neutral-200"} mb-4`}>Ready to Grow with Scheuor?</h3>
                <p className={`text-lg ${theme == "light" ? "text-slate-700" : "text-neutral-300"} mb-8`}>Start engaging your audience today.</p>
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
            <div className="text-center mb-12">
              <h2 className={`text-3xl sm:text-4xl font-bold  ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`}>Features to Boost Engagement</h2>
              <p className={`text-lg  ${theme == "light" ? "text-gray-600" : "text-neutral-300"} mt-4 max-w-2xl mx-auto`}>
                Discover tools to manage interactions and grow your business.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <InfoCard
                icon={BiWorld}
                title="Global Exposure"
                content="Reach new audiences and expand your presence."
                iconColor="fuchsia"
              />
              <InfoCard
                icon={BiSpreadsheet}
                title="Interaction Management"
                content="Organize and track all your audience interactions."
                iconColor="fuchsia"
              />
              <InfoCard
                icon={MdSettings}
                title="Customization"
                content="Tailor experiences to suit your audience’s needs."
                iconColor="fuchsia"
                soon="coming soon"
              />
              <InfoCard
                icon={MdTrendingUp}
                title="Performance Tracking"
                content="Monitor engagement with real-time insights."
                iconColor="fuchsia"
                soon="coming soon"
              />
              <InfoCard
                icon={MdPeople}
                title="Community Building"
                content="Foster stronger connections with your audience."
                iconColor="fuchsia"
                soon="coming soon"
              />
              <InfoCard
                icon={FaRobot}
                title="AI-Powered Tools"
                content="Enhance efficiency with smart automation."
                iconColor="fuchsia"
                soon="coming soon"
              />
            </div>
          </Container>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className={`py-16 ${theme == "light" ? "bg-slate-50" : ""}`}>
          <Container>
            <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">

              <div className="text-center mb-12">
                <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-slate-800" : "text-neutral-200"}`}>What Our Users Say</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <div className="p-6">
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      "Scheuor transformed how I connect with my audience, making engagement seamless."
                    </p>
                    <h4 className={`font-semibold mt-4 ${theme == "light" ? "text-black" : "text-white"}`}>— Maria, Entrepreneur</h4>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      "The tools on Scheuor helped me grow my business faster than I expected."
                    </p>
                    <h4 className={`font-semibold mt-4 ${theme == "light" ? "text-black" : "text-white"}`}>— John, Business Owner</h4>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      {`"Scheuor's insights made it easy to optimize my strategy and reach new clients."`}
                    </p>
                    <h4 className={`font-semibold mt-4 ${theme == "light" ? "text-black" : "text-white"}`}>— Ana, Marketer</h4>
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
                Discover how Scheuor helps you connect with your audience and grow your business.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <video
                  className="w-full rounded-lg shadow-lg shadow-fuchsia-300"
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
          </Container>
        </section>

        {/* Final CTA */}
        <section id="final-cta" className="py-16 text-center">
          <Container>
            <h2 className={`text-3xl sm:text-4xl font-bold  ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`}>Join Scheuor Today!</h2>
            <p className={`text-lg mt-4 max-w-2xl mx-auto  ${theme == "light" ? "text-gray-600" : "text-neutral-300"}`}>
              Sign up now to unlock powerful tools and grow your business.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className="text-sm font-semibold py-3 px-6 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
              >
                Get Started
              </Link>
              <a
                href="mailto:contact@scheuor.com"
                className="text-sm font-semibold py-3 px-6 rounded-full border border-fuchsia-600 text-fuchsia-600 hover:bg-fuchsia-50 transition"
              >
                Contact Us
              </a>
            </div>
          </Container>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-12 w-full">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center md:items-start">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <Image
                    alt="Scheuor Logo"
                    className="h-10 w-auto"
                    height={40}
                    width={80}
                    src="/scheuor.png"
                  />
                </Link>
                <p className="text-gray-400 text-sm text-center md:text-left">
                  Scheuor: Connect with your audience, gain insights, and grow your business.
                </p>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-fuchsia-600 transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/onboarding" className="text-gray-400 hover:text-fuchsia-600 transition">
                      Get Started
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:contact@scheuor.com"
                      className="text-gray-400 hover:text-fuchsia-600 transition"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://x.com/scheuor"
                    className="text-gray-400 hover:text-fuchsia-600 transition"
                  >
                    <IoLogoTwitter size={24} />
                  </a>
                  <a
                    href="https://linkedin.com/company/scheuor"
                    className="text-gray-400 hover:text-fuchsia-600 transition"
                  >
                    <IoLogoLinkedin size={24} />
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 Scheuor. All rights reserved.
              </p>
            </div>
          </Container>
        </footer>

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