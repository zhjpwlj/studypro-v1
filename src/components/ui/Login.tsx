
import React, { useState } from 'react';
import { signIn, signUp } from '../../services/supabaseService';
import { Loader2, MailCheck, Globe, KeyRound } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Language } from '../../types';


interface LoginProps {
  onEnterDemoMode: () => void;
}

const Login: React.FC<LoginProps> = ({ onEnterDemoMode }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  
  const [language, setLanguage] = usePersistentState<Language>('focusflow-language', 'en');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setShowConfirmationMessage(false);

    try {
        if (isSignUp) {
            const { data, error: authError } = await signUp(email, password);
            if (authError) throw authError;
            
            if (data.user && !data.session) {
                setShowConfirmationMessage(true);
                setLoading(false);
            } else if (data.session) {
                // AuthGate listener will handle reload
            }
        } else {
            const { data, error: authError } = await signIn(email, password);
            if (authError) throw authError;
            
            if (!data.session) {
                setLoading(false);
            }
            // AuthGate listener will handle reload
        }
    } catch (err: unknown) {
        console.error("Authentication Error:", err);
        let errorMessage = 'An unexpected error occurred.';
        
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        }
        
        if (errorMessage.toLowerCase().includes('rate limit')) {
            errorMessage = 'Too many requests. Please wait a moment.';
        } else if (errorMessage === 'Failed to fetch') {
            errorMessage = 'Network error. Please check your connection.';
        } else if (errorMessage.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password.';
        }

        setError(errorMessage);
        setLoading(false);
    }
  };

  if (showConfirmationMessage) {
    return (
        <div className="w-full max-w-sm mx-auto bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-3xl shadow-glass overflow-hidden animate-fade-in p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                 <MailCheck size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                We&apos;ve sent a confirmation link to <br/><strong className="text-slate-800 dark:text-white">{email}</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click the link in the email to activate your account and start your flow.</p>
            <div className="mt-4 text-left text-[10px] p-2 bg-slate-500/10 rounded-md border border-slate-500/20 text-slate-500 dark:text-slate-400">
                <strong>Note:</strong> If you don&apos;t see the email, check your spam folder. For developers, ensure your SMTP provider is configured in Supabase Auth settings for email delivery to work.
            </div>
            <button 
                onClick={() => setShowConfirmationMessage(false)} 
                className="mt-6 text-sm text-[var(--accent-color)] hover:underline"
            >
                Back to Sign In
            </button>
        </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-3xl shadow-glass overflow-hidden animate-fade-in transition-all duration-500">
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-color)] to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">S</div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">StudyPro</h2>
              </div>
              <div className="relative group">
                <Globe size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-accent transition-colors"/>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="jp">日本語</option>
                  <option value="cn">中文</option>
                </select>
              </div>
            </div>

            <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl flex text-sm mb-6 relative">
                <div 
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 shadow-sm rounded-lg transition-all duration-300 ease-out"
                    style={{ left: isSignUp ? 'calc(50% + 2px)' : '4px' }}
                ></div>
                <button 
                    type="button"
                    onClick={() => { setIsSignUp(false); setError(null); }} 
                    className={`flex-1 py-2 text-center relative z-10 transition-colors ${!isSignUp ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Sign In
                </button>
                <button 
                    type="button"
                    onClick={() => { setIsSignUp(true); setError(null); }} 
                    className={`flex-1 py-2 text-center relative z-10 transition-colors ${isSignUp ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white dark:focus:bg-black/40 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white"
                    />
                </div>
                <div>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="Password"
                        className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white dark:focus:bg-black/40 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white"
                    />
                </div>
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-center text-red-600 dark:text-red-400 font-medium">{error}</div>}
                
                <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-[var(--accent-color)] to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Create Account' : <><KeyRound size={18}/> Sign In</>)}
                </button>
            </form>

            <div className="relative flex py-6 items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-white/10"></div>
                <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Or continue with</span>
                <div className="flex-grow border-t border-gray-300 dark:border-white/10"></div>
            </div>

            <button type="button" onClick={onEnterDemoMode} className="w-full py-2.5 bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all text-sm">
                Enter Demo Mode
            </button>
        </div>
    </div>
  );
};

export default Login;
