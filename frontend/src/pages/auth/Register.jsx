import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROLES } from '../../utils/rolePermissions';
import { registerUser } from '../../api/authApi';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Building2,
  MapPin,
  Building,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const Register = () => {
  const navigate = useNavigate();

  // Form State
  const [accountType, setAccountType] = useState(ROLES.FRANCHISE_OWNER); // 'Franchise Owner' | 'Franchise Manager'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    orgName: '',
    branchName: '',
    location: '',
    licenseType: 'Standard Unit Franchise',
    authCode: '',
    agreeTerms: false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Field change helper
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (serverError) setServerError('');
  };

  // Validation rules
  const validateForm = () => {
    const errors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Full Name must be at least 3 characters';
    }

    // 2. Email Address
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // 3. Indian Mobile Number (10 digits starting with 6-9)
    const cleanPhone = formData.phone.replace(/[\s\-+]/g, '');
    const phoneToTest = cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? cleanPhone.slice(2)
      : cleanPhone;

    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(phoneToTest)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    // 4. Conditional fields by Account Type
    if (accountType === ROLES.FRANCHISE_OWNER) {
      if (!formData.orgName.trim()) {
        errors.orgName = 'Business or Organization Name is required';
      }
      if (!formData.branchName.trim()) {
        errors.branchName = 'Proposed Franchise / Branch Name is required';
      }
      if (!formData.location.trim()) {
        errors.location = 'Business Location / City is required';
      }
    } else if (accountType === ROLES.BRANCH_MANAGER || accountType === 'Branch Manager' || accountType === 'Franchise Manager') {
      if (!formData.branchName.trim()) {
        errors.branchName = 'Associated Franchise Branch is required';
      }
      if (!formData.orgName.trim()) {
        errors.orgName = 'Organization Name is required';
      }
      if (!formData.authCode.trim()) {
        errors.authCode = 'Manager Invitation / Authorization Reference is required';
      }
    }

    // 5. Password Complexity (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // 6. Confirm Password Match
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // 7. Terms & Conditions
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must accept the TravelSphere Ops Franchise Terms and Policies';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        accountType: accountType,
        orgName: formData.orgName.trim(),
        branchName: formData.branchName.trim(),
        location: formData.location.trim() || 'India',
        licenseType: formData.licenseType,
        authCode: formData.authCode.trim(),
        password: formData.password
      };

      const result = await registerUser(payload);
      setSubmissionResult({
        ...result,
        fullName: formData.fullName,
        email: formData.email,
        accountType: accountType,
        branchName: formData.branchName || formData.orgName
      });
    } catch (err) {
      setServerError(err.message || 'Registration request could not be processed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden min-h-[700px]">
        
        {/* ========================================================= */}
        {/* LEFT SECTION – TravelSphere Ops Branding & Ecosystem     */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 relative flex flex-col justify-between p-8 sm:p-10 text-white overflow-hidden bg-[#142B4A]">
          {/* Scenic Travel Photography Background */}
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 transform scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=85')`
            }}
          />

          {/* Deep Navy Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#142B4A]/95 via-[#0C1B30]/90 to-[#0F9D9A]/40 pointer-events-none" />

          {/* Glow Accents */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#0F9D9A]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#142B4A]/40 blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10">
            <div className="inline-flex items-center p-3 px-4.5 rounded-2xl bg-white shadow-2xl border border-white/80 mb-6">
              <img
                src="/assets/travelsphere-ops-logo.png"
                alt="TRAVELSPHERE OPS – Smart Franchise Management & Performance Intelligence"
                className="h-11 w-auto max-w-[260px] sm:max-w-[320px] object-contain"
              />
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2DD4BF] bg-[#0F9D9A]/20 px-3 py-1 rounded-full border border-[#0F9D9A]/30 mb-3">
                Franchise Partner Onboarding
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Start Your Journey With TravelSphere Ops
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-200/90 leading-relaxed">
                Join our intelligent franchise management ecosystem. Empowering tourism entrepreneurs and branch leaders with automated analytics and operational tools.
              </p>
            </div>
          </div>

          {/* Core Highlights */}
          <div className="relative z-10 my-6 space-y-3">
            <div className="p-3 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#0F9D9A]/20 text-[#2DD4BF] shrink-0 border border-[#0F9D9A]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Controlled Head Office Authorization
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Every franchise application is reviewed by our administration team before accessing regional data.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#0F9D9A]/20 text-[#2DD4BF] shrink-0 border border-[#0F9D9A]/30">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Territorial Branch Governance
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Strict isolation of confidential branch revenue, bookings, and customer databases.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#0F9D9A]/20 text-[#2DD4BF] shrink-0 border border-[#0F9D9A]/30">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Autonomous Operational Agents
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Real-time cancellation tracking, dynamic inventory slot forecasting, and SLA verification.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Subtext */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Enterprise Franchise Security</span>
            <span className="font-semibold text-slate-300">TravelSphere Ops &bull; v2.0</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SECTION – Registration Form / Confirmation View   */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white overflow-y-auto max-h-[85vh] lg:max-h-none">
          {submissionResult ? (
            /* ======================================================= */
            /* SUCCESS CONFIRMATION SCREEN                             */
            /* ======================================================= */
            <div className="my-auto py-6 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Status: Under Review
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
                  Registration Request Submitted!
                </h2>
                <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thank you for choosing TravelSphere Ops. Your registration request has been submitted successfully. Our administration team will review your details and notify you about the approval status.
                </p>
              </div>

              {/* Submission Summary Ticket */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F5F7FA] border border-slate-200 text-xs text-left space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <img
                    src="/assets/travelsphere-ops-logo.png"
                    alt="TRAVELSPHERE OPS"
                    className="h-6 w-auto object-contain"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Official Application
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Submission Reference:</span>
                  <span className="font-mono font-bold text-teal-700">{submissionResult.referenceId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-900">{submissionResult.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{submissionResult.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Account Type:</span>
                  <span className="font-semibold text-[#0F9D9A]">{submissionResult.accountType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Branch / Organization:</span>
                  <span className="font-semibold text-slate-800">{submissionResult.branchName}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 max-w-md mx-auto text-xs text-amber-800 flex items-start gap-2.5 text-left">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  For franchise security compliance, pending accounts cannot sign in until authorized by the Head Office Super Admin. You will receive activation instructions upon approval.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowLeft}
                  onClick={() => navigate('/login')}
                  className="shadow-lg shadow-teal-600/20"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* REGISTRATION FORM VIEW                                 */
            /* ======================================================= */
            <div>
              {/* Header with official emblem */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] border border-slate-200 p-1 flex items-center justify-center">
                    <img
                      src="/assets/travelsphere-ops-emblem.png"
                      alt="TRAVELSPHERE OPS"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-tight text-[#142B4A] uppercase">
                      TravelSphere <span className="text-[#0F9D9A]">Ops</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">
                      New Account Request
                    </span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#142B4A] tracking-tight">
                  Create Your Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit your franchise registration request for review.
                </p>
              </div>

              {/* Server or Submission Error Notice */}
              {serverError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Account Type Selector (Super Admin is strictly excluded) */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142B4A] mb-1.5">
                  Select Account Type *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAccountType(ROLES.FRANCHISE_OWNER)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      accountType === ROLES.FRANCHISE_OWNER
                        ? 'border-[#0F9D9A] bg-[#EAF4FA] shadow-sm'
                        : 'border-slate-200 bg-[#F5F7FA] hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#142B4A]">Franchise Owner</span>
                      <Building2 className={`w-3.5 h-3.5 ${accountType === ROLES.FRANCHISE_OWNER ? 'text-[#0F9D9A]' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      Outlet Licensee & Regional Principal
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType(ROLES.BRANCH_MANAGER)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      accountType === ROLES.BRANCH_MANAGER
                        ? 'border-[#0F9D9A] bg-[#EAF4FA] shadow-sm'
                        : 'border-slate-200 bg-[#F5F7FA] hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#142B4A]">Branch Manager</span>
                      <Briefcase className={`w-3.5 h-3.5 ${accountType === ROLES.BRANCH_MANAGER ? 'text-[#0F9D9A]' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      Branch Operations & Bookings Desk
                    </p>
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* 1. Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        className={`w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                          fieldErrors.fullName
                            ? 'border-rose-300 focus:ring-rose-400'
                            : 'border-slate-200 focus:ring-[#0F9D9A]'
                        }`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="name@company.com"
                        className={`w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                          fieldErrors.email
                            ? 'border-rose-300 focus:ring-rose-400'
                            : 'border-slate-200 focus:ring-[#0F9D9A]'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* 2. Mobile Number & Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (India) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="9876543210"
                        maxLength={13}
                        className={`w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                          fieldErrors.phone
                            ? 'border-rose-300 focus:ring-rose-400'
                            : 'border-slate-200 focus:ring-[#0F9D9A]'
                        }`}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business / Organization Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.orgName}
                        onChange={(e) => handleChange('orgName', e.target.value)}
                        placeholder={accountType === ROLES.FRANCHISE_OWNER ? "e.g. Western Tours LLP" : "e.g. TravelSphere Franchises"}
                        className={`w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                          fieldErrors.orgName
                            ? 'border-rose-300 focus:ring-rose-400'
                            : 'border-slate-200 focus:ring-[#0F9D9A]'
                        }`}
                      />
                    </div>
                    {fieldErrors.orgName && (
                      <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.orgName}</p>
                    )}
                  </div>
                </div>

                {/* 3. CONDITIONAL FIELDS BASED ON ACCOUNT TYPE */}
                {accountType === ROLES.FRANCHISE_OWNER ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Proposed Franchise / Branch Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={formData.branchName}
                          onChange={(e) => handleChange('branchName', e.target.value)}
                          placeholder="e.g. Mumbai Coastal Outlet"
                          className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:outline-none focus:ring-2 ${
                            fieldErrors.branchName
                              ? 'border-rose-300 focus:ring-rose-400'
                              : 'border-slate-200 focus:ring-[#0F9D9A]'
                          }`}
                        />
                      </div>
                      {fieldErrors.branchName && (
                        <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.branchName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Business Location / City *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          placeholder="e.g. Mumbai, Maharashtra"
                          className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:outline-none focus:ring-2 ${
                            fieldErrors.location
                              ? 'border-rose-300 focus:ring-rose-400'
                              : 'border-slate-200 focus:ring-[#0F9D9A]'
                          }`}
                        />
                      </div>
                      {fieldErrors.location && (
                        <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.location}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Associated Franchise Branch *
                      </label>
                      <select
                        value={formData.branchName}
                        onChange={(e) => handleChange('branchName', e.target.value)}
                        className={`w-full px-3 py-2 bg-white border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:outline-none focus:ring-2 ${
                          fieldErrors.branchName
                            ? 'border-rose-300 focus:ring-rose-400'
                            : 'border-slate-200 focus:ring-[#0F9D9A]'
                        }`}
                      >
                        <option value="">Select Branch</option>
                        <option value="Mumbai">Mumbai Outlet</option>
                        <option value="Pune">Pune Outlet</option>
                        <option value="Nagpur">Nagpur Outlet</option>
                        <option value="Bengaluru">Bengaluru Outlet</option>
                        <option value="Hyderabad">Hyderabad Outlet</option>
                      </select>
                      {fieldErrors.branchName && (
                        <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.branchName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Authorization / Invitation Reference *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Key className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={formData.authCode}
                          onChange={(e) => handleChange('authCode', e.target.value)}
                          placeholder="e.g. INV-MUM-2026"
                          className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:outline-none focus:ring-2 ${
                            fieldErrors.authCode
                              ? 'border-rose-300 focus:ring-rose-400'
                              : 'border-slate-200 focus:ring-[#0F9D9A]'
                          }`}
                        />
                      </div>
                      {fieldErrors.authCode && (
                        <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.authCode}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Password & Confirm Password with Visibility Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-9 py-2 bg-[#F5F7FA] border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                          fieldErrors.password
                            ? 'border-rose-300 focus:ring-rose-400'
                            : 'border-slate-200 focus:ring-[#0F9D9A]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-9 py-2 bg-[#F5F7FA] border rounded-xl text-xs sm:text-sm text-[#142B4A] transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                          fieldErrors.confirmPassword
                            ? 'border-rose-300 focus:ring-rose-400'
                            : 'border-slate-200 focus:ring-[#0F9D9A]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* 5. Terms and Conditions Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                      className="w-4 h-4 text-[#0F9D9A] border-slate-300 rounded focus:ring-[#0F9D9A] cursor-pointer mt-0.5"
                    />
                    <span className="ml-2 text-xs text-slate-600 leading-snug">
                      I agree to the <span className="font-semibold text-[#0F9D9A]">TravelSphere Ops Franchise Terms of Service</span> and acknowledge that account activation is subject to Super Admin verification.
                    </span>
                  </label>
                  {fieldErrors.agreeTerms && (
                    <p className="mt-1 text-[11px] text-rose-600 ml-6">{fieldErrors.agreeTerms}</p>
                  )}
                </div>

                {/* 6. Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#142B4A] to-[#0F9D9A] hover:from-[#0C1B30] hover:to-[#0C8481] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0F9D9A]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Registration Request <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* 7. Bottom Navigation to Login */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-bold text-[#0F9D9A] hover:text-[#0C8481] hover:underline cursor-pointer"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
