import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Search,
  Music,
  Zap,
  Users,
  AlertTriangle,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { getEventSettings } from '@/lib/db';

export const revalidate = 60; // Refresh settings every 60s

export default async function HomePage() {
  const settings = await getEventSettings();

  return (
    <div className="space-y-24 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-brand-600/30 via-amber-500/20 to-orange-600/10 blur-[130px] rounded-full pointer-events-none flame-glow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-950/60 border border-brand-500/40 text-brand-300 text-xs sm:text-sm font-semibold tracking-wide shadow-gold-glow animate-bounce">
            <Sparkles className="w-4 h-4 text-brand-400 fill-brand-400" />
            <span>The Biggest College Cultural Fest & Dandiya Night of 2026</span>
          </div>

          {/* Main Hero Branding Title */}
          <div className="flex justify-center -mt-4 mb-0">
  <Image
    src="/JALSA.png"
    alt="JALSA '26"
    width={900}
    height={450}
    priority
    className="h-auto w-[300px] sm:w-[450px] md:w-[600px] lg:w-[720px]"
  />
</div>
<p className="mt-3 text-lg sm:text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-zinc-400 via-amber-300 to-zinc-400 bg-clip-text text-transparent">
  {settings.event_description}
</p>

          {/* Key Event Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
            <div className="bg-dark-card/90 border border-dark-border p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-brand-500/50 transition-colors">
              <Calendar className="w-6 h-6 text-brand-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Date</span>
              <span className="text-sm sm:text-base font-bold text-white">{settings.event_date}</span>
            </div>

            <div className="bg-dark-card/90 border border-dark-border p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-brand-500/50 transition-colors">
              <Clock className="w-6 h-6 text-brand-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Time</span>
              <span className="text-sm sm:text-base font-bold text-white">{settings.event_time}</span>
            </div>

            <div className="bg-dark-card/90 border border-dark-border p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-brand-500/50 transition-colors">
              <MapPin className="w-6 h-6 text-brand-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Venue</span>
              <span className="text-sm sm:text-base font-bold text-white truncate max-w-[180px]">{settings.event_venue}</span>
            </div>

            <div className="bg-dark-card/90 border border-dark-border p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-brand-500/50 transition-colors bg-gradient-to-b from-amber-950/20 to-transparent">
              <Ticket className="w-6 h-6 text-amber-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Pass Fee</span>
              <span className="text-lg sm:text-xl font-extrabold text-amber-400">₹{settings.registration_fee} <span className="text-xs font-normal text-zinc-400">/ person</span></span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            {settings.registration_open ? (
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold text-black bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 rounded-2xl shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-black" />
                Register Now — ₹{settings.registration_fee}
                <ChevronRight className="w-5 h-5 text-black" />
              </Link>
            ) : (
              <div className="w-full sm:w-auto px-8 py-4 text-base font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-2xl">
                Registration Closed
              </div>
            )}

            <Link
              href="/registration/status"
              className="w-full sm:w-auto px-7 py-4 text-base font-semibold text-zinc-200 bg-dark-card border border-dark-border hover:border-zinc-500 hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-brand-400" />
              Already Registered? Check Ticket
            </Link>
          </div>
        </div>
      </section>

      {/* EVENT HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400 bg-brand-950/60 border border-brand-900 px-3 py-1 rounded-full">
            What to Expect
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Unforgettable Fest Highlights
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Get ready for non-stop energy, electrifying beats, cultural showcases, and vibrant Garba celebrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Live DJ & Garba Arena</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Dance to traditional Dhol beats mixed with Garba and Dandiya music by celebrated guest DJs under high tech strobe lights.
            </p>
          </div>

          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Dandiya Sticks Available</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Opt for event provided Dandiya sticks during registration or bring your own customized decorated sticks!
            </p>
          </div>

          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Best Dressed Boy & Girl</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Show off your best traditional look and stand out at
JALSA. One boy and one girl will be crowned Best Dressed!
            </p>
          </div>
        </div>
      </section>

      {/* REGISTRATION STEPS & INSTRUCTIONS */}
      <section className="bg-dark-card/60 border-y border-dark-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How Registration Works
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Follow 4 simple steps to receive your instant digital QR entry ticket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-dark-bg border border-dark-border p-6 rounded-2xl space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-brand-500 text-black font-extrabold flex items-center justify-center text-sm">1</span>
              <h4 className="font-bold text-white text-lg">Enter Details</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Fill in your full name, email, phone, USN, department, semester, and section.</p>
            </div>

            <div className="bg-dark-bg border border-dark-border p-6 rounded-2xl space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-brand-500 text-black font-extrabold flex items-center justify-center text-sm">2</span>
              <h4 className="font-bold text-white text-lg">Pay ₹200 via UPI</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Scan official event UPI QR or use UPI ID ({settings.upi_id}) to transfer ₹200 pass fee.</p>
            </div>

            <div className="bg-dark-bg border border-dark-border p-6 rounded-2xl space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-brand-500 text-black font-extrabold flex items-center justify-center text-sm">3</span>
              <h4 className="font-bold text-white text-lg">Submit UTR & Proof</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Enter 12-digit UPI Transaction ID / UTR and upload payment screenshot.</p>
            </div>

            <div className="bg-dark-bg border border-dark-border p-6 rounded-2xl space-y-3 relative border-emerald-800/60">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-black font-extrabold flex items-center justify-center text-sm">4</span>
              <h4 className="font-bold text-white text-lg">Admin Verification</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Organizers verify transaction and send your active QR Ticket to your email & status page.</p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORTANT RULES & FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Entry Rules */}
        <div className="space-y-6 bg-dark-card border border-dark-border p-8 rounded-3xl">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-2xl font-bold text-white">Event Rules & Guidelines</h3>
          </div>
          <ul className="space-y-4 text-sm text-zinc-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>College ID Mandatory:</strong> Original college ID card must be presented along with the QR Ticket at entry gate.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Single Entry Per Ticket:</strong> Each QR code allows exactly ONE entry. Scanned tickets become void for re-entry.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Non-Transferable:</strong> Tickets are non-transferable and mapped to student USN.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Verification Time:</strong> UPI Payment verification takes 1-4 hours during working hours.</span>
            </li>
          </ul>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-brand-400">
            <HelpCircle className="w-6 h-6" />
            <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-2">
              <h4 className="font-bold text-white">When will I get my QR ticket?</h4>
              <p className="text-zinc-400 text-xs sm:text-sm">Once you submit your registration and payment screenshot, your status remains "Pending". As soon as our admin team verifies the UPI transaction, your QR code becomes active automatically on your status page and email.</p>
            </div>

            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-2">
              <h4 className="font-bold text-white">Can I register for a friend?</h4>
              <p className="text-zinc-400 text-xs sm:text-sm">Each student must register using their own USN, phone number, and email address. Duplicate registrations for the same USN will be flagged.</p>
            </div>

            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-2">
              <h4 className="font-bold text-white">What if my payment is rejected?</h4>
              <p className="text-zinc-400 text-xs sm:text-sm">If your screenshot is blurry or UTR is incorrect, admins will add a note detailing the reason. You can view it on the Check Status page.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-950/80 via-dark-card to-amber-950/80 border border-brand-500/40 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-gold-glow">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Don't Miss out on JALSA '26!
          </h2>
          <p className="text-zinc-300 max-w-xl mx-auto text-sm sm:text-base">
            Pass fee is ₹200 per person. Register now to reserve your spot before passes sell out.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-8 py-4 text-base font-extrabold text-black bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 rounded-2xl shadow-gold-glow hover:scale-105 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Secure My Ticket Now (₹200)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
