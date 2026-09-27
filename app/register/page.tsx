'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  IdCard,
  GraduationCap,
  BookOpen,
  Layers,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { EventSettings } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();

  // Settings state loaded dynamically
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form Steps: 1: Student & Academic Info, 2: Payment & Screenshot, 3: Review & Submit
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usn, setUsn] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [dandiyaSticks, setDandiyaSticks] = useState('');

  // Payment Fields
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');

  // Status & Validation State
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data: EventSettings = await res.json();
          setSettings(data);
          if (data.departments?.length) setDepartment(data.departments[0]);
          if (data.semesters?.length) setSemester(data.semesters[0]);
          if (data.sections?.length) setSection(data.sections[0]);
          if (data.dandiya_options?.length) setDandiyaSticks(data.dandiya_options[0]);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  // Handle Screenshot Drop/Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Payment screenshot size must be less than 5MB.');
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!fullName.trim()) return 'Full Name is required.';
    if (!email.trim() || !email.includes('@')) return 'A valid Email Address is required.';
    if (!phone.trim() || phone.trim().length < 10) return 'A valid 10-digit Phone Number is required.';
    if (!usn.trim()) return 'USN / Student ID is required.';
    if (!department) return 'Please select your department.';
    if (!semester) return 'Please select your semester.';
    if (!section) return 'Please select your section.';
    if (!dandiyaSticks) return 'Please select your Dandiya sticks option.';
    return null;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!transactionId.trim() || transactionId.trim().length < 6) {
      return 'Please enter a valid UPI Transaction ID / UTR (min 6 digits).';
    }
    if (!screenshotFile) {
      return 'Please upload your payment screenshot.';
    }
    return null;
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setStep(2);
    }
  };

  // Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const err = validateStep2();
    if (err) {
      setErrorMsg(err);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('usn', usn);
      formData.append('department', department);
      formData.append('semester', semester);
      formData.append('section', section);
      formData.append('dandiya_sticks', dandiyaSticks);
      formData.append('payment_transaction_id', transactionId);
      if (screenshotFile) {
        formData.append('payment_screenshot', screenshotFile);
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Success -> Redirect to confirmation page
      router.push(`/registration/success?id=${data.registration.registration_id}`);

    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Loading JALSA 2026 Registration Portal...</p>
      </div>
    );
  }

  if (settings && !settings.registration_open) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Registration Closed</h1>
        <p className="text-zinc-400 leading-relaxed">
          Registration for JALSA 2026 is currently closed by the organizing committee. If you have already registered, you can check your ticket status below.
        </p>
        <button
          onClick={() => router.push('/registration/status')}
          className="px-6 py-3 bg-brand-500 text-black font-bold rounded-xl shadow-gold-glow hover:bg-brand-400 transition-colors"
        >
          Check My Registration Status
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400 bg-brand-950/60 border border-brand-900 px-3 py-1 rounded-full">
          JALSA 2026 Official Registration
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Event Pass Registration
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
          Pass Fee: <strong className="text-amber-400 font-extrabold">₹{settings?.registration_fee || 200}</strong> / person (Includes event entry & digital QR ticket).
        </p>
      </div>

      {/* Progress Multi-step Indicator */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${step === 1 ? 'bg-brand-500 text-black shadow-gold-glow' : 'bg-dark-card text-zinc-400 border border-dark-border'}`}>
          <span>1. Student Details</span>
        </div>
        <div className="w-8 h-0.5 bg-zinc-800" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${step === 2 ? 'bg-brand-500 text-black shadow-gold-glow' : 'bg-dark-card text-zinc-400 border border-dark-border'}`}>
          <span>2. UPI Payment & Screenshot</span>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{errorMsg}</p>
            {errorMsg.includes('already exists') && (
              <button
                type="button"
                onClick={() => router.push(`/registration/status`)}
                aria-label="Check registration status page"
                className="mt-1 text-xs text-red-300 underline font-bold"
              >
                Click here to look up your existing ticket →
              </button>
            )}
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border p-6 sm:p-10 rounded-3xl space-y-8 shadow-2xl">
        
        {/* STEP 1: PARTICIPANT DETAILS */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <User className="w-5 h-5 text-brand-400" />
              Personal & Academic Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-400" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rohan.sharma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-400" /> Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* USN / Student ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-brand-400" /> USN / Student ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1RV22CS101"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors uppercase font-mono"
                />
              </div>

              {/* Department Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-400" /> Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {settings?.departments.map((d) => (
                    <option key={d} value={d} className="bg-dark-bg text-white">{d}</option>
                  ))}
                </select>
              </div>

              {/* Semester Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-400" /> Semester *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {settings?.semesters.map((s) => (
                    <option key={s} value={s} className="bg-dark-bg text-white">{s}</option>
                  ))}
                </select>
              </div>

              {/* Section Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-400" /> Section *
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {settings?.sections.map((sec) => (
                    <option key={sec} value={sec} className="bg-dark-bg text-white">{sec}</option>
                  ))}
                </select>
              </div>

              {/* Dandiya Sticks Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Dandiya Sticks Preference *
                </label>
                <select
                  value={dandiyaSticks}
                  onChange={(e) => setDandiyaSticks(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {settings?.dandiya_options.map((opt) => (
                    <option key={opt} value={opt} className="bg-dark-bg text-white">{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 text-black font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Payment (₹{settings?.registration_fee || 200})</span>
                <ArrowRight className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: UPI PAYMENT & UTR UPLOAD */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <QrCode className="w-5 h-5 text-amber-400" />
              UPI Payment & Verification
            </h3>

            {/* Payment Summary Box */}
            <div className="bg-gradient-to-r from-amber-950/60 via-dark-bg to-amber-950/60 border border-brand-500/40 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Pass Amount Due</span>
                <h2 className="text-3xl font-black text-white">₹{settings?.registration_fee || 200} <span className="text-xs font-normal text-zinc-400">INR</span></h2>
                <p className="text-xs text-zinc-400">Payee: <strong className="text-zinc-200">{settings?.payee_name}</strong></p>
                <p className="text-xs text-zinc-400">UPI ID: <code className="bg-zinc-900 px-2 py-1 rounded text-amber-300 font-mono select-all">{settings?.upi_id}</code></p>
              </div>

              {/* UPI QR Code Display */}
              <div className="flex flex-col items-center p-3 bg-white rounded-2xl shadow-xl">
                {/* SVG/QR Graphic representing standard UPI QR */}
                <div className="w-36 h-36 bg-white flex flex-col items-center justify-center text-black font-bold p-2 text-center border-2 border-black rounded-lg">
                  <QrCode className="w-24 h-24 text-black" />
                  <span className="text-[10px] tracking-tight text-zinc-700 mt-1 font-mono">SCAN VIA GPAY/PHONEPE</span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-800 mt-1">{settings?.upi_id}</span>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border text-xs text-zinc-300 space-y-1">
              <span className="font-bold text-amber-400 block uppercase">Payment Instructions:</span>
              <p>{settings?.payment_instructions}</p>
            </div>

            {/* Input UTR / Transaction ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> UPI Transaction ID / UTR (12 Digits) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 427189023145"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.trim())}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors font-mono tracking-widest"
              />
              <span className="text-[11px] text-zinc-500 block">Check your payment app transaction details for the 12-digit UTR/Ref number.</span>
            </div>

            {/* Upload Payment Screenshot Dropzone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-brand-400" /> Upload Payment Screenshot *
              </label>
              
              <div className="relative border-2 border-dashed border-dark-border hover:border-brand-500/50 bg-dark-bg p-6 rounded-2xl text-center space-y-3 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {screenshotPreview ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={screenshotPreview}
                      alt="Payment Screenshot Preview"
                      className="w-40 h-40 object-cover rounded-xl border border-zinc-700 shadow-md"
                    />
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Screenshot attached ({screenshotFile?.name})
                    </span>
                    <span className="text-[11px] text-zinc-500">Click or drag to replace screenshot</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                      <Upload className="w-6 h-6 text-brand-400" />
                    </div>
                    <p className="text-sm font-semibold text-white">Click to upload or drag screenshot image</p>
                    <span className="text-xs text-zinc-400">Supported formats: JPG, PNG, WebP (Max 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Back & Submit Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-6 py-3 bg-zinc-900 border border-zinc-700 text-zinc-300 font-semibold rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Details
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold rounded-xl shadow-green-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span>Submitting Registration...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Submit & Get Registration ID</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
