import React, { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { FiMousePointer } from "react-icons/fi";
import Link from "next/link";

const Example = ({ vendor }) => {
  return (
    <div className="grid w-full place-content-center bg-gradient-to-br from-indigo-500 to-violet-500 px-4 py-12 text-slate-900 rounded-xl">
      <TiltCard vendor={vendor} />
    </div>
  );
};

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = 32.5 / 2;

const TiltCard = ({ vendor }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x);
  const ySpring = useSpring(y);
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;
    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={`/vendors/${vendor.slug}`}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          transform,
        }}
        className="relative h-96 w-72 rounded-xl bg-gradient-to-br from-indigo-300 to-violet-300 cursor-pointer"
      >
        <div
          style={{
            transform: "translateZ(75px)",
            transformStyle: "preserve-3d",
            backgroundImage: `url(${vendor?.backgroundImage || ''})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="absolute inset-4 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="absolute inset-0 grid place-content-center">
            <div className="max-w-[200px] max-h-[200px] bg-white/30 p-4 rounded-lg backdrop-blur-lg">
              <h3 className="text-xl font-bold text-white text-center mb-2">{vendor.name}</h3>
              <p className="text-white/90 text-center text-sm">{vendor.description}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default TiltCard;