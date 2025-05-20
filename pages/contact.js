import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import EnhancedContactForm from '@/components/EnhancedContactForm';
import { FiMail, FiMapPin, FiPhone, FiInstagram, FiFacebook } from 'react-icons/fi';

export default function Contact() {
  const [formType, setFormType] = useState('customer');
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, type: formType }),
      });

      if (response.ok) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Thank you for your message! We\'ll get back to you soon.' 
        });
        e.target.reset();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again.' 
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50">
      <Navbar />
      
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-indigo-500/[0.025] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-indigo-600 mb-4">Get in Touch</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're a customer with questions or a vendor interested in joining our market,
              we'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Image and Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="sticky top-24">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 space-y-6 mb-8">
                  <div className="flex items-center gap-4">
                    <FiMapPin className="text-2xl text-indigo-500" />
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p className="text-gray-600">101 East Broadway, Port Jefferson, NY 11777</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <FiPhone className="text-2xl text-indigo-500" />
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-gray-600">(631) 555-0123</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <FiMail className="text-2xl text-indigo-500" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-gray-600">info@pjfarmersmarket.com</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <a 
                      href="#" 
                      className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white hover:opacity-90 transition-opacity"
                    >
                      <FiInstagram size={24} />
                    </a>
                    <a 
                      href="#" 
                      className="p-2 rounded-lg bg-blue-600 text-white hover:opacity-90 transition-opacity"
                    >
                      <FiFacebook size={24} />
                    </a>
                  </div>
                </div>

                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src="/gallery/IMG_5953.jpg"
                    alt="Farmers Market"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Column - Contact Form */}
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-indigo-600 mb-3">Business Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex justify-between">
                    <span>Sunday (Market Day)</span>
                    <span>9:00 AM - 2:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Office Hours (Mon-Fri)</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </p>
                </div>
              </motion.div>

              <EnhancedContactForm
                formType={formType}
                setFormType={setFormType}
                handleSubmit={handleSubmit}
                submitStatus={submitStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}