import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ShuffleHero = () => {
  return (
    <section className="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-6xl mx-auto">
      <div>
        <span className="block mb-4 text-md md:text-lg text-indigo-500 font-medium">
          Welcome to the
        </span>
        <h3 className="text-4xl md:text-6xl font-semibold">
          Port Jefferson Farmers Market
          <br />
          <span className="text-indigo-500">
            Now Online
          </span>
        </h3>
        <p className="text-base md:text-lg text-slate-700 my-4 md:my-6">
          Shop local, support local, and enjoy the best of what Port Jefferson has to offer.
        </p>
        <Link href="/products" className="inline-block">
          <button className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-all hover:bg-indigo-600 active:scale-95">
            Shop Now
          </button>
        </Link>
      </div>
      <ShuffleGrid />
    </section>
  );
};

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

const squareData = [
  {
    id: 1,
    src: "/gallery/IMG_5930.jpg",
  },
  {
    id: 2,
    src: "/gallery/IMG_5931.jpg",
  },
  {
    id: 3,
    src: "/gallery/IMG_5932.jpg", 
  },
  {
    id: 4,
    src: "/gallery/IMG_5933.jpg",
  },
  {
    id: 5,
    src: "/gallery/IMG_5934.jpg",
  },
  {
    id: 6,
    src: "/gallery/IMG_5949.jpg",
  },
  {
    id: 7,
    src: "/gallery/IMG_5936.jpg",
  },
  {
    id: 8,
    src: "/gallery/IMG_5937.jpg",
  },
  {
    id: 9,
    src: "/gallery/IMG_5938.jpg",
  },
  {
    id: 10,
    src: "/gallery/IMG_5939.jpg",
  },
  {
    id: 11,
    src: "/gallery/IMG_5940.jpg",
  },
  {
    id: 12,
    src: "/gallery/IMG_5941.jpg",
  },
  {
    id: 13,
    src: "/gallery/IMG_5942.jpg",
  },
  {
    id: 14,
    src: "/gallery/IMG_5943.jpg",
  },
  {
    id: 15,
    src: "/gallery/IMG_5944.jpg",
  },
  {
    id: 16,
    src: "/gallery/IMG_5945.jpg",
  },
];

const generateSquares = () => {
  return shuffle(squareData).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
      }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [squares, setSquares] = useState(generateSquares());

  useEffect(() => {
    shuffleSquares();

    return () => clearTimeout(timeoutRef.current);
  }, []);

  const shuffleSquares = () => {
    setSquares(generateSquares());

    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-[450px] gap-1">
      {squares.map((sq) => sq)}
    </div>
  );
};

export default ShuffleHero;