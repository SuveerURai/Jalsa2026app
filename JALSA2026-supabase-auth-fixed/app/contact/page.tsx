import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Clock, Users, Instagram } from 'lucide-react';


export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400 bg-brand-950/60 border border-brand-900 px-3 py-1 rounded-full">
          Organizing Desk
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Contact JALSA 2026 Committee
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
          Have an inquiry regarding payment verification, group registrations, or volunteer access? Contact our student coordinators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 mx-auto flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Email Support</h3>
          <p className="text-xs text-zinc-400">connect.jalsa26@gmail.com</p>
          <p className="text-xs text-zinc-500">Mail us for any queries</p>
        </div>
        

        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 mx-auto flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Contact Numbers</h3>
           <p className="text-base font-semibold text-zinc-200">
  Suveer U Rai
</p>
          <p className="text-xs text-zinc-300 font-semibold">+91 9945886297</p>
          
        </div>

        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-3 text-center">
 <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800 mx-auto flex items-center justify-center">
  <Instagram className="w-6 h-6 text-brand-400" />
</div>

  <h3 className="font-bold text-white text-base">
    Follow Us on Instagram
  </h3>

  <a
    href="https://instagram.com/jalsa_26"
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-zinc-300 font-semibold hover:text-amber-400 transition-colors"
  >
    @jalsa_26
  </a>

  <p className="text-xs text-zinc-500">
    Follow us for JALSA 2026 updates
  </p>
</div>
      </div>
    </div>
  );
}
