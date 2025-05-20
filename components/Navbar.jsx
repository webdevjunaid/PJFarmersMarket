import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const menuRef = useRef(null);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (session?.user?.id && session?.user?.userType === "customer") {
        const { data: customer, error } = await supabase
          .from("customer")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!error && customer) {
          setCustomerData(customer);
        }
      }
    };

    fetchCustomerData();
  }, [session]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/favicon.ico" alt="PJ Market Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-indigo-500">
              PJ Farmers Market
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-indigo-500 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/vendors"
              className="text-gray-700 hover:text-indigo-500 transition-colors"
            >
              Vendors
            </Link>
            <Link
              href="/list"
              className="text-gray-700 hover:text-indigo-500 transition-colors"
            >
              List
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-indigo-500 transition-colors"
            >
              Contact
            </Link>

            {session ? (
              <div className="relative" ref={menuRef}>
                <motion.button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none bg-white/90 rounded-full pl-1 pr-3 py-1 border border-gray-200 shadow-sm hover:shadow transition-all duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white overflow-hidden shadow-md"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: isProfileMenuOpen ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {session.user.userType === "customer" &&
                    customerData?.avatar_url ? (
                      <img
                        src={customerData.avatar_url}
                        alt={customerData.first_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {session.user.userType === "customer"
                          ? customerData?.first_name?.charAt(0).toUpperCase() ||
                            "U"
                          : session.user.name?.charAt(0).toUpperCase() || "V"}
                      </span>
                    )}
                  </motion.div>
                  <span className="text-gray-700 font-medium text-sm">
                    {session.user.userType === "customer"
                      ? customerData?.first_name
                      : session.user.name}
                  </span>
                  <motion.div
                    animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevronDown className="text-gray-500" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100 overflow-hidden"
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href={
                          session.user.userType === "vendor"
                            ? "/vendorDashboard"
                            : "/customerDashboard"
                        }
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200 flex items-center"
                      >
                        <FiUser className="mr-2 text-indigo-500" />
                        Dashboard
                      </Link>
                      <motion.button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                        whileHover={{ x: 2 }}
                      >
                        <div className="flex items-center">
                          <FiLogOut className="mr-2 text-indigo-500" />
                          Sign Out
                        </div>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/signin"
                  className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Sign In
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-b-lg shadow-md">
                <Link
                  href="/products"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-indigo-500 hover:bg-gray-50"
                >
                  Products
                </Link>
                <Link
                  href="/vendors"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-indigo-500 hover:bg-gray-50"
                >
                  Vendors
                </Link>
                <Link
                  href="/list"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-indigo-500 hover:bg-gray-50"
                >
                  List
                </Link>
                <Link
                  href="/contact"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-indigo-500 hover:bg-gray-50"
                >
                  Contact
                </Link>

                {session ? (
                  <>
                    <div className="flex items-center px-3 py-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-3 overflow-hidden">
                        {session.user.userType === "customer" &&
                        customerData?.avatar_url ? (
                          <img
                            src={customerData.avatar_url}
                            alt={customerData.first_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {session.user.userType === "customer"
                              ? customerData?.first_name
                                  ?.charAt(0)
                                  .toUpperCase() || "U"
                              : session.user.name?.charAt(0).toUpperCase() ||
                                "V"}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">
                        {session.user.userType === "customer"
                          ? customerData?.first_name
                          : session.user.name}
                      </span>
                    </div>
                    <Link
                      href={
                        session.user.userType === "vendor"
                          ? "/vendorDashboard"
                          : "/customerDashboard"
                      }
                      className="block px-3 py-2 rounded-md text-gray-700 hover:text-indigo-500 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <FiUser className="mr-2" />
                        Dashboard
                      </div>
                    </Link>
                    <motion.button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-indigo-500 hover:bg-gray-50"
                      whileTap={{ scale: 0.97 }}
                    >
                      <FiLogOut className="mr-2" />
                      Sign Out
                    </motion.button>
                  </>
                ) : (
                  <Link
                    href="/signin"
                    className="block px-3 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 text-center"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
