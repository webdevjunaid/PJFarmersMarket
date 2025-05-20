import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Card = ({ card }) => {
  const handle = card.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      key={card.id}
      className="relative h-[450px] w-full overflow-hidden bg-neutral-200 rounded-xl"
    >
      <div
        style={{
          backgroundImage: `url(${card.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
      ></div>
      <Link
        href={`/vendors/${handle}`}
        className="absolute inset-0 z-10 grid place-content-center"
      >
        <img
          src={card.logo}
          alt={card.name}
          className="max-w-[250px] max-h-[250px] object-contain bg-white/30 p-4 rounded-lg backdrop-blur-lg transition-transform duration-300 hover:scale-105"
        />
      </Link>
    </div>
  );
};

export default function Vendors() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchVendors = async () => {
      const { data: vendors, error } = await supabase
        .from("vendor")
        .select("*");

      if (error) {
        console.error("Error fetching vendors:", error);
        return;
      }

      setVendors(vendors);
    };
    fetchVendors();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <h1 className="text-3xl font-bold text-center text-indigo-500 mt-8 mb-12">
          Our Vendors
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Card
              key={vendor.id}
              card={{
                id: vendor.id,
                name: vendor.name,
                url: vendor.backgroundImage,
                logo: vendor.logo,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
