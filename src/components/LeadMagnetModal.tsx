import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'rocky_lead_popup_last_shown';
const POPUP_COOLDOWN_DAYS = 7;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LeadMagnetModal({ open, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const closeSmooth = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
      // Reset form after close
      if (success) {
        setName('');
        setCompany('');
        setEmail('');
        setPhone('');
        setSuccess(false);
      }
      setError('');
    }, 200);
  };

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) closeSmooth();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open]);

  // Mark popup as shown
  useEffect(() => {
    if (open) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  }, [open]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate fields
    if (!name.trim() || !company.trim() || !email.trim() || !phone.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('submit-lead', {
        body: { name, company, email, phone },
      });

      if (fnError) {
        console.error('Function error:', fnError);
        setError('Something went wrong. Please try again.');
      } else if (data?.success) {
        setSuccess(true);
        // Auto-close after 3 seconds
        setTimeout(closeSmooth, 3000);
      } else {
        setError(data?.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
      onClick={closeSmooth}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl bg-white shadow-2xl transition-transform duration-200 ${closing ? 'scale-95' : 'scale-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeSmooth}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          {success ? (
            /* Success State */
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Thanks!</h3>
              <p className="mt-2 text-slate-600">We'll reach out shortly.</p>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  Get a customized demo for your business
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  See the AI caller in action—live. We'll tailor the demo to your business and show what it can handle.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="lead-name" className="mb-1 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="John Smith"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="lead-company" className="mb-1 block text-sm font-medium text-slate-700">
                    Company Name
                  </label>
                  <input
                    id="lead-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Acme Inc"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="lead-email" className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="john@acme.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <input
                    id="lead-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="+1 (555) 123-4567"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Get My Demo'
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeSmooth}
                  className="w-full py-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
                >
                  No thanks
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to check if popup should be shown
export function shouldShowLeadPopup(): boolean {
  return true; // Show on every visit (change back to 7-day cooldown later)
}
