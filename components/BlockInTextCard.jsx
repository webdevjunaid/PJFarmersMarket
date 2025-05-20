import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Example = () => {
  return (
    <div className="flex items-center justify-center bg-white px-8 py-24 text-neutral-800">
      <BlockInTextCard
        tag="/ Contact Us"
        text={
          <>
            <strong>Have questions about the market?</strong> We'd love to help! Contact us
            for any information about vendors, products, or market schedules.
          </>
        }
        examples={[
          "When is the next market day?",
          "How can I become a vendor?",
          "Where is the market located?",
          "Do you accept credit cards?",
        ]}
      />
    </div>
  );
};

const BlockInTextCard = ({ tag, text, examples }) => {
  return (
    <div className="w-full max-w-xl space-y-6">
      <div>
        <p className="mb-1.5 text-sm font-light uppercase">{tag}</p>
        <hr className="border-indigo-500" />
      </div>
      <p className="max-w-lg text-xl leading-relaxed">{text}</p>
      <div>
        <Typewrite examples={examples} />
        <hr className="border-indigo-300" />
      </div>
      <button className="w-full rounded-full border border-indigo-500 py-2 text-sm font-medium transition-colors hover:bg-indigo-500 hover:text-white">
        Contact Us
      </button>
    </div>
  );
};

const LETTER_DELAY = 0.025;
const BOX_FADE_DURATION = 0.125;

const FADE_DELAY = 5;
const MAIN_FADE_DURATION = 0.25;

const SWAP_DELAY_IN_MS = 5500;

const Typewrite = ({ examples = [] }) => {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    if (!examples.length) return;

    const intervalId = setInterval(() => {
      setExampleIndex((pv) => (pv + 1) % examples.length);
    }, SWAP_DELAY_IN_MS);

    return () => clearInterval(intervalId);
  }, [examples]);

  if (!examples.length) return null;

  return (
    <p className="mb-2.5 text-sm font-light uppercase">
      <span className="inline-block size-2 bg-indigo-500" />
      <span className="ml-3">
        EXAMPLE:{" "}
        {examples[exampleIndex].split("").map((l, i) => (
          <motion.span
            initial={{
              opacity: 1,
            }}
            animate={{
              opacity: 0,
            }}
            transition={{
              delay: FADE_DELAY,
              duration: MAIN_FADE_DURATION,
              ease: "easeInOut",
            }}
            key={`${exampleIndex}-${i}`}
            className="relative"
          >
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: i * LETTER_DELAY,
                duration: 0,
              }}
            >
              {l}
            </motion.span>
            <motion.span
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                delay: i * LETTER_DELAY,
                times: [0, 0.1, 1],
                duration: BOX_FADE_DURATION,
                ease: "easeInOut",
              }}
              className="absolute bottom-[3px] left-[1px] right-0 top-[3px] bg-indigo-500"
            />
          </motion.span>
        ))}
      </span>
    </p>
  );
};

export default BlockInTextCard;
