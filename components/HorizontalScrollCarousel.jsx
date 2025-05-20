import { motion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const Example = () => {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-center text-2xl md:text-3xl font-semibold">
        <span className="text-indigo-500">
          Our Featured Vendors
        </span>
      </div>
      <HorizontalScrollCarousel />
    </div>
  );
};

const HorizontalScrollCarousel = () => {
  return (
    <section className="relative overflow-x-auto">
      <div className="flex gap-4 p-4">
        {cards.map((card) => {
          return <Card card={card} key={card.id} />;
        })}
      </div>
    </section>
  );
};

const Card = ({ card }) => {
  const slug = card.name.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div
      key={card.id}
      className="group relative h-[450px] w-[450px] flex-shrink-0 overflow-hidden bg-neutral-200"
    >
      <div
        style={{
          backgroundImage: `url(${card.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
      ></div>
      <Link href={`/vendors/${slug}`} className="absolute inset-0 z-10 grid place-content-center">
        <img 
          src={card.logo}
          alt={card.name}
          className="max-w-[250px] max-h-[250px] object-contain bg-white/30 p-4 rounded-lg backdrop-blur-lg transition-transform duration-300 hover:scale-105"
        />
      </Link>
    </div>
  );
};

export default Example;
const cards = [
  {
    url: "vendors/msf_bg.jpg",
    logo: "vendors/montauk_smoked_fish.png",
    name: "Montauk Smoked Fish",
    id: 1,
  },
  {
    url: "vendors/IMG_5955.jpg",
    logo: "vendors/malbec_logo.png",
    name: "Malbec",
    id: 2,
  },
  {
    url: "vendors/IMG_5956.jpg",
    logo: "vendors/oldtymer_logo.png",
    name: "Vendor 3",
    id: 3,
  },
  {
    url: "vendors/IMG_5957.jpg",
    logo: "vendors/vendor4_logo.png",
    name: "Vendor 4",
    id: 4,
  },
  {
    url: "vendors/IMG_5958.jpg",
    logo: "vendors/vendor5_logo.png",
    name: "Vendor 5",
    id: 5,
  },
  {
    url: "vendors/IMG_5959.jpg",
    logo: "vendors/vendor6_logo.png",
    name: "Vendor 6",
    id: 6,
  },
  {
    url: "vendors/IMG_5960.jpg",
    logo: "vendors/vendor7_logo.png",
    name: "Vendor 7",
    id: 7,
  },
];
