import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-dark-border text-zinc-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-500 to-amber-300 p-0.5 shadow-gold-glow flex items-center justify-center font-black text-black">
              J'26
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500">
              JALSA 2026
            </span>
          </div>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
            The grandest college cultural extravaganza & Dandiya Night of 2026. Join hundreds of students for an unforgettable night of music, dance, lights, and celebration.
          </p>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-950/40 border border-amber-900/60 w-fit px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Official Event Registration & QR Ticketing Portal
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-zinc-200 mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-brand-400 transition-colors">Event Highlights</Link></li>
            <li><Link href="/register" className="hover:text-brand-400 transition-colors text-brand-400 font-medium">Student Registration (₹199)</Link></li>
            <li><Link href="/registration/status" className="hover:text-brand-400 transition-colors">Check Ticket Status</Link></li>
            <li><Link href="/faq" className="hover:text-brand-400 transition-colors">Frequently Asked Questions</Link></li>
            <li><Link href="/admin/login" className="hover:text-zinc-200 text-xs text-zinc-500 transition-colors">Volunteer / Admin Portal</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-bold text-zinc-200 mb-4 text-sm uppercase tracking-wider">Event Desk</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2.5 text-zinc-300">
              <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Canteen Ground</span>
            </li>
            <li className="flex items-center gap-2.5 text-zinc-300">
              <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>connect.jalsa26@gmail.com</span>
            </li>
           <li className="flex items-center gap-2.5 text-zinc-300">
  <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
  <span>
    +91 9945886297
    <br />
    +91 6366262025
  </span>
</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-900 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
        <p>© 2026 JALSA Cultural Committee. All rights reserved.</p>
        <p className="flex items-center gap-1 text-zinc-500">
  Crafted & Customized by
  <span className="font-semibold text-zinc-300">
    Suveer U Rai
  </span>
</p>
      </div>
    </footer>
  );
}
