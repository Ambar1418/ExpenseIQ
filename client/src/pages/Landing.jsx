import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#070913] text-white overflow-hidden select-none font-sans flex flex-col">
      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[700px] bg-indigo-500/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Content centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <PieChart className="text-indigo-400" size={28} />
            </div>
            <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">
              ExpenseIQ
            </span>
          </div>

          {/* 2 Lines */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Smart Expense Tracking
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-md leading-relaxed">
            Upload receipts, track spending, and get AI-powered financial insights — all in one place.
          </p>

          {/* Get Started Button */}
          <Link
            to="/signup"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_25px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] hover:scale-105 active:scale-95"
          >
            Get Started <ChevronRight size={20} />
          </Link>

          {/* Already have account */}
          <Link to="/login" className="mt-6 text-slate-500 hover:text-slate-300 text-sm transition-colors">
            Already have an account? <span className="text-indigo-400 font-medium">Sign in</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
