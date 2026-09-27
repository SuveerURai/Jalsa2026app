'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch, downloadAdminFile } from '@/lib/admin-client';
import {
  Sparkles,
  Save,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  QrCode,
  GraduationCap,
  Layers,
  BookOpen,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { EventSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [registrationFee, setRegistrationFee] = useState(200);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');

  // Academic arrays as comma-separated or lines
  const [departmentsStr, setDepartmentsStr] = useState('');
  const [semestersStr, setSemestersStr] = useState('');
  const [sectionsStr, setSectionsStr] = useState('');
  const [dandiyaStr, setDandiyaStr] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch('/api/settings');
        if (res.ok) {
          const data: EventSettings = await res.json();
          setSettings(data);
          setEventName(data.event_name);
          setEventDate(data.event_date);
          setEventTime(data.event_time);
          setEventVenue(data.event_venue);
          setEventDescription(data.event_description);
          setRegistrationFee(data.registration_fee);
          setRegistrationOpen(data.registration_open);
          setUpiId(data.upi_id);
          setPayeeName(data.payee_name);
          setPaymentInstructions(data.payment_instructions);
          setDepartmentsStr((data.departments || []).join('\n'));
          setSemestersStr((data.semesters || []).join('\n'));
          setSectionsStr((data.sections || []).join('\n'));
          setDandiyaStr((data.dandiya_options || []).join('\n'));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload: Partial<EventSettings> = {
        event_name: eventName,
        event_date: eventDate,
        event_time: eventTime,
        event_venue: eventVenue,
        event_description: eventDescription,
        registration_fee: Number(registrationFee),
        registration_open: registrationOpen,
        upi_id: upiId,
        payee_name: payeeName,
        payment_instructions: paymentInstructions,
        departments: departmentsStr.split('\n').map((s) => s.trim()).filter(Boolean),
        semesters: semestersStr.split('\n').map((s) => s.trim()).filter(Boolean),
        sections: sectionsStr.split('\n').map((s) => s.trim()).filter(Boolean),
        dandiya_options: dandiyaStr.split('\n').map((s) => s.trim()).filter(Boolean)
      };

      const res = await adminFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload, })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Failed to update event settings.');
      }
    } catch (e) {
      alert('Error updating settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Loading Event Configuration Manager...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Event Configuration Settings</h1>
          <p className="text-xs text-zinc-400">Configure event details, fees, UPI parameters & registration open status.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-green-glow">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>✓ Event configuration updated successfully! All changes are live immediately across the app.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* REGISTRATION SWITCH CONTROL (#30) */}
        <div className="bg-gradient-to-r from-amber-950/60 via-dark-card to-amber-950/60 border border-brand-500/40 p-6 rounded-3xl flex items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold text-brand-400 tracking-wider">Registration Status Control</span>
            <h3 className="text-xl font-black text-white">
              {registrationOpen ? 'Registration is Currently OPEN' : 'Registration is Currently CLOSED'}
            </h3>
            <p className="text-xs text-zinc-400">
              When closed, new students cannot submit registrations. Existing users can still check status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRegistrationOpen(!registrationOpen)}
            className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
              registrationOpen
                ? 'bg-emerald-500 text-black shadow-green-glow'
                : 'bg-red-600 text-white shadow-red-glow'
            }`}
          >
            {registrationOpen ? <ToggleRight className="w-6 h-6 text-black" /> : <ToggleLeft className="w-6 h-6 text-white" />}
            <span>{registrationOpen ? 'Registration OPEN' : 'Registration CLOSED'}</span>
          </button>
        </div>

        {/* EVENT DETAILS CARD */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-6 shadow-xl">
          <h3 className="font-extrabold text-white text-base border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" /> General Event Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">Event Title</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">Pass Fee Amount (₹)</label>
              <input
                type="number"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(Number(e.target.value))}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">Event Date</label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">Event Time</label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-zinc-300">Event Venue</label>
              <input
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-zinc-300">Short Description</label>
              <textarea
                rows={2}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* PAYMENT & UPI SETTINGS CARD */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-6 shadow-xl">
          <h3 className="font-extrabold text-white text-base border-b border-zinc-800 pb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" /> Official Payment UPI Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">UPI ID for Payment</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-amber-300 font-mono font-bold focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">Payee Account Name</label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-zinc-300">Payment Instructions for Students</label>
              <textarea
                rows={3}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* ACADEMIC DROPDOWN OPTIONS CARD */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-6 shadow-xl">
          <h3 className="font-extrabold text-white text-base border-b border-zinc-800 pb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-400" /> Academic & Form Options Config (1 per line)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 block">Available Departments</label>
              <textarea
                rows={6}
                value={departmentsStr}
                onChange={(e) => setDepartmentsStr(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white font-mono focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 block">Available Semesters</label>
              <textarea
                rows={6}
                value={semestersStr}
                onChange={(e) => setSemestersStr(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white font-mono focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 block">Available Sections</label>
              <textarea
                rows={4}
                value={sectionsStr}
                onChange={(e) => setSectionsStr(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white font-mono focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 block">Dandiya Sticks Options</label>
              <textarea
                rows={4}
                value={dandiyaStr}
                onChange={(e) => setDandiyaStr(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white font-mono focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 text-black font-extrabold text-sm rounded-2xl shadow-gold-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Save className="w-5 h-5 text-black" />}
            <span>Save & Apply Event Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
