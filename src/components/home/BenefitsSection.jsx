import React from 'react';
import { PiggyBank, HeartHandshake, Leaf, Shield, BadgeIndianRupee, Lock } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: PiggyBank,
      title: 'Save Unnecessary Purchases',
      desc: 'The average power drill is used for only 13 minutes in its entire lifespan! Why spend ₹4,000 when you can borrow it for ₹35?',
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      icon: BadgeIndianRupee,
      title: 'Earn Passive Rental Income',
      desc: 'Lenders earn steady pocket income on high-value tools sitting in storage cupboards or garage racks.',
      color: 'bg-sky-100 text-sky-700'
    },
    {
      icon: Shield,
      title: 'Security Deposit Protection',
      desc: 'Owners set fair security deposits that are automatically held and refunded once tools are returned in pristine shape.',
      color: 'bg-amber-100 text-amber-700'
    },
    {
      icon: Lock,
      title: 'Privacy-Safe Location Sharing',
      desc: 'Exact house addresses are kept private. Only approximate neighbourhood radius is shown until a booking is confirmed.',
      color: 'bg-indigo-100 text-indigo-700'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly Circular Economy',
      desc: 'Less manufacturing, less packaging waste, and fewer redundant gadgets sitting in landfills. Share resources locally.',
      color: 'bg-teal-100 text-teal-700'
    },
    {
      icon: HeartHandshake,
      title: 'Helpful Neighbourhood Network',
      desc: 'Build real relationships with nearby families. Mutual sharing turns strangers in high-rises into trusted friends.',
      color: 'bg-rose-100 text-rose-700'
    }
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Why NeighbourShare?
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">
            Benefits of Community Sharing
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Transforming neighbourhoods into self-reliant, friendly resource hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
