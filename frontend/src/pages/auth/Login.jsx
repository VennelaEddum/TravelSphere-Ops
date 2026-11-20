import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import { DEMO_ACCOUNTS } from '../../api/authApi';
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  MapPin,
  Layers,
  HelpCircle,
  UserCheck,
  User
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, loading, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Where to redirect after login
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Error handled by AuthContext
    }
  };

  // Quick Demo Account Click Handler
  const handleQuickDemo = async (roleName) => {
    const demo = DEMO_ACCOUNTS[roleName];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
      setFieldErrors({});
      try {
        await loginAsDemo(roleName);
        navigate(from, { replace: true });
      } catch (err) {
        console.error('Demo login failed', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden min-h-[660px]">
        
        {/* ========================================================= */}
        {/* LEFT SECTION – TravelSphere Ops Branding & Visual        */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden bg-[#142B4A]">
          {/* High-Resolution Scenic Tourism Background with Mountains & Destinations */}
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 transform scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=85')`
            }}
          />

          {/* Deep Navy Gradient Overlay for optimal readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#142B4A]/95 via-[#0C1B30]/90 to-[#0F9D9A]/40 pointer-events-none" />

          {/* Top subtle glow accents */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#0F9D9A]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#142B4A]/40 blur-3xl pointer-events-none" />

          {/* Official TravelSphere Ops Brand Logo */}
          <div className="relative z-10">
            <div className="inline-flex items-center p-3 px-4.5 rounded-2xl bg-white shadow-2xl border border-white/80 mb-2">
              <img
                src="/assets/travelsphere-ops-logo.png"
                alt="TRAVELSPHERE OPS – Smart Franchise Management & Performance Intelligence"
                className="h-12 w-auto max-w-[280px] sm:max-w-[340px] object-contain"
              />
            </div>

            {/* Main Value Proposition Headings */}
            <div className="mt-8 lg:mt-12">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2DD4BF] bg-[#0F9D9A]/15 px-3 py-1 rounded-full border border-[#0F9D9A]/30 mb-3">
                <Globe2 className="w-3.5 h-3.5" /> Enterprise Tourism Intelligence
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Manage Every Journey.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-teal-300 to-white">
                  Empower Every Franchise.
                </span>
              </h1>
              <p className="mt-4 text-sm text-slate-200/90 leading-relaxed max-w-lg">
                Consolidated operations platform designed to orchestrate territorial franchises, workforce tasks, and booking performance.
              </p>
            </div>
          </div>

          {/* Three Feature Highlights */}
          <div className="relative z-10 my-8 space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 hover:border-[#0F9D9A]/50 transition-colors flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-[#0F9D9A]/20 text-[#2DD4BF] shrink-0 border border-[#0F9D9A]/30">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Centralized Franchise Management
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Real-time territorial monitoring, branch governance, and operational compliance.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 hover:border-[#0F9D9A]/50 transition-colors flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-[#0F9D9A]/20 text-[#2DD4BF] shrink-0 border border-[#0F9D9A]/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Finance & Branch Performance
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Daily target milestones, cancellation surges, and AI-driven growth recommendations.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 hover:border-[#0F9D9A]/50 transition-colors flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-[#0F9D9A]/20 text-[#2DD4BF] shrink-0 border border-[#0F9D9A]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Strict 4-Level Data Isolation
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Role-based access boundaries protecting Head Office, Franchise, Branch, and Staff records.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Subtext */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between">
            <span>Enterprise Security Guaranteed</span>
            <span className="font-semibold text-white">TravelSphere Ops &bull; v2.0</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SECTION – Login Form & Quick Access                 */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 p-6 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header branding */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] border border-slate-200/90 p-1 flex items-center justify-center shadow-xs">
                  <img
                    src="/assets/travelsphere-ops-emblem.png"
                    alt="TRAVELSPHERE OPS Emblem"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-sm font-black tracking-tight text-[#142B4A] uppercase">
                    TravelSphere <span className="text-[#0F9D9A]">Ops</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5 font-semibold">
                    Franchise Operations Portal
                  </span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sign in to access your authorized franchise workspace.
              </p>
            </div>

            {/* Error banner if authentication fails */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142B4A] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                    }}
                    placeholder="name@travelsphere.demo"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-[#F5F7FA] border rounded-xl text-sm text-[#142B4A] placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.email
                        ? 'border-rose-300 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-[#0F9D9A] focus:border-[#0F9D9A]'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#142B4A]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs font-semibold text-[#0F9D9A] hover:text-[#0C8481] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-[#F5F7FA] border rounded-xl text-sm text-[#142B4A] placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.password
                        ? 'border-rose-300 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-[#0F9D9A] focus:border-[#0F9D9A]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember Me and Security Note */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#0F9D9A] border-slate-300 rounded focus:ring-[#0F9D9A] accent-[#0F9D9A]"
                  />
                  <span>Remember my credentials</span>
                </label>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Bcrypt 256-bit
                </span>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-[#142B4A] hover:bg-[#1E3A5F] text-white py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Session...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to TravelSphere Ops</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Link to Register Page */}
              <div className="pt-3 text-center">
                <p className="text-xs text-slate-500">
                  New franchise partner or operations lead?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-[#0F9D9A] hover:text-[#0C8481] hover:underline transition-colors"
                  >
                    Submit Registration Request &rarr;
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* ======================================================= */}
          {/* Quick Role-Switching Buttons for Evaluator Review        */}
          {/* 4 Application Roles (Super Admin, Owner, Manager, Staff) */}
          {/* ======================================================= */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#142B4A]">
                Quick Demo Accounts (Evaluation)
              </span>
              <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 4 Roles
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Click any role below to prefill credentials and explore that role's interface:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Super Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemo(ROLES.SUPER_ADMIN)}
                className="p-2 rounded-xl border border-slate-200 bg-[#F5F7FA] hover:bg-[#EAF4FA] hover:border-[#0F9D9A] text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142B4A] group-hover:text-[#0F9D9A] truncate">
                    Super Admin
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Head Office
                </p>
                <span className="text-[8px] font-mono text-slate-400 block mt-1 truncate">
                  admin@travelsphere.demo
                </span>
              </button>

              {/* Franchise Owner */}
              <button
                type="button"
                onClick={() => handleQuickDemo(ROLES.FRANCHISE_OWNER)}
                className="p-2 rounded-xl border border-slate-200 bg-[#F5F7FA] hover:bg-[#EAF4FA] hover:border-[#0F9D9A] text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142B4A] group-hover:text-[#0F9D9A] truncate">
                    Franchise Owner
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  West Coast
                </p>
                <span className="text-[8px] font-mono text-slate-400 block mt-1 truncate">
                  owner@travelsphere.demo
                </span>
              </button>

              {/* Branch Manager */}
              <button
                type="button"
                onClick={() => handleQuickDemo(ROLES.BRANCH_MANAGER)}
                className="p-2 rounded-xl border border-slate-200 bg-[#F5F7FA] hover:bg-[#EAF4FA] hover:border-[#0F9D9A] text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142B4A] group-hover:text-[#0F9D9A] truncate">
                    Branch Manager
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Mumbai Hub
                </p>
                <span className="text-[8px] font-mono text-slate-400 block mt-1 truncate">
                  manager@travelsphere.demo
                </span>
              </button>

              {/* Staff */}
              <button
                type="button"
                onClick={() => handleQuickDemo(ROLES.STAFF)}
                className="p-2 rounded-xl border border-slate-200 bg-[#F5F7FA] hover:bg-[#EAF4FA] hover:border-[#0F9D9A] text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142B4A] group-hover:text-[#0F9D9A] truncate">
                    Staff
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Travel Specialist
                </p>
                <span className="text-[8px] font-mono text-slate-400 block mt-1 truncate">
                  staff@travelsphere.demo
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#142B4A]/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 mb-2 text-[#142B4A]">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 p-0.5 flex items-center justify-center shrink-0">
                <img src="/assets/travelsphere-ops-emblem.png" alt="TRAVELSPHERE OPS" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-base font-bold">TravelSphere Ops Account Recovery</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              For franchise security compliance, password credentials for TravelSphere Ops accounts are managed directly by your Head Office Administrator.
            </p>
            <div className="p-3.5 bg-[#F5F7FA] rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5 mb-5">
              <p><strong>Admin Support:</strong> support@travelsphere.ops</p>
              <p><strong>Franchise Helpdesk:</strong> 1800-TRAVELSPHERE</p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="navy"
                size="sm"
                onClick={() => setForgotPasswordOpen(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
