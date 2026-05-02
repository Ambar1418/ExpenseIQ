import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#070913] text-white overflow-hidden select-none flex flex-col">
      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[600px] bg-indigo-600/12 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Content centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center max-w-lg"
        >
          {/* Logo Mark */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-10"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[18px] flex items-center justify-center shadow-[0_8px_40px_rgba(99,102,241,0.3)] rotate-3 hover:rotate-0 transition-transform duration-500">
              <PieChart className="text-white" size={30} strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* App Name */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-semibold tracking-[0.2em] uppercase text-indigo-400/80 mb-6 font-[Inter]"
          >
            ExpenseIQ
          </motion.p>

          {/* Hero Headline */}
          <h1 className="text-[2.5rem] sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.1] mb-5 text-white"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            Your money,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300">
              made simple.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[1.05rem] text-slate-400 leading-relaxed mb-12 font-normal tracking-[-0.01em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Track expenses, scan receipts, and get AI-powered insights — effortlessly.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2.5 bg-white text-[#070913] px-8 py-4 rounded-2xl font-semibold text-[0.95rem] transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </motion.div>

          {/* Sign in link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/login" className="mt-8 inline-block text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200 tracking-[-0.01em]">
              Already have an account? <span className="text-indigo-400/90 font-medium">Sign in</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
