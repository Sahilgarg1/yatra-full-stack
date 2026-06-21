"use client";

import { useState } from "react";

export default function CopilotForm() {
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    destination: "",
    dates: "",
    concerns: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.whatsapp,
          destination: form.destination,
          trip_dates: form.dates,
          message: form.concerns,
          service: "copilot",
        }),
      });
    } catch {
      // Non-blocking — still show success and open WhatsApp
    }
    setSubmitted(true);
  }

  const waText = encodeURIComponent(
    `Hi! I've signed up for the Guardian Angel co-pilot service. My name is ${form.name || "..."} and I'm traveling to ${form.destination || "India"} on ${form.dates || "TBD"}.`
  );

  if (submitted) {
    return (
      <div className="bg-cream border border-border rounded-[14px] p-6 text-center">
        <div className="text-[32px] mb-3">✓</div>
        <h3 className="font-display text-[18px] font-bold text-text-primary mb-2">You're all set!</h3>
        <p className="text-[13px] text-text-muted mb-6">
          We'll match you with a co-pilot and reach out on WhatsApp within 2 hours.
        </p>
        <a
          href={`https://wa.me/919876543210?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-whatsapp text-white font-bold text-[15px] px-8 py-3.5 rounded-[10px] no-underline"
        >
          Open WhatsApp →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream border border-border rounded-[14px] p-6">
      <h3 className="font-display text-[18px] font-bold text-text-primary mb-1">
        Tell us about your trip
      </h3>
      <p className="text-[13px] text-text-muted mb-5">
        We'll match you with the right co-pilot before charging you.
      </p>

      {[
        { label: "Your name", name: "name", type: "text", placeholder: "Sarah Chen" },
        { label: "WhatsApp number", name: "whatsapp", type: "tel", placeholder: "+1 415 555 0172" },
        { label: "Where are you going?", name: "destination", type: "text", placeholder: "Ladakh, Spiti Valley, Rajasthan…" },
        { label: "Trip dates", name: "dates", type: "text", placeholder: "e.g. Jan 15 – Jan 28" },
      ].map((f) => (
        <div key={f.name} className="mb-3.5">
          <label className="block text-[11px] font-semibold text-text-muted tracking-[0.06em] uppercase mb-1.5">
            {f.label}
          </label>
          <input
            type={f.type}
            name={f.name}
            value={form[f.name]}
            onChange={handleChange}
            placeholder={f.placeholder}
            className="w-full px-[13px] py-[10px] rounded-[8px] border border-border text-[14px] outline-none bg-white text-text-primary focus:border-green"
          />
        </div>
      ))}

      <div className="mb-5">
        <label className="block text-[11px] font-semibold text-text-muted tracking-[0.06em] uppercase mb-1.5">
          Anything you're worried about?
        </label>
        <textarea
          name="concerns"
          value={form.concerns}
          onChange={handleChange}
          placeholder="Permits, altitude, solo travel safety, operator trust…"
          rows={3}
          className="w-full px-[13px] py-[10px] rounded-[8px] border border-border text-[14px] outline-none bg-white text-text-primary resize-none focus:border-green"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-dark-green text-cream font-bold text-[14px] py-[13px] rounded-[9px] cursor-pointer border-none"
      >
        Submit & pay $29 →
      </button>
    </form>
  );
}
