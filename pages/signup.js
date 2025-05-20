import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";

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
            animate={{
              opacity: 1,
              scale: 1,
              transition: { delay: index * 0.1 },
            }}
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
    </div>
  );
};

export default function SignUp() {
  const [formType, setFormType] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formType == "vendor") {
      if (!name || !email || !password) {
        setErrorMessage("All fields are required");
        return;
      }

      try {
        const response = await fetch("/api/registerVendor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Registration successful!");
          setName("");
          setEmail("");
          setPassword("");
          router.push("/signin");
        } else {
          setErrorMessage(data.detail || "Something went wrong");
          toast.error(data.detail);
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      }
    } else {
      if (!name || !email || !password) {
        setErrorMessage("All fields are required");
        return;
      }
      try {
        const response = await fetch("/api/registerCustomer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: name,
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Registration successful!");
          setName("");
          setEmail("");
          setPassword("");
          router.push("/signin");
        } else {
          setErrorMessage(data.detail || "Something went wrong");
          toast.error(data.detail);
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      <BackgroundCollage />
      <Navbar />
      <Toaster />

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

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiUser size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder=" "
                  className="peer w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <label className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500 transition-all peer-focus:-translate-y-[2.5rem] peer-focus:text-xs peer-focus:text-indigo-500 peer-[:not(:placeholder-shown)]:-translate-y-[2.5rem] peer-[:not(:placeholder-shown)]:text-xs">
                  Name
                </label>
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
              )}

              {/* Sign Up Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full overflow-hidden rounded-lg bg-indigo-500 py-3 text-sm font-medium text-white transition-transform hover:bg-indigo-600"
              >
                <span className="relative z-10">Sign Up</span>
                <motion.div
                  className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 transition-opacity group-hover:opacity-100"
                  initial={false}
                  animate={{ scale: [0.8, 1.2], rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
              </motion.button>

              {/* Footer Links */}
              <div className="mt-6 flex items-center justify-between">
                <Link
                  href="/signin"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Already have an account?
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
