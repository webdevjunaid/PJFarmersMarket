import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const BackgroundCollage = () => {
  const [mounted, setMounted] = useState(false);
  const [shuffledImages, setShuffledImages] = useState([]);

  const images = [
    "/gallery/IMG_5930.jpg",
    "/gallery/IMG_5931.jpg",
    "/gallery/IMG_5932.jpg",
    "/gallery/IMG_5933.jpg",
    "/gallery/IMG_5934.jpg",
    "/gallery/IMG_5949.jpg",
    "/gallery/IMG_5936.jpg",
    "/gallery/IMG_5937.jpg",
    "/gallery/IMG_5938.jpg",
  ];

  useEffect(() => {
    setShuffledImages(shuffle([...images]));
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-violet-500/40 backdrop-blur-sm" />

      <div className="hidden md:grid grid-cols-4 grid-rows-3 gap-4 p-4 h-screen w-screen">
        {shuffledImages.map((src, index) => (
          <motion.div
            key={src}
            className={`relative overflow-hidden rounded-2xl ${
              index === 0 ? "col-span-2 row-span-2" : ""
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              mounted
                ? {
                    opacity: 1,
                    scale: 1,
                    transition: { delay: index * 0.1 },
                  }
                : {}
            }
          >
            <Image
              src={src}
              alt="Gallery image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={index < 4}
            />
          </motion.div>
        ))}
      </div>

      <div className="md:hidden grid grid-cols-2 grid-rows-2 gap-2 p-2 h-screen w-screen">
        {shuffledImages.slice(0, 4).map((src, index) => (
          <motion.div
            key={src}
            className="relative overflow-hidden rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              mounted
                ? {
                    opacity: 1,
                    scale: 1,
                    transition: { delay: index * 0.1 },
                  }
                : {}
            }
          >
            <Image
              src={src}
              alt="Gallery image"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function SignIn() {
  const [formType, setFormType] = useState("vendor");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: email,
      password: password,
      userType: formType,
      redirect: false,
    });

    setIsLoading(false);
    if (signInResult?.error) {
      setError("Invalid credentials. Please check your email and password.");
      console.error("Sign-in error:", signInResult.error);
    } else {
      const destination =
        formType === "vendor" ? "/vendorDashboard" : "/products";
      router.push(destination);
      toast.success("Welcome back!");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      <BackgroundCollage />
      <Toaster />
      <Navbar />

      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white/90 p-8 backdrop-blur-md shadow-lg"
          >
            {/* Form Type Selector */}
            <div className="mb-8 flex gap-4">
              <motion.button
                onClick={() => setFormType("customer")}
                className={`relative flex-1 rounded-lg py-3 text-sm font-medium transition-colors ${
                  formType === "customer"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Customer
                {formType === "customer" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-indigo-500"
                    style={{ zIndex: -1 }}
                  />
                )}
              </motion.button>
              <motion.button
                onClick={() => setFormType("vendor")}
                className={`relative flex-1 rounded-lg py-3 text-sm font-medium transition-colors ${
                  formType === "vendor"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Vendor
                {formType === "vendor" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-indigo-500"
                    style={{ zIndex: -1 }}
                  />
                )}
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiMail size={18} />
                </div>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder=" "
                  className="peer w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <label className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500 transition-all peer-focus:-translate-y-[2.5rem] peer-focus:text-xs peer-focus:text-indigo-500 peer-[:not(:placeholder-shown)]:-translate-y-[2.5rem] peer-[:not(:placeholder-shown)]:text-xs">
                  Email
                </label>
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock size={18} />
                </div>
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder=" "
                  className="peer w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-12 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <label className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500 transition-all peer-focus:-translate-y-[2.5rem] peer-focus:text-xs peer-focus:text-indigo-500 peer-[:not(:placeholder-shown)]:-translate-y-[2.5rem] peer-[:not(:placeholder-shown)]:text-xs">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="rounded-lg bg-red-50 p-4 text-sm text-red-800"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign In Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full overflow-hidden rounded-lg bg-indigo-500 py-3 text-sm font-medium text-white transition-transform hover:bg-indigo-600 disabled:opacity-70"
              >
                <span className="relative z-10">
                  {isLoading ? "Signing in..." : "Sign In"}
                </span>
                <motion.div
                  className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 transition-opacity group-hover:opacity-100"
                  initial={false}
                  animate={{ scale: [0.8, 1.2], rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
              </motion.button>

              {/* Social Login
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div> */}

              {/* <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FcGoogle size={20} />
                  Google
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaApple size={20} />
                  Apple
                </motion.button>
              </div> */}

              {/* Footer Links */}
              <div className="mt-6 flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
                <Link
                  href="/signup"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Create account
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
