'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconType } from 'react-icons'
import { IoLogoLinkedin, IoLogoTwitter, IoMdArrowForward } from 'react-icons/io'
import { FaClock, FaRobot } from 'react-icons/fa'
import { MdPeople, MdSettings, MdTrendingUp } from 'react-icons/md'
import { BiGlobe, BiSpreadsheet, BiTrendingUp, BiWorld } from 'react-icons/bi'
import Container from './components/Container'
// Componente Card
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">{children}</div>
)

const InfoCard = ({
  icon: Icon,
  title,
  content,
  smallBg,
  iconColor,
  contentColor,
  soon,
  contentSize,
}: {
  icon: IconType
  title: string
  content: string
  smallBg?: string
  iconColor?: string
  contentColor?: string
  soon?: string
  contentSize?: string
}) => (
  <div className="relative transition-all hover:-translate-y-1">
    <Card>
      <div className="p-6 flex flex-col gap-2">
        <div
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
            smallBg || 'bg-fuchsia-100'
          } ${iconColor === 'fuchsia' ? 'text-fuchsia-600' : 'text-white'}`}
        >
          <Icon size={24} />
        </div>
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        <p className={`${contentSize || 'text-base'} ${contentColor || 'text-gray-600'}`}>{content}</p>
        {soon && (
          <span className="absolute top-2 right-2 text-xs text-fuchsia-600 bg-fuchsia-100 px-2 py-1 rounded">
            {soon}
          </span>
        )}
      </div>
    </Card>
  </div>
)

export default function LandingPage() {
  const router = useRouter()
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const handleRegisterOpen = () => setIsRegisterOpen(true)
  const handleRegisterClose = () => setIsRegisterOpen(false)

  return (
    <div className="bg-white">
      {/* Navbar */}
      <div className="fixed w-full z-20 shadow-sm bg-white">
        <Container>
          <div className="flex flex-row items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                alt="Scheuor Logo"
                className="h-12 w-auto"
                height={48}
                width={100}
                src="/scheuor.png"
                priority
              />
            </Link>
            <button
              onClick={handleRegisterOpen}
              className="text-sm font-semibold py-2 px-6 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
            >
              Sign Up
            </button>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <section id="landing" className="pt-24 pb-16 relative overflow-hidden">
        <div className="">
          <div className="max-w-screen-xl mx-auto">
            <Container>
              <div className="flex flex-col justify-center ">
                <div className="flex flex-col md:flex-row gap-8 pt-24 md:pt-24">
                  <div className="flex p-8 shadow-lg hover:shadow-fuchsia-900 
                      shadow-fuchsia-800/80 bg-clip-border bg-gradient-to-b
                        py-24 rounded-3xl transition"
                  >
                    <Container>
                      <div className="flex flex-col">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                          Connect and Grow with Scheuor
                          <br />
                          <span className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-900 bg-clip-text text-transparent">
                            Engage Your Audience
                          </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-8">
                          Join Scheuor to connect with your audience, gain actionable insights, and grow your business with ease.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link
                            href="/onboarding"
                            className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-900 transition flex items-center justify-center"
                          >
                            Get Started <IoMdArrowForward size={20} className="ml-2" />
                          </Link>
                          <a
                            href="mailto:contact@scheuor.com"
                            className="text-sm font-semibold py-3 px-8 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 transition"
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
      <section id="connect-with-us" className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How Scheuor Can Help</h2>
            <p className="text-lg text-gray-600 mt-4">Tools to boost your engagement</p>
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
        </Container>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="text-lg text-gray-600 mt-4">Get started with Scheuor in simple steps</p>
          </div>
          <div className="space-y-16">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center text-xl font-bold bg-fuchsia-600 text-white rounded-xl">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign Up</h3>
                <p className="text-lg text-gray-600">Create your account to start exploring Scheuor.</p>
              </div>
              <div className="flex-1 lg:max-w-xl">
                <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:block">
                  <Image
                    alt="Sign Up"
                    src="/how_it_works/signup.png"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center text-xl font-bold bg-fuchsia-600 text-white rounded-xl">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Engage Your Audience</h3>
                <p className="text-lg text-gray-600">Use Scheuor’s tools to connect and interact.</p>
              </div>
              <div className="flex-1 lg:max-w-xl">
                <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:block">
                  <Image
                    alt="Engage Audience"
                    src="/how_it_works/engage.png"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center text-xl font-bold bg-fuchsia-600 text-white rounded-xl">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Grow Your Business</h3>
                <p className="text-lg text-gray-600">Leverage insights to expand your reach and impact.</p>
              </div>
              <div className="flex-1 lg:max-w-xl">
                <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:block">
                  <Image
                    alt="Grow Business"
                    src="/how_it_works/grow.png"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Scheuor */}
      <section id="why-scheuor" className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-flex rounded-full bg-fuchsia-100 px-4 py-2 text-sm font-semibold text-fuchsia-600 mb-6">
              Why Choose Scheuor
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Empower Your Business with Scheuor
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Grow with Scheuor?</h3>
            <p className="text-lg text-gray-600 mb-8">Start engaging your audience today.</p>
            <Link
              href="/onboarding"
              className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition flex items-center justify-center mx-auto"
            >
              Get Started <IoMdArrowForward size={20} className="ml-2" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Features to Boost Engagement</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
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
      <section id="testimonials" className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What Our Users Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <div className="p-6">
                <p className="text-gray-600">
                  "Scheuor transformed how I connect with my audience, making engagement seamless."
                </p>
                <h4 className="font-semibold mt-4">— Maria, Entrepreneur</h4>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-gray-600">
                  "The tools on Scheuor helped me grow my business faster than I expected."
                </p>
                <h4 className="font-semibold mt-4">— John, Business Owner</h4>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-gray-600">
                  "Scheuor’s insights made it easy to optimize my strategy and reach new clients."
                </p>
                <h4 className="font-semibold mt-4">— Ana, Marketer</h4>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Video Demo Section */}
      <section id="video-demo" className="py-16 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              See Scheuor in Action
              <br />
              <span className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-900 bg-clip-text text-transparent">
                Watch Our Demo
              </span>
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
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
            <Link
              href="/onboarding"
              className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition flex items-center justify-center mx-auto"
            >
              Try Scheuor Now <IoMdArrowForward size={20} className="ml-2" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section id="final-cta" className="py-16 text-center">
        <Container>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Join Scheuor Today!</h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
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
      <footer className="bg-gray-900 py-12">
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
  )
}