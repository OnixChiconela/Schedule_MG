'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IoMdArrowForward } from 'react-icons/io'
import { FaClock } from 'react-icons/fa'
import { MdChecklist, MdSettings, MdStar, MdSummarize, MdTrendingUp } from 'react-icons/md'
import { BiGlobe, BiQuestionMark, BiSpreadsheet, BiTask, BiWorld } from 'react-icons/bi'
import Container from './components/Container'
import { useTheme } from './themeContext'
import ClientOnly from './components/ClientOnly'
import Card from './components/cards/Card'
import InfoCard from './components/cards/CardInfo'
import LandingNavbar from './components/navbars/LandingNavbar'
import LandingFooter from './components/footers/LandingFooter'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FloatingWaitingButton from './components/buttons/FloationgWaitingButton'
import { Languages, Map, MessageSquareReply, Minimize, Star, StarIcon } from 'lucide-react'
import { awakeSv } from './api/actions/awake'
import Avatar from './components/Avatar'

export default function LandingPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const router = useRouter()

  const handleRegisterClose = () => setIsRegisterOpen(false)
  const { theme } = useTheme()

  const getStart = () => {
    router.push("/dashboard")
  }

  useEffect(() => {
    const awakeServer = async () => {
      awakeSv()
    }
    awakeServer()
  }, [])

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
                            {`Talk smarter with your team,`}
                            <br />
                            <span
                              style={{
                                backgroundImage: 'linear-gradient(to right, #d946ef, #701a75)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                              className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-900 text-transparent"
                            >
                              {`not louder`}
                            </span>
                          </h1>
                          {/* <p className={`text-lg sm:text-xl max-w-2xl mb-8 text-center ${theme == "light" ? "text-gray-600" : "text-neutral-400/90"}`}>
                            {`Scheuor is your space for real-time, meaningful conversations, solo or in partnership. Let AI assist and enhace your interaction, every step or of the way.`}
                          </p> */}
                          <p className={`text-lg sm:text-xl max-w-2xl mb-8 text-center ${theme == "light" ? "text-gray-600" : "text-neutral-400/90"}`}>
                            {`In Scheuor, your AI listens with you, not for you. Add your people, activate Telepathy Mode, and let the right insights reach the rigth minds, all in real time`}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <div
                              onClick={() => getStart()}
                              className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.gap = '0.5rem';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.gap = '0.10rem';
                              }}
                            >
                              {`Get Started`}
                              <IoMdArrowForward
                                size={20}
                                className="ml-2 transition-transform duration-300 ease-in-out"
                              />
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

        {/* How It Works */}
        <section id="how-it-works" className="relative overflow-hidden py-20 sm:py-32">
          <Container>
            <div className="flex flex-col items-center max-w-screen-xl mx-auto">
              <div className="text-center mb-12">
                <h2 className={`mb-4 text-3xl font-bold text-center sm:text-4xl ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`} style={{
                  translate: "none", rotate: "none", scale: "none"
                }}>{`Where Scheuor helps you stay aligned`}</h2>
                <p className={`text-lg leading-8 ${theme == "light" ? "text-gray-800" : "text-gray-300"} text-center`}>
                  {`THE STEP INTO A SMART CONVERSATIONS`}
                </p>
              </div>
              {/* <div className="mt-16"> */}
              <div>
                <div className="hidden lg:flex lg:flex-col space-y-16 lg:space-y-20">
                  <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded-2xl hover:scale-102 p-6 hover:shadow-lg ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>
                    <div className="flex-none md:flex-1 lg:max-w-xl">
                      <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">
                        {/* <Image
                          alt="calendar"
                          src={require("@/../public/images/mybss.png")}
                        /> */}
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      ${theme == "light" ? "text-neutral-200 bg-neutral-900" : "text-neutral-800 bg-neutral-200"} rounded-xl`}>
                        {`1`}
                      </div>
                      <h3 className={`mb-4 text-4xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`During meetings`}</h3>
                      <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                        <a className={`font-semibold ${theme == "light" ? "text-neutral-900" : "text-neutral-200"}`}>{`Meet with clarity, not noise. `}</a>
                        {`Scheuor listens, reply in real time and offers silent support only tot those you allow. From subtle nudges to full summaries,
                        you lead the call, the AI just keeps you sharp`}
                      </p>
                    </div>
                  </div>
                  <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded-2xl hover:scale-102 p-6 hover:shadow-lg ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>

                    <div className="flex-1 text-center lg:text-left">
                      <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      ${theme == "light" ? "text-neutral-200 bg-neutral-900" : "text-neutral-800 bg-neutral-200"} rounded-xl`}>
                        {`2`}
                      </div>
                      <h3 className={`mb-4 text-4xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`In shared spaces.`}</h3>
                      <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                        <a className={`font-semibold ${theme == "light" ? "text-neutral-900" : "text-neutral-200"}`}>{`Your team second brain. `}</a>
                        {`Create spaces with teammates or clients and let AI help navigate decisions, hightlight blind spots,and stay aligned, wether you're 
                        live or async.Everyone sees what they should, and nothing more`}
                      </p>
                    </div>
                    <div className="flex-1 lg:max-w-xl ">
                      <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">
                        {/* <Image
                          alt="calendar"
                          src={require("@/../public/images/calendar.png")}
                        /> */}
                      </div>
                    </div>
                  </div>
                  <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded-2xl hover:scale-102 p-6 hover:shadow-lg ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>
                    <div className="flex-none md:flex-1 ">
                      <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 hidden lg:flex">
                        {/* <Image
                          alt="calendar"
                          src={require("@/../public/images/road.png")}
                        /> */}
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      ${theme == "light" ? "text-neutral-200 bg-neutral-900" : "text-neutral-800 bg-neutral-200"} rounded-xl`}>
                        {`3`}
                      </div>
                      <h3 className={`mb-4 text-4xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`In your private zone`}</h3>
                      <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                        <a className={`font-semibold ${theme == "light" ? "text-neutral-900" : "text-neutral-200"}`}>{`Think on your own terms. `}</a>
                        {`Use Scheuor solo to brainstorm, prepare before meetings, generate content to refine your thoughts, no distractions, no audience.
                        Just you and your personal assistent that knows your flow`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:hidden flex flex-col space-y-16 lg:space-y-20">
                  <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded-2xl hover:scale-102 p-6 hover:shadow-lg ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>
                    <div className="flex-none md:flex-1 lg:max-w-xl">
                      <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 flex">
                        {/* <Image
                          alt="calendar"
                          src={require("@/../public/images/mybss.png")}
                        /> */}
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      ${theme == "light" ? "text-neutral-200 bg-neutral-900" : "text-neutral-800 bg-neutral-200"} rounded-xl`}>
                        {`1`}
                      </div>
                      <h3 className={`mb-4 text-3xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`During meetings`}</h3>
                      <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                        <a className={`font-semibold ${theme == "light" ? "text-neutral-900" : "text-neutral-200"}`}>{`Meet with clarity, not noise.`}</a>
                        {`Scheuor listens, reply in real time and offers silent support only tot those you allow. From subtle nudges to full summaries,
                        you lead the call, the AI just keeps you sharp`}
                      </p>
                    </div>
                  </div>
                  <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded-2xl hover:scale-102 p-6 hover:shadow-lg ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>
                    <div className="flex-none md:flex-1 lg:max-w-xl">
                      <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 flex">
                        {/* <Image
                          alt="calendar"
                          src={require("@/../public/images/mybss.png")}
                        /> */}
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      ${theme == "light" ? "text-neutral-200 bg-neutral-900" : "text-neutral-800 bg-neutral-200"} rounded-xl`}>
                        {`2`}
                      </div>
                      <h3 className={`mb-4 text-3xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`In shared spaces.`}</h3>
                      <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                        <a className={`font-semibold ${theme == "light" ? "text-neutral-900" : "text-neutral-200"}`}>{`Your team second brain. `}</a>
                        {`Create spaces with teammates or clients and let AI help navigate decisions, hightlight blind spots,and stay aligned, wether you're 
                        live or async.Everyone sees what they should, and nothing more`}
                      </p>
                    </div>
                  </div>
                  <div className={`flex flex-col items-center gap-6 lg:gap-16 lg:flex-row transition rounded-2xl hover:scale-102 p-6 hover:shadow-lg ${theme == "light" ? "hover:bg-neutral-100" : "hover:bg-slate-900/30"}`}>
                    <div className="flex-none md:flex-1 lg:max-w-xl">
                      <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 flex">
                        {/* <Image
                          alt="calendar"
                          src={require("@/../public/images/mybss.png")}
                        /> */}
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <div className={`
                      mb-6 inline-flex h-12 w-12 
                      items-center justify-center 
                      text-xl font-bold bg-gradient-to-bl
                      
                      ${theme == "light" ? "text-neutral-200 bg-neutral-900" : "text-neutral-800 bg-neutral-200"} rounded-xl`}>
                        {`3`}
                      </div>
                      <h3 className={`mb-4 text-3xl font-bold ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>{`In your private zone`}</h3>
                      <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                        <a className={`font-semibold ${theme == "light" ? "text-neutral-900" : "text-neutral-200"}`}>{`Think on your own terms. `}</a>
                        {`Use Scheuor solo to brainstorm, prepare before meetings, generate content to refine your thoughts, no distractions, no audience.
                        Just you and your personal assistent that knows your flow`}
                      </p>
                    </div>
                  </div>
                </div>
                {/* </div> */}
              </div>
            </div>
          </Container>
          <div className="h-3 md:h-5" />
        </section>

        {/* Why Scheuor */}
        <section id="why-scheuor" className={`py-16 px-2 rounded-md ${theme == "light" ? "bg-neutral-50" : "bg-slate-700/20"}`}>
          <Container>
            <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">

              <div className="text-center mb-16">
                <div className="inline-flex text-center rounded-full bg-fuchsia-100 px-4 py-2 text-sm font-semibold text-fuchsia-600 mb-6">
                  Why Choose Scheuor
                </div>
                <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-neutral-200"} `}>
                  This is how Scheuor moves your thoughts.
                </h2>
                {/* <p className={`text-lg  ${theme == "light" ? "text-gray-600" : "text-neutral-300"} mt-4 max-w-2xl mx-auto`}>
                  Formas claras como o scheuor mudara a sua e a do seu parceiro forma de pensar.
                </p> */}
              </div>
              <div className='flex flex-col gap-40'>
                <div>
                  <div className={`flex flex-col gap-4 mb-10`}>
                    <h3 className={`text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-gray-200"}`}>{`In sync, almost telepathically`}</h3>
                    <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      {`Great partnerships that feels like telepathy. With Scheuor, you and your collaborators stay aligned, move faster, and grow together.
                      supported by AI that offers real-time suggestions, privately shown to those with permission.`}<br />
                      {`It listens when you listen in meetings, adapting to the flow and providing guidance as the conversation unfolds`}
                    </p>
                  </div>
                  <div className='grid lg:grid-cols-2 gap-8 lg:gap-8'>
                    <div>
                      {/* <h3 className={`p-2 bg-gradient-to-r w-[30%] rounded-xl mb-5 ${theme == "light"
                        ? "from-neutral-800 to-neutral-400 text-neutral-50"
                        : "from-neutral-200 to-neutral-600 text-neutral-800"} font-semibold transition-colors`}>
                        Partners
                      </h3> */}
                      <span className={`p-2 bg-gradient-to-l w-[30%] rounded-xl mb-5 flex ${theme === "light"
                        ? "from-neutral-400 to-neutral-800" : "from-neutral-600 to-neutral-200"} transition-colors`}>
                        <h3 className={`  ${theme == "light"
                          ? " text-neutral-50"
                          : " text-neutral-800"} font-semibold `}>
                          Partners
                        </h3>
                      </span>
                      <div className="flex-none md:flex-1">
                        <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 flex">
                          {/* <Image
                          alt="calendar"
                          src={""}
                        /> */}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-end">
                        <span className={`p-2 bg-gradient-to-r w-[30%] rounded-xl mb-5 flex justify-end ${theme === "light"
                          ? "from-neutral-400 to-neutral-800" : "from-neutral-600 to-neutral-200"} transition-colors`}>
                          <h3 className={`  ${theme == "light"
                            ? " text-neutral-50"
                            : " text-neutral-800"} font-semibold `}>
                            Guest
                          </h3>
                        </span>
                      </div>
                      <div className="flex-none md:flex-1">
                        <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 flex">
                          {/* <Image
                          alt="calendar"
                          src={""}
                        /> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className={`font-bold mt-8 ${theme == "light" ? "text-neutral-800" : "text-neutral-200"}`}>Behind the scenes, AI supports those who lead</p>
                </div>

                <div>
                  <div className={`flex flex-col gap-4 mb-20`}>
                    <h3 className={`text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-gray-200"}`}>{`There's always something to talk about`}</h3>
                    <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      {`A good conversation opens doors. Create those moments with ease.`}<br />
                      {`Scheuor can respond alongside you in any chat, whether in a big group or one-on-one, understanding the context and helping define the right tone, so your 
                      message always lands well`}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* Text Section */}
                    <div className="w-full md:flex-[0.35]">
                      <h4 className={`text-2xl font-semibold mb-4 ${theme === "light" ? "text-neutral-700" : "text-neutral-300"}`}>
                        One click. One clear answer
                      </h4>
                      <p className={`text-base leading-relaxed ${theme === "light" ? "text-gray-800" : "text-gray-300"}`}>
                        Sometimes you don't need to think twice. Just hit reply, Scheuor knows what to say, how to say it, and when it matters most. It's like having someone who always gets you.
                      </p>
                    </div>

                    {/* Image Section */}
                    <div className="w-full md:flex-[0.65]">
                      <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 flex">
                        {/* <Image alt="calendar" src={""} /> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className={`flex flex-col gap-4 mb-20`}>
                    <h3 className={`text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-gray-200"}`}>{`Take Scheuor with you`}</h3>
                    <p className={`text-xl leading-relaxed ${theme == "light" ? "text-gray-800" : "text-gray-300"}`}>
                      {`Wherever the conversation happens.`}<br />
                      {`Scheuor ins't just for your workspace.
                      Add our browser extension and bring it with you, into zoom calls, Google Meet, or even when you're replying to an email.`}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* Text Section */}
                    <div className="w-full md:flex-[0.35]">
                      <h4 className={`text-2xl font-semibold mb-4 ${theme === "light" ? "text-neutral-700" : "text-neutral-300"}`}>
                        {`Scheuor Extension `}<span>{`(soon)`}</span>
                      </h4>
                      <p className={`text-base leading-relaxed ${theme === "light" ? "text-gray-800" : "text-gray-300"}`}>
                        {`Whether you're in a meeting, writing a message, or reviewing something important, Scheuor with you permission, quietly undarstands,
                         and helps you, right when it matters.`}
                      </p>
                    </div>

                    {/* Image Section */}
                    <div className="w-full md:flex-[0.65]">
                      <div className="relative aspect-[2/1.2] w-full overflow-hidden rounded-2xl shadow-lg shadow-fuchsia-300 flex">
                        {/* <Image alt="calendar" src={""} /> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
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
              </div> */}
            </div>
          </Container>
        </section>

        {/* Features */}

        <section id="connect-with-us" className="relative overflow-hidden px-2 py-20 sm:py-32">
          <Container>
            <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">

              <div className="text-center mb-12">
                <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-gray-900" : "text-neutral-200"} `}>{`How Scheuor Can Help`}</h2>
                <p className={`text-lg mt-4 ${theme == "light" ? "text-gray-600" : "text-neutral-300"}`}>{`Tools to boost your your clarity, focus, and progress`}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoCard
                  icon={Minimize}
                  title="Summarize conversations"
                  content="Lost in a long chat? aghh again.scheuor can instantly generate summaries so you never miss the point.
                  Whether it's a deep discussion or a fast-paced exchange, get a clear view of what matters, and pick up exactly where you left off"
                  titleColor={`${theme == "light" ? "text-neutral-800" : "text-neutral-200"}`}
                  from={`${theme == "light" ? "from-neutral-100" : "from-slate-700"}`}
                  to={`${theme == "light" ? "to-neutral-50" : "to-slate-600"}`}
                  contentColor={`${theme == "light" ? "text-neutral-700" : "text-neutral-300"}`}
                  smallBg={`${theme == "light" ? "bg-neutral-400/20" : "bg-slate-500/30"}`}
                  iconColor={`${theme == "light" ? "black" : "gray"}`}
                />
                <InfoCard
                  icon={MessageSquareReply}
                  title="Schedule an answer or message."
                  content="Reply exactly you want, without lifting a finger. scheuor analyzes the last messages, uses your prompt, and crafts a response that aligns with conversation's 
                  tone and context. It's like pressing pause and still being perfectly present"
                  titleColor={`${theme == "light" ? "text-neutral-800" : "text-neutral-200"}`}
                  from={`${theme == "light" ? "from-neutral-200/60" : "from-slate-700"}`}
                  to={`${theme == "light" ? "to-neutral-50" : "to-slate-600"}`}
                  contentColor={`${theme == "light" ? "text-neutral-700" : "text-neutral-300"}`}
                  smallBg={`${theme == "light" ? "bg-neutral-400/20" : "bg-slate-500/30"}`}
                  iconColor={`${theme == "light" ? "black" : "gray"}`}
                  soon='Coming...'
                />
                <InfoCard
                  icon={BiQuestionMark}
                  title=""
                  content=""
                  from={`${theme == "light" ? "from-neutral-200/60" : "from-slate-700"}`}
                  to={`${theme == "light" ? "to-neutral-50" : "to-slate-600"}`}
                  contentColor={`${theme == "light" ? "text-neutral-700" : "text-neutral-300"}`}
                  smallBg={`${theme == "light" ? "bg-neutral-400/20" : "bg-slate-500/30"}`}
                  iconColor={`${theme == "light" ? "black" : "gray"}`}
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className={` px-2 py-16 ${theme == "light" ? "" : ""}`}>
          <Container>
            <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">

              <div className="text-center mb-12">
                <h2 className={`text-3xl sm:text-4xl font-bold ${theme == "light" ? "text-slate-800" : "text-neutral-200"}`}>What Our Users Say</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <MdStar key={i} className="text-fuchsia-400 w-4 h-4" />
                      ))}
                    </div>
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      {`"Loved the idea of AI that only joins when I allow it, just create a partnership and it's there. The scheduled replies feature is amazing. Though, I sent one to my girlfriend and it ended with 'Sincerely, Ricky Otavio.' So formal, she laughed! at least"`}
                    </p>
                    <div className='flex items-center gap-2 mt-4'>
                      <div>
                        <Avatar visualType='initial' visualValue='' name='Rick' />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${theme == "light" ? "text-black" : "text-white"}`}>{` Ricky Otavio, First User`}</h4>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <MdStar key={i} className="text-fuchsia-400 w-4 h-4" />
                      ))}
                    </div>
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      {`"The AI modal is a game changer. Me and my partner see the suggestions, the other person doesn't. It's like we're sharing the same brain. Can't wait to use this more!"`}
                    </p>
                    <div className='flex items-center gap-2 mt-4'>
                      <div>
                        <Avatar visualType='initial' visualValue='' name='Jessica' />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${theme == "light" ? "text-black" : "text-white"}`}>{` Jessica Alburquerque, Early User`}</h4>
                      </div>
                    </div>
                  </div>
                </Card>
                {/* <Card>
                  <div className="p-6">
                    <p className={`${theme == "light" ? "text-gray-700" : "text-neutral-300"}`}>
                      {`"The suggestions and clean interface help me reflect and stay intentional with my time."`}
                    </p>
                    <h4 className={`font-semibold mt-4 ${theme == "light" ? "text-black" : "text-white"}`}>{`— Ana, Creative`}</h4>
                  </div>
                </Card> */}
              </div>
            </div>
          </Container>
        </section>

        {/* Video Demo Section */}
        {/* <section id="video-demo" className={`py-16 ${theme == "light" ? "" : "bg-slate-800/50"}`}>
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


        </section> */}


        {/* <div className="w-full px-4 sm:px-6 lg:px-8">
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
        </div> */}
        {/* <div className="mt-8 text-center">
          <div className='flex justify-center'>
            <Link
              href="/onboarding"
              className="text-sm font-semibold py-3 px-8 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition flex items-center justify-center mx-auto"
            >
              Try Scheuor Now <IoMdArrowForward size={20} className="ml-2" />
            </Link>
          </div>
        </div> */}

        {/* Final CTA */}
        <section id="final-cta" className="py-16 text-center">
          <Container>
            <h2 className={`text-3xl sm:text-4xl font-bold  ${theme == "light" ? "text-gray-900" : "text-neutral-200"}`}>The Step Into a Smart Conversations</h2>
            <p className={`text-lg mt-4 max-w-2xl mx-auto  ${theme == "light" ? "text-gray-600" : "text-neutral-300"}`}>
              {`You've seen how it works. Now, experience how it moves you`}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className={`text-base py-3 px-6 rounded-full transition font-semibold ${theme == "light" ? "bg-black text-white" : "bg-neutral-50 text-neutral-800"}`}
              >
                Get Started
              </Link>
              <a
                // href="mailto:contact@scheuor.com"
                href="mailto:josechiconela@icloud.com"
                className={`ext-base font-semibold py-3 px-6 rounded-full border border-fuchsia-600 text-fuchsia-600 transition`}
              >
                Contact Us
              </a>
            </div>
          </Container>
        </section>

        {/* Footer */}
        <LandingFooter />

        <FloatingWaitingButton />
      </div>
    </ClientOnly>
  )
}