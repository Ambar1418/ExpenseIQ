import { useContext } from 'react';
import { User, Mail, Settings, Moon, Sun, LogOut } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none pb-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Profile & Settings <Settings className="text-indigo-500 dark:text-indigo-400" size={22} />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your account credentials and app preferences</p>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300 space-y-8">
        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border-2 border-indigo-100/50 dark:border-indigo-900/40 flex items-center justify-center text-4xl text-indigo-600 dark:text-indigo-300 font-bold shadow-inner">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{user?.name || 'User'}</h2>
            <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-sm">
              <Mail size={15} /> {user?.email}
            </p>
            <span className="mt-2.5 inline-block px-3 py-1 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100/40 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wide">
              {user?.role || 'User'} Plan
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-7 space-y-5">
          <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">App Preferences</h3>
          
          <div className="flex items-center justify-between p-4 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/40 dark:hover:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/40 rounded-xl transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:scale-105 transition-transform duration-200">
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">Dark Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle interface appearance</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 border border-transparent ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-7' : ''}`}></div>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-7">
          <button
            onClick={logout}
            className="w-full py-3.5 bg-red-50/60 hover:bg-red-100/60 dark:bg-red-950/30 dark:hover:bg-red-950/40 border border-red-100/40 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:text-red-700 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 hover:scale-102"
          >
            <LogOut size={18} />
            Sign Out from Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

