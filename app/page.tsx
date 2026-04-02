'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* ── NAV ── */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">
              ⊕
            </div>
            <span className="text-xl font-bold tracking-tight">CompeteScope</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get started free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-950/50 border border-blue-800/50 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          ⚡ AI-powered competitor tracking
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-none">
          Know what competitors
          <br />
          <span className="text-blue-500">are doing next</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          AI-powered competitive intelligence for early-stage SaaS founders. Monitor competitors,
          detect changes, and get weekly strategic insights—without the $10K/year enterprise price.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Get started free →
          </Link>
          <span className="text-slate-500 text-sm">No credit card required</span>
        </div>

        {/* Dashboard preview */}
        <div className="mt-20 rounded-2xl border border-white/10 bg-[#1e293b] overflow-hidden shadow-2xl shadow-blue-950/50">
          <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-slate-500 font-mono">
              competescope.app/dashboard
            </span>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4 text-left">
            {[
              { name: 'Stripe', update: 'Pricing updated · 2h ago', pct: 75 },
              { name: 'Linear', update: 'New feature launched · 1d ago', pct: 45 },
              { name: 'Notion', update: 'Homepage redesign · 3d ago', pct: 60 },
            ].map((item) => (
              <div
                key={item.name}
                className="bg-[#0f172a] rounded-xl p-4 border border-white/5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-blue-800 flex items-center justify-center text-xs font-bold">
                    {item.name[0]}
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="text-xs text-slate-400">{item.update}</div>
                <div className="mt-3 h-1.5 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to stay ahead
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '👁️',
              title: 'Continuous Monitoring',
              desc: 'We scrape competitor sites daily — homepage, pricing, changelog — and detect every change automatically.',
            },
            {
              icon: '🔔',
              title: 'Weekly AI Digests',
              desc: 'Get narrative summaries with strategic insights every Monday. Not raw diffs — actionable intelligence.',
            },
            {
              icon: '📊',
              title: 'Change History',
              desc: 'Full timeline of competitor updates with AI analysis. Never miss a pricing shift or feature launch again.',
            },
            {
              icon: '⚡',
              title: 'Instant Alerts',
              desc: 'Critical changes (pricing, product launch) trigger immediate email notifications.',
            },
            {
              icon: '🛡️',
              title: 'Secure & Private',
              desc: 'Your competitive intelligence stays private. Row-level security, GDPR compliant.',
            },
            {
              icon: '🌐',
              title: 'Multi-project',
              desc: 'Track competitors across multiple product lines or market segments from one dashboard.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 hover:border-blue-800/50 transition-colors"
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-center text-slate-400 mb-12">
          Start free. Upgrade when you need more.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              name: 'Starter',
              price: '$49',
              features: [
                '3 projects',
                '10 competitors',
                'Weekly AI digests',
                'Email alerts',
                'Change history (30 days)',
              ],
              cta: 'Start free',
              featured: false,
            },
            {
              name: 'Pro',
              price: '$129',
              features: [
                'Unlimited projects',
                '50 competitors',
                'Daily monitoring',
                'Slack integration',
                'Unlimited history',
                'API access',
              ],
              cta: 'Start free trial',
              featured: true,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${
                plan.featured
                  ? 'bg-blue-600/20 border-blue-500/50'
                  : 'bg-[#1e293b] border-white/10'
              }`}
            >
              {plan.featured && (
                <div className="text-xs text-blue-300 font-medium mb-3 uppercase tracking-wider">
                  Most popular
                </div>
              )}
              <div className="text-2xl font-bold mb-1">{plan.name}</div>
              <div className="text-4xl font-extrabold mb-1">
                {plan.price}
                <span className="text-lg font-normal text-slate-400">/mo</span>
              </div>
              <ul className="mt-6 mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-blue-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                  plan.featured
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 px-6 py-10 mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
                ⊕
              </div>
              <span className="font-bold">CompeteScope</span>
              <span className="text-slate-500 text-sm ml-2">© 2024</span>
            </div>

            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <a
                href="mailto:aitor@aitoralmu.xyz"
                className="hover:text-white transition-colors"
              >
                📧 aitor@aitoralmu.xyz
              </a>
              <a
                href="https://www.linkedin.com/in/aitoralarcon/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                💼 LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
