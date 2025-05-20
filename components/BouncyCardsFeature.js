import React from "react";
import { motion } from "framer-motion";

export const BouncyCardsFeatures = ({ vendor }) => {
  // Add default values if vendor prop is not provided
  const defaultVendor = {
    name: "Featured Vendor",
    description: "Local artisanal products",
    features: [
      {
        title: "Quality Products",
        description: "Handcrafted with care"
      },
      {
        title: "Local Business",
        description: "Supporting our community"
      }
    ]
  };

  // Use provided vendor data or fall back to defaults
  const vendorData = vendor || defaultVendor;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 text-slate-800">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:px-8">
        <h2 className="max-w-2xl text-4xl font-bold md:text-5xl">
          {vendorData.name}
          <br />
          <span className="text-slate-400">{vendorData.description}</span>
        </h2>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {vendorData.features.map((feature, index) => (
          <BounceCard 
            key={index} 
            className={`col-span-12 ${index === 0 ? 'md:col-span-4' : 'md:col-span-8'}`}
          >
            <CardTitle>{feature.title}</CardTitle>
            <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-violet-400 to-indigo-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg]">
              <span className="block text-center font-semibold text-indigo-50">
                {feature.description}
              </span>
            </div>
          </BounceCard>
        ))}
      </div>
    </section>
  );
};

const BounceCard = ({ className, children }) => {
  return (
    <motion.div
      whileHover={{ scale: 0.95, rotate: "-1deg" }}
      className={`group relative min-h-[300px] cursor-pointer overflow-hidden rounded-2xl bg-slate-100 p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};

const CardTitle = ({ children }) => {
  return (
    <h3 className="mx-auto text-center text-3xl font-semibold">{children}</h3>
  );
};