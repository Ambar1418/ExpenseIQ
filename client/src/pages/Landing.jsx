import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Zap, Shield, TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-white overflow-hidden select-none font-sans">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2.5 text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">
          <PieChart className="text-indigo-500" size={28} />
          SpendSense<span className="text-white">AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm hidden sm:inline-block">Log in</Link>
          <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:shadow-[0_0_30px_rgba(79,70,229,0.55)] hover:scale-102 flex items-center gap-1">
            Get Started <ChevronRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden min-h-[80vh] flex items-center justify-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[850px] h-[850px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none select-none z-0" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none select-none z-0" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-wide mb-8 inline-flex items-center gap-1.5 shadow-sm">
              <Zap size={14} className="fill-indigo-300 text-indigo-300 animate-pulse" /> AI-Powered Expense Analytics
            </span>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl">
              Take complete control <br />
              of your spending with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-emerald-400">
                Advanced AI
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 mb-11 max-w-2xl mx-auto leading-relaxed">
              Snap a screenshot of your online payment or utility app. Our advanced AI instantly pulls, sorts, and visualizes your expenses in seconds.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Link to="/signup" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:shadow-[0_0_30px_rgba(79,70,229,0.55)] hover:scale-103">
                Try SpendSense Free <ChevronRight size={18} />
              </Link>
              <Link to="/login" className="flex items-center gap-2 border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700 text-slate-200 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200">
                Sign in to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-[#0b0f1d] border-t border-slate-800/40 py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-18">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">Enterprise spending, simplified</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base">Intuitive automated scanning with built-in financial breakdown.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              { icon: <Zap className="text-yellow-400" size={28} />, title: "Instant AI Extraction", desc: "Just upload an image of GPay, PhonePe, or utility payment receipts. We do the transcription." },
              { icon: <TrendingUp className="text-emerald-400" size={28} />, title: "Category Intelligence", desc: "Automated Llama AI categorization intelligently structures spends into distinct budgets." },
              { icon: <Shield className="text-indigo-400" size={28} />, title: "Secure Data Isolation", desc: "Information stays completely isolated and encrypted. We respect and secure your records." }
            ].map((feature, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-slate-900/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/60 hover:border-indigo-500/50 transition-all duration-300 group hover:bg-slate-900/50 hover:shadow-[0_4px_25px_rgba(0,0,0,0.25)] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#070913] group-hover:bg-indigo-950/40 rounded-xl flex items-center justify-center mb-6 shadow-inner border border-slate-800 group-hover:border-indigo-800/60 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

