'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, QrCode, Search, Shield, Menu, X, Ticket } from 'lucide-react';
import { getAdminProfile } from '@/lib/admin-client';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminRoleLoading, setAdminRoleLoading] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';

  useEffect(() => {
    if (!isAdmin || isAdminLogin) {
      setAdminRole(null);
      setAdminRoleLoading(false);
      return;
    }

    let active = true;
    setAdminRoleLoading(true);
    getAdminProfile()
      .then((profile) => {
        if (active) {
          setAdminRole(profile?.role || '');
          setAdminRoleLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setAdminRole('');
          setAdminRoleLoading(false);
        }
      });

    return () => { active = false; };
  }, [isAdmin, isAdminLogin, pathname]);

  // Keep the public/admin navigation out of the authentication screen.
  if (isAdminLogin) return null;

  return (
    <nav className="sticky top-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="relative flex items-center justify-center w-[150px]">
 <Image
  src="/JALSA.png"
  alt="JALSA '26"
  width={180}
  height={90}
  priority
  className="h-auto w-[150px] object-contain"
/>
</div>

          {/* Navigation Links - Public / Admin */}
          {!isAdmin ? (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
              <Link
                href="/"
                className={`hover:text-brand-400 transition-colors ${pathname === '/' ? 'text-brand-400 font-semibold' : ''}`}
              >
                Home
              </Link>
              <Link
                href="/register"
                className={`hover:text-brand-400 transition-colors ${pathname === '/register' ? 'text-brand-400 font-semibold' : ''}`}
              >
                Registration
              </Link>
              <Link
                href="/registration/status"
                className={`flex items-center gap-1.5 hover:text-brand-400 transition-colors ${pathname === '/registration/status' ? 'text-brand-400 font-semibold' : ''}`}
              >
                <Search className="w-4 h-4 text-brand-400" />
                Check Status
              </Link>
              <Link
                href="/faq"
                className={`hover:text-brand-400 transition-colors ${pathname === '/faq' ? 'text-brand-400 font-semibold' : ''}`}
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className={`hover:text-brand-400 transition-colors ${pathname === '/contact' ? 'text-brand-400 font-semibold' : ''}`}
              >
                Contact
              </Link>
            </div>
          ) : adminRoleLoading || !adminRole ? (
            <div className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-300" aria-hidden="true">
              <span className="w-20 h-8" />
            </div>
          ) : adminRole === 'SCANNER' ? (
            <div className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-300">
              <Link
                href="/admin/scanner"
                className="flex items-center gap-2 text-emerald-300 font-bold px-4 py-2 rounded-xl bg-emerald-950/50 border border-emerald-800/70 shadow-green-glow"
              >
                <QrCode className="w-4 h-4" />
                QR Scanner
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-300">
              <Link href="/admin/dashboard" className={`hover:text-amber-400 transition-colors ${pathname === '/admin/dashboard' ? 'text-amber-400 font-semibold' : ''}`}>Dashboard</Link>
              <Link href="/admin/payments" className={`hover:text-amber-400 transition-colors ${pathname === '/admin/payments' ? 'text-amber-400 font-semibold' : ''}`}>Verify Payments</Link>
              <Link href="/admin/registrations" className={`hover:text-amber-400 transition-colors ${pathname === '/admin/registrations' ? 'text-amber-400 font-semibold' : ''}`}>Registrations</Link>
              <Link href="/admin/scanner" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 shadow-green-glow transition-all"><QrCode className="w-4 h-4" />QR Scanner</Link>
              <Link href="/admin/analytics" className={`hover:text-amber-400 transition-colors ${pathname === '/admin/analytics' ? 'text-amber-400 font-semibold' : ''}`}>Analytics</Link>
              <Link href="/admin/settings" className={`hover:text-amber-400 transition-colors ${pathname === '/admin/settings' ? 'text-amber-400 font-semibold' : ''}`}>Settings</Link>
            </div>
          )}

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {!isAdmin ? (
              <>
                <Link
                  href="/registration/status"
                  className="px-4 py-2 text-sm font-semibold text-zinc-200 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-xl transition-all"
                >
                  My Ticket
                </Link>
                <Link
                  href="/register"
                  className="relative group px-5 py-2.5 text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 rounded-xl shadow-gold-glow hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-black animate-pulse" />
                  Register Now (₹199)
                </Link>
              </>
            ) : adminRole === 'SCANNER' || adminRoleLoading ? null : (
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 border border-zinc-800 rounded-xl"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-300 hover:text-white rounded-lg bg-zinc-900"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-card border-b border-dark-border px-4 pt-3 pb-6 space-y-3">
          {!isAdmin ? (
            <>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Home
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-400 hover:bg-zinc-800"
              >
                Register Now (₹199)
              </Link>
              <Link
                href="/registration/status"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Check Ticket & Status
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800"
              >
                FAQ & Rules
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Contact Organizers
              </Link>
            </>
          ) : adminRoleLoading || !adminRole ? null : adminRole === 'SCANNER' ? (
            <Link
              href="/admin/scanner"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-bold text-emerald-400 hover:bg-zinc-800"
            >
              QR Gate Scanner
            </Link>
          ) : (
            <>
              <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800">Dashboard</Link>
              <Link href="/admin/payments" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-amber-400 hover:bg-zinc-800">Verify Payments</Link>
              <Link href="/admin/registrations" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800">Registrations</Link>
              <Link href="/admin/scanner" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-bold text-emerald-400 hover:bg-zinc-800">QR Gate Scanner</Link>
              <Link href="/admin/analytics" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800">Analytics Matrix</Link>
              <Link href="/admin/settings" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800">Settings</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
