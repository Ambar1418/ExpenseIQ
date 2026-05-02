import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { LayoutDashboard, Receipt, PieChart, UploadCloud, Target, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <Receipt size={20} /> },
    { name: 'Upload', path: '/upload', icon: <UploadCloud size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <PieChart size={20} /> },
    { name: 'Budgets', path: '/budget', icon: <Target size={20} /> },
    { name: 'Profile', path: '/profile', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-dark text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 pb-20 md:pb-0 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-18 bg-white/80 dark:bg-[#0A0F1C]/80 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-around items-center px-2 z-50 md:hidden backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full text-[10px] sm:text-xs transition-all duration-200
                ${isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 scale-105' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40'}`}>
                {item.icon}
              </div>
              <span className="mt-0.5 transform scale-95 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

