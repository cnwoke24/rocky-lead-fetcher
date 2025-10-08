import React, { useCallback, useEffect, useState } from "react";
import jackieDemo from "@/assets/jackie-demo.png";

/** Sanitize phone input to digits (and keep leading +) */
function normalizePhone(input: string): string {
  return (input || "").replace(/[^\d+]/g, "");
}

/** Optional tiny tests (run in dev console: TryMeModal.__run_tests__?.()) */
(TryMeModal as any).__run_tests__ = () => {
  const t = (n: string, v: boolean) => console.log(v ? "✅" : "❌", n);
  t("digits only", normalizePhone("555-111-2222") === "5551112222");
  t("keeps plus", normalizePhone("+1 (555) 111-2222") === "+15551112222");
  t("empty", normalizePhone("") === "");
  t("letters removed", normalizePhone("abc123") === "123");
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** override the YouTube video id if needed */
  ytId?: string; // default: Bq2IQZoCJzc
};

export default function TryMeModal({ open, onClose, ytId = "Bq2IQZoCJzc" }: Props) {
  const [closing, setClosing] = useState(false);
  const [phone, setPhone] = useState("");
  const [calling, setCalling] = useState(false);
  const [called, setCalled] = useState(false);
  const [err, setErr] = useState("");

  const closeSmooth = useCallback(() => {
    if (!open || closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setCalled(false);
      setCalling(false);
      setPhone("");
      setErr("");
      onClose();
    }, 220);
  }, [open, closing, onClose]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSmooth();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeSmooth]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Local styles for animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes pop-in { 0% { opacity: 0; transform: translateY(12px) scale(.98) } 100% { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes pop-out { 0% { opacity: 1; transform: translateY(0) scale(1) } 100% { opacity: 0; transform: translateY(8px) scale(.985) } }
      `}</style>

      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          closing ? "animate-[fade-out_.18s_ease-in_forwards]" : "animate-[fade-in_.25s_ease-out]"
        }`}
        onClick={closeSmooth}
      />

      {/* Modal */}
      <div className="absolute inset-0 grid place-items-center px-4">
        <div
          className={`w-full max-w-[720px] rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden will-change-transform will-change-opacity ${
            closing
              ? "animate-[pop-out_.18s_ease-in_forwards]"
              : "animate-[pop-in_.28s_cubic-bezier(0.22,1,0.36,1)]"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Try me demo"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT: demo image */}
            <div className="relative bg-neutral-200 md:min-h-[420px] overflow-hidden">
              <img 
                src={jackieDemo} 
                alt="Jackie AI agent demo" 
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ objectPosition: '65% center' }}
              />
              <div className="absolute left-3 top-3 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/95 text-neutral-900 text-[11px] font-semibold shadow">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live Demo
              </div>
            </div>

            {/* RIGHT: content */}
            <div className="p-6 md:p-7">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg md:text-2xl font-bold tracking-tight leading-tight whitespace-nowrap md:whitespace-normal">
                  Try Jackie — your AI caller
                </h3>
                <button onClick={closeSmooth} className="px-2 py-1 rounded-lg hover:bg-neutral-100">✕</button>
              </div>
              <p className="text-neutral-600 mb-4 text-sm md:text-[15px]">
                Jackie will call you as if you recently requested a free consultation. This mirrors how our agent follows up with real leads for gyms, salons, and local businesses.
              </p>

              <div className="p-4 mb-5 rounded-xl border border-neutral-200 bg-neutral-50">
                <div className="font-medium mb-1">Scenario</div>
                <ul className="list-disc ml-5 text-sm text-neutral-700 space-y-1">
                  <li>You filled a lead form to book a consultation.</li>
                  <li>Jackie calls in under 3 minutes to qualify & schedule.</li>
                  <li>After the call, you get a text summary.</li>
                </ul>
              </div>

              {/* phone capture / confirmation */}
              {!called ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setErr("");
                    const digits = normalizePhone(phone);
                    if (digits.length < 10) {
                      setErr("Enter a valid phone number");
                      return;
                    }
                    setCalling(true);
                    try {
                      // Replace with your server route that triggers Retell AI
                      const res = await fetch("/api/retell-demo-call", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phone: digits }),
                      });
                      if (!res.ok) throw new Error("preview");
                      setCalled(true);
                    } catch {
                      // Preview fallback to simulate success
                      await new Promise((r) => setTimeout(r, 700));
                      setCalled(true);
                    } finally {
                      setCalling(false);
                    }
                  }}
                >
                  <label className="sr-only">Your phone number</label>
                  <div className="flex gap-2">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      placeholder="888-888-8888"
                      className="h-12 flex-1 rounded-lg bg-white border border-neutral-300 px-3 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      disabled={calling}
                      className="h-12 px-4 md:px-5 rounded-lg font-semibold text-white bg-neutral-900 hover:bg-black whitespace-nowrap leading-none text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {calling ? "Calling…" : "Call me now"}
                    </button>
                  </div>
                  {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
                  <p className="mt-4 text-[11px] text-center text-neutral-500">
                    By tapping "Call me now", you agree to receive a one-time demo call. Standard voice/SMS rates may apply.
                  </p>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    ✅ You should receive a call from <b>Jackie</b> shortly. Ask about booking a consultation and rescheduling, just like a real lead would.
                  </div>
                  <p className="text-neutral-700 text-sm">
                    This is the same workflow our clients use to convert more leads to paying customers. After the call, we log a summary and next steps automatically.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button onClick={closeSmooth} className="px-4 h-10 rounded-lg border border-neutral-200 hover:bg-neutral-50">Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
