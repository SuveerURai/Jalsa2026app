import React from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How much is the registration fee for JALSA 2026?',
      a: 'The registration fee is ₹200 per student pass. Every pass is mapped to a single student USN and includes full event access and a digital QR ticket.'
    },
    {
      q: 'What is the payment verification process?',
      a: 'After completing student details, scan the official UPI QR code and pay ₹200. Copy the 12-digit UTR/Transaction ID, attach your payment screenshot, and submit. The organizing committee verifies your transaction, and your active QR code will appear on your ticket page.'
    },
    {
      q: 'Can I enter without a College ID Card?',
      a: 'No. You MUST carry your official original physical college ID card along with your JALSA 2026 QR code ticket for entry gate verification.'
    },
    {
      q: 'What happens if my payment is rejected?',
      a: 'If your screenshot is blurry or UTR does not match, admins will mark your payment as REJECTED with a note explaining why. You can check status on the Status page and re-submit proof.'
    },
    {
      q: 'Are Dandiya sticks provided at the venue?',
      a: 'You can select your Dandiya stick preference during registration. High-quality wooden sticks will be provided to participants who selected "Required" at the registration desk near the entrance.'
    },
    {
      q: 'Can I reuse my QR code to exit and re-enter?',
      a: 'No. The QR code system enforces strict single-entry. Once scanned at the entry gate, the system marks the ticket as ENTERED, preventing duplicate entries.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400 bg-brand-950/60 border border-brand-900 px-3 py-1 rounded-full">
          Help & Information
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
          Everything you need to know about JALSA 2026 passes, UPI payment verification, and gate rules.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 hover:border-brand-500/40 transition-colors">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-400 flex-shrink-0" />
              {faq.q}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed pl-7">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-amber-950/60 via-dark-card to-amber-950/60 border border-brand-500/40 p-8 rounded-3xl text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Still have questions?</h3>
        <p className="text-xs text-zinc-400">Reach out directly to the JALSA 2026 Student Organizing Committee.</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-black font-bold rounded-xl text-xs shadow-gold-glow"
        >
          Contact Organizing Team
        </Link>
      </div>
    </div>
  );
}
