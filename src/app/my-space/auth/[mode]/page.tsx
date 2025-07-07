"use client";

import { useTheme } from "@/app/themeContext";
import useAuthStore from "../authStore";
import authConfig, { defaultImageConfig } from "../authConfig";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Divider } from "@/app/components/navbars/SideNavbar";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import toast from "react-hot-toast";
import { acceptInviteToken } from "@/app/api/actions/collaboration/getInvite";

const Auth = () => {
  const { theme } = useTheme();
  const { mode: urlMode } = useParams();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUser();
  const searchParams = useSearchParams()
  const [isSwitching, setIsSwitching] = useState(false);

  const {
    mode,
    email,
    hashedPassword,
    firstName,
    lastName,
    error,
    fieldErrors,
    loading,
    setMode,
    setEmail,
    setPassword,
    setFirstName,
    setLastName,
    submit,
    reset,
  } = useAuthStore();

  //
  const inviteToken = searchParams.get('inviteToken')
  const inviteEmail = searchParams.get('email')

  useEffect(() => {
    if (inviteEmail && mode === 'register') {
      setEmail(decodeURIComponent(inviteEmail))
    }
  }, [inviteEmail, mode, setEmail])

  //
  const imageConfig = authConfig[mode] || defaultImageConfig;

  useEffect(() => {
    const validModes = ["login", "register", "forgot-password"];
    if (validModes.includes(urlMode as string)) {
      setMode(urlMode as "login" | "register" | "forgot-password");
    } else {
      router.push("/my-space/auth/login");
    }
  }, [urlMode, setMode, router]);

  useEffect(() => {
    // Toasts movidos para authStore.ts
    if (error && error !== "Password reset email sent") {
      // toast.error removido, já gerenciado no authStore
    } else if (error === "Password reset email sent") {
      // toast.success removido, já gerenciado no authStore
    }
  }, [error, theme]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const success = await submit(setCurrentUser);
  //   if (success && (mode === 'login' || mode === 'register')) {
  //     // Redirecionar para dashboard ou página de convite
  //     if (inviteToken && mode === 'login') {
  //       router.push(`/collaboration-space/invite/${inviteToken}`);
  //     } else {
  //       router.push('/dashboard');
  //     }
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    // toast.success(`SUBMIT MODE: ${mode}`,)
    e.preventDefault()
    const success = await submit(setCurrentUser)

    if (success && mode === "register" && inviteToken && currentUser) {
      try {
        const completeData = await acceptInviteToken(inviteToken, currentUser.id)
        toast.success(`Successfully joined ${completeData.partnership.name}!`);
        router.push(`/collaboration-space/collaboration/${completeData.partnership.id}`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to join partnership.');
        router.push('/dashboard'); // fallback
      }
    } else if (success && (mode === "login" || mode === "register")) {
      router.push('/dashboard');
    }
  }

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const success = await submit(setCurrentUser);
  //   console.log("succes",success)
  //   if (success && (mode === "login" || mode === "register")) {
  //     router.push("/dashboard");
  //   }
  // };

  const handleModeSwitch = (newMode: "login" | "register" | "forgot-password") => {
    setIsSwitching(true);
    reset();
    setMode(newMode);
    setTimeout(() => {
      router.push(`/my-space/auth/${newMode}`);
      setIsSwitching(false);
    }); // Atraso de 1 segundo
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center 
        ${theme == "light" ? "bg-neutral-200" : "bg-black/50"}`}
      // style={{ backgroundImage: `url(/images/scheuor_final.png)` }}
    >
      <AnimatePresence mode="wait">
        {!isSwitching && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className={`w-[90vw] max-w-6xl rounded-lg shadow-lg overflow-hidden flex backdrop-blur-xl ${
              theme === "light" ? "bg-white/50" : "bg-slate-900/50"
            }`}
          >
            <div
              className={`hidden md:block w-1/2 bg-cover bg-center ${imageConfig.fallback || ""} ${imageConfig.className || ""}`}
              style={{ backgroundImage: `url(${imageConfig.url})` }}
              role="img"
              aria-label={imageConfig.alt}
            />

            <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
              <h2
                className={`text-3xl font-semibold mb-6 text-center ${
                  theme === "light" ? "text-neutral-800" : "text-neutral-200"
                }`}
              >
                {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Reset Password"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6" aria-live="assertive">
                {mode === "register" && (
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="w-full">
                      <label htmlFor="firstName" className="sr-only">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-fuchsia-900 outline-none transition-all ${
                          theme === "light" ? "bg-gray-100 border-gray-300" : "bg-slate-700 border-slate-600 text-white"
                        } ${fieldErrors.firstName ? "border-red-500" : ""}`}
                        placeholder="First name"
                        aria-label="First name"
                        aria-invalid={!!fieldErrors.firstName}
                        aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
                      />
                      {fieldErrors.firstName && (
                        <p id="firstName-error" className="mt-1 text-sm text-red-500">
                          {fieldErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      <label htmlFor="lastName" className="sr-only">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-fuchsia-900 outline-none transition-all ${
                          theme === "light" ? "bg-gray-100 border-gray-300" : "bg-slate-700 border-slate-600 text-white"
                        } ${fieldErrors.lastName ? "border-red-500" : ""}`}
                        placeholder="Last name"
                        aria-label="Last name"
                        aria-invalid={!!fieldErrors.lastName}
                        aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
                      />
                      {fieldErrors.lastName && (
                        <p id="lastName-error" className="mt-1 text-sm text-red-500">
                          {fieldErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {(mode === "login" || mode === "register" || mode === "forgot-password") && (
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-fuchsia-900 outline-none transition-all ${
                        theme === "light" ? "bg-gray-100 border-gray-300" : "bg-slate-700 border-slate-600 text-white"
                      } ${fieldErrors.email ? "border-red-500" : ""}`}
                      placeholder="Email"
                      aria-label="Email"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    />
                    {fieldErrors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-500">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                )}

                {mode !== "forgot-password" && (
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={hashedPassword}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-fuchsia-900 outline-none transition-all ${
                        theme === "light" ? "bg-gray-100 border-gray-300" : "bg-slate-700 border-slate-600 text-white"
                      } ${fieldErrors.hashedPassword ? "border-red-500" : ""}`}
                      placeholder="Password"
                      aria-label="Password"
                      aria-invalid={!!fieldErrors.hashedPassword}
                      aria-describedby={fieldErrors.hashedPassword ? "password-error" : undefined}
                    />
                    {fieldErrors.hashedPassword && (
                      <p id="password-error" className="mt-1 text-sm text-red-500">
                        {fieldErrors.hashedPassword}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full p-3 rounded-md text-lg font-medium transition-all ${
                    theme === "light"
                      ? "bg-neutral-800 text-white hover:bg-neutral-900"
                      : "bg-neutral-900 text-white hover:bg-black"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {mode === "login" ? "Continue" : mode === "register" ? "Continue" : "Send Reset Link"}
                </button>
              </form>
              <div className="mt-6"></div>
              <Divider theme={theme} />
              <div className="mt-6 text-center space-y-4">
                {mode !== "register" && (
                  <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    Don't have an account?{" "}
                    <button
                      onClick={() => handleModeSwitch("register")}
                      className="text-blue-500 hover:underline"
                      aria-label="Switch to register"
                    >
                      Create one
                    </button>
                  </p>
                )}
                {mode !== "login" && (
                  <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    Already have an account?{" "}
                    <button
                      onClick={() => handleModeSwitch("login")}
                      className="text-blue-500 hover:underline"
                      aria-label="Switch to login"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode !== "forgot-password" && (
                  <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    Forgot your password?{" "}
                    <button
                      onClick={() => handleModeSwitch("forgot-password")}
                      className="text-blue-500 hover:underline"
                      aria-label="Switch to forgot password"
                    >
                      Reset it
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;