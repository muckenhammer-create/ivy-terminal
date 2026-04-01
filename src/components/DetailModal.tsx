"use client";

import { Opportunity } from "@/lib/types";
import { useState, useEffect } from "react";

interface ModalProps {
  opportunity: Opportunity;
  matchScore: number;
  onClose: () => void;
}

interface NewsArticle {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

function formatBudget(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

export default function DetailModal({ opportunity: opp, matchScore, onClose }: ModalProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ brand_category: "", email: "", message: "" });
  const [enquirySent, setEnquirySent] = useState(false);

  useEffect(() => {
    // Fetch news
    setNewsLoading(true);
    fetch(`/api/news?q=${encodeURIComponent(opp.name)}`)
      .then((r) => r.json())
      .then((d) => setNews(d.articles?.slice(0, 5) ?? []))
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, [opp.name]);

  const fetchAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are IVY Intelligence, a sports sponsorship analyst. Provide a concise analysis (3-4 paragraphs) of "${opp.name}" as a sponsorship opportunity. Cover: brand fit potential, audience quality, key risks, and strategic recommendation. Be specific and data-informed. The opportunity type is ${opp.type} in ${opp.sport}. Their reach is ${opp.reach} with budget range ${formatBudget(opp.budget_min)} to ${formatBudget(opp.budget_max)}.`,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.text ?? "Analysis unavailable.");
    } catch {
      setAiAnalysis("Unable to load AI analysis. Please check your API key.");
    } finally {
      setAiLoading(false);
    }
  };

  const submitEnquiry = async () => {
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity_id: opp.id, ...enquiryForm }),
      });
      setEnquirySent(true);
    } catch {
      alert("Failed to submit enquiry.");
    }
  };

  const catFitEntries = Object.entries(opp.cat_fit).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl mx-auto my-4 bg-cream rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-gold/10 text-gold">{opp.type}</span>
              <span className="text-sm text-mist">{opp.sport}</span>
              <span className="text-sm text-mist">|</span>
              <span className="text-sm text-mist">{opp.reach} reach</span>
              {opp.excl && <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-green/10 text-green">EXCLUSIVE</span>}
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink">{opp.name}</h2>
            <p className="text-sm text-brown3 mt-1">{opp.meta}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-cream2 border-2 border-gold">
              <span className="text-xl font-bold text-ink">{matchScore}</span>
            </div>
            <button onClick={onClose} className="text-mist hover:text-ink transition-colors text-2xl leading-none">&times;</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-5 gap-0 min-h-full">
            {/* Left Column - 3 cols */}
            <div className="col-span-3 p-8 space-y-6 border-r border-border">
              {/* Highlights */}
              <section>
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Highlights</h3>
                <ul className="space-y-1.5">
                  {opp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brown3">
                      <span className="text-green mt-0.5">&#9679;</span> {h}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Risks */}
              <section>
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Risks</h3>
                <ul className="space-y-1.5">
                  {opp.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brown3">
                      <span className="text-red mt-0.5">&#9679;</span> {r}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Category Fit */}
              <section>
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Category Fit</h3>
                <div className="space-y-2">
                  {catFitEntries.map(([cat, score]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-xs text-brown3 w-24 capitalize">{cat}</span>
                      <div className="flex-1 h-2 bg-cream2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-xs text-ink font-medium w-8 text-right">{score}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Partners */}
              <section>
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Current Partners</h3>
                <div className="flex flex-wrap gap-2">
                  {opp.partners.map((p) => (
                    <span key={p} className="px-3 py-1 text-xs bg-cream2 border border-border rounded-full text-brown3">{p}</span>
                  ))}
                </div>
              </section>

              {/* Rights */}
              <section>
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Available Rights</h3>
                <div className="flex flex-wrap gap-2">
                  {opp.rights.map((r) => (
                    <span key={r} className="px-3 py-1 text-xs bg-green/5 border border-green/20 rounded-full text-green">{r}</span>
                  ))}
                </div>
              </section>

              {/* Tags */}
              <section>
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {opp.tags.map((t) => (
                    <span key={t} className="px-3 py-1 text-xs bg-ink/5 border border-border rounded-full text-ink">{t}</span>
                  ))}
                </div>
              </section>

              {/* News */}
              <section>
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Latest News</h3>
                {newsLoading ? (
                  <p className="text-xs text-mist">Loading news…</p>
                ) : news.length === 0 ? (
                  <p className="text-xs text-mist">No recent news found.</p>
                ) : (
                  <ul className="space-y-2">
                    {news.map((n, i) => (
                      <li key={i}>
                        <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ink hover:text-gold transition-colors">
                          {n.title}
                        </a>
                        <p className="text-[11px] text-mist">{n.source.name} &middot; {new Date(n.publishedAt).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Right Column - 2 cols */}
            <div className="col-span-2 p-8 space-y-6">
              {/* Pricing */}
              <section className="p-4 bg-cream2 rounded-xl">
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Pricing</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-serif text-ink">{formatBudget(opp.budget_min)}</span>
                  <span className="text-mist text-sm">–</span>
                  <span className="text-2xl font-bold font-serif text-ink">{formatBudget(opp.budget_max)}</span>
                </div>
                <p className="text-xs text-mist mt-1">Estimated annual sponsorship range</p>
              </section>

              {/* Audience */}
              <section className="p-4 bg-cream2 rounded-xl">
                <h3 className="font-serif text-sm font-semibold text-ink mb-3">Audience</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Income Score", value: opp.audience.income_score },
                    { label: "Real Followers", value: `${opp.audience.real_follower_pct}%` },
                    { label: "Age 18-34", value: `${opp.audience.age_18_34_pct}%` },
                    { label: "Female", value: `${opp.audience.female_pct}%` },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[11px] text-mist">{s.label}</p>
                      <p className="text-lg font-bold text-ink">{s.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Geography */}
              <section>
                <h3 className="font-serif text-sm font-semibold text-ink mb-2">Geography</h3>
                <div className="flex flex-wrap gap-1.5">
                  {opp.geo.map((g) => (
                    <span key={g} className="px-3 py-1 text-xs bg-cream2 border border-border rounded-full text-brown3">{g}</span>
                  ))}
                </div>
              </section>

              {/* AI Analysis */}
              <section className="p-4 bg-white rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-sm font-semibold text-ink">IVY Intelligence</h3>
                  {!aiAnalysis && !aiLoading && (
                    <button onClick={fetchAI} className="px-3 py-1 text-xs bg-gold text-white rounded-md hover:opacity-90">
                      Generate Analysis
                    </button>
                  )}
                </div>
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-mist">
                    <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    Analysing…
                  </div>
                ) : aiAnalysis ? (
                  <div className="text-sm text-brown3 leading-relaxed whitespace-pre-line">{aiAnalysis}</div>
                ) : (
                  <p className="text-xs text-mist">Click to generate an AI-powered sponsorship analysis.</p>
                )}
              </section>

              {/* Enquire CTA */}
              <section className="p-4 bg-ink rounded-xl">
                {enquirySent ? (
                  <div className="text-center py-4">
                    <p className="text-cream font-serif font-semibold">Enquiry Sent</p>
                    <p className="text-cream/60 text-xs mt-1">We&apos;ll be in touch shortly.</p>
                  </div>
                ) : !enquiryOpen ? (
                  <button onClick={() => setEnquiryOpen(true)} className="w-full py-3 bg-gold text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                    Enquire About {opp.name}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-serif text-sm font-semibold text-cream">Send Enquiry</h3>
                    <input
                      placeholder="Brand category"
                      value={enquiryForm.brand_category}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, brand_category: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/10 text-cream border border-white/20 rounded-md placeholder-cream/40 focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/10 text-cream border border-white/20 rounded-md placeholder-cream/40 focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <textarea
                      placeholder="Message"
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/10 text-cream border border-white/20 rounded-md placeholder-cream/40 focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                    />
                    <button onClick={submitEnquiry} className="w-full py-2.5 bg-gold text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                      Send
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
