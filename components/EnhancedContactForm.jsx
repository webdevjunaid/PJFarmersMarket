import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiBriefcase, FiPhone, FiMessageSquare } from "react-icons/fi";

const FormInput = ({ icon: Icon, label, type, name, required, className = "" }) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        required={required}
        placeholder=" "
        className={`peer w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      />
      <label className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500 transition-all peer-focus:-translate-y-[2.5rem] peer-focus:text-xs peer-focus:text-indigo-500 peer-[:not(:placeholder-shown)]:-translate-y-[2.5rem] peer-[:not(:placeholder-shown)]:text-xs">
        {label}
      </label>
    </div>
  );
};

const EnhancedContactForm = ({ formType, setFormType, handleSubmit, submitStatus }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/80 p-8 backdrop-blur-sm"
    >
      <div className="mb-8 flex gap-4">
        <motion.button
          onClick={() => setFormType('customer')}
          className={`relative flex-1 rounded-lg py-3 text-sm font-medium transition-colors ${
            formType === 'customer'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Customer
          {formType === 'customer' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg bg-indigo-500"
              style={{ zIndex: -1 }}
            />
          )}
        </motion.button>
        <motion.button
          onClick={() => setFormType('vendor')}
          className={`relative flex-1 rounded-lg py-3 text-sm font-medium transition-colors ${
            formType === 'vendor'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Vendor
          {formType === 'vendor' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg bg-indigo-500"
              style={{ zIndex: -1 }}
            />
          )}
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {formType === 'vendor' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FormInput
                icon={FiBriefcase}
                label="Business Name"
                type="text"
                name="businessName"
                required
              />
            </motion.div>
          )}
        </AnimatePresence>

        <FormInput
          icon={FiUser}
          label={formType === 'vendor' ? 'Contact Name' : 'Name'}
          type="text"
          name="name"
          required
        />

        <FormInput
          icon={FiMail}
          label="Email"
          type="email"
          name="email"
          required
        />

        <AnimatePresence mode="wait">
          {formType === 'vendor' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FormInput
                icon={FiPhone}
                label="Phone (optional)"
                type="tel"
                name="phone"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <div className="absolute left-3 top-4 text-gray-400">
            <FiMessageSquare size={18} />
          </div>
          <textarea
            name="message"
            required
            rows="4"
            placeholder=" "
            className="peer w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <label className="pointer-events-none absolute left-10 top-4 text-sm text-gray-500 transition-all peer-focus:-translate-y-[2.25rem] peer-focus:text-xs peer-focus:text-indigo-500 peer-[:not(:placeholder-shown)]:-translate-y-[2.25rem] peer-[:not(:placeholder-shown)]:text-xs">
            Message
          </label>
        </div>

        {submitStatus.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}
          >
            {submitStatus.message}
          </motion.div>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative w-full overflow-hidden rounded-lg bg-indigo-500 py-3 text-sm font-medium text-white transition-transform hover:bg-indigo-600"
        >
          <span className="relative z-10">Send Message</span>
          <motion.div
            className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 transition-opacity group-hover:opacity-100"
            initial={false}
            animate={{ scale: [0.8, 1.2], rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
        </motion.button>
      </form>
    </motion.div>
  );
};

export default EnhancedContactForm;