import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { FiArrowRight, FiMail, FiMapPin, FiClock, FiCalendar } from "react-icons/fi";
import { SiInstagram, SiFacebook, SiTwitter } from "react-icons/si";

export const RevealBento = () => {
  return (
    <div className="bg-white px-4 py-12 text-indigo-900">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{
          staggerChildren: 0.05,
        }}
        className="mx-auto grid max-w-6xl grid-flow-dense grid-cols-12 gap-4"
      >
        <HeaderBlock />
        <SocialsBlock />
        <AboutBlock />
        <LocationBlock />
        <EmailListBlock />
      </motion.div>
    </div>
  );
};

const Block = ({ className, ...rest }) => {
  return (
    <motion.div
      variants={{
        initial: {
          scale: 0.5,
          y: 50,
          opacity: 0,
        },
        animate: {
          scale: 1,
          y: 0,
          opacity: 1,
        },
      }}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
      className={twMerge(
        "col-span-4 rounded-lg border border-indigo-200 bg-indigo-50 p-6",
        className
      )}
      {...rest}
    />
  );
};

const HeaderBlock = () => (
  <Block className="col-span-12 row-span-2 md:col-span-6">
    <img
      src="/favicon.ico"
      alt="Farmers Market Logo"
      className="mb-4 h-14 w-auto"
    />
    <h1 className="mb-12 text-3xl font-medium leading-tight">
      Port Jefferson Farmers Market{" "}
      <span className="text-indigo-500">
        Where Local Meets Fresh
      </span>
    </h1>
    <a
      href="#contact"
      className="flex items-center gap-1 text-indigo-600 hover:underline"
    >
      Visit Us <FiArrowRight />
    </a>
  </Block>
);

const SocialsBlock = () => (
  <>
    <Block
      whileHover={{
        rotate: "2.5deg",
        scale: 1.1,
      }}
      className="col-span-6 bg-gradient-to-br from-purple-400 to-pink-500 md:col-span-3"
    >
      <a
        href="#"
        className="grid h-full place-content-center text-3xl text-white"
      >
        <SiInstagram />
      </a>
    </Block>
    <Block
      whileHover={{
        rotate: "-2.5deg",
        scale: 1.1,
      }}
      className="col-span-6 bg-blue-600 md:col-span-3"
    >
      <a
        href="#"
        className="grid h-full place-content-center text-3xl text-white"
      >
        <SiFacebook />
      </a>
    </Block>
  </>
);

const AboutBlock = () => (
  <Block className="col-span-12 text-3xl leading-snug">
    <p>
      Our passion is connecting local farmers with the community.{" "}
      <span className="text-indigo-500">
        We believe in sustainable agriculture and supporting local businesses. 
        Our market brings together the finest produce and artisanal goods from 
        Port Jefferson and surrounding areas, creating a vibrant marketplace 
        where quality meets community.
      </span>
    </p>
  </Block>
);

const LocationBlock = () => (
  <Block className="col-span-12 flex flex-col gap-4 md:col-span-6">
    <div className="flex items-center gap-2">
      <FiMapPin className="text-2xl text-indigo-500" />
      <p className="text-lg">
        101 East Broadway
        <br />
        Port Jefferson, NY 11777
      </p>
    </div>
    <div className="flex items-center gap-2">
      <FiCalendar className="text-2xl text-indigo-500" />
      <p className="text-lg">Every Saturday & Sunday</p>
    </div>
    <div className="flex items-center gap-2">
      <FiClock className="text-2xl text-indigo-500" />
      <p className="text-lg">9:00 AM - 1:00 PM</p>
    </div>
  </Block>
);

const EmailListBlock = () => (
  <Block className="col-span-12">
    <p className="mb-3 text-lg">Join my mailing list</p>
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center gap-2"
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full rounded border border-zinc-50 bg-zinc-50 px-3 py-1.5 transition-colors focus:border-red-300 focus:outline-0"
      />
      <button
        type="submit"
        className="flex items-center gap-2 whitespace-nowrap rounded bg-indigo-200 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-300"
      >
        <FiMail /> Join the list
      </button>
    </form>
  </Block>
);

export default RevealBento;
