import React from 'react';
import { Search, CalendarCheck, QrCode, ThumbsUp, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Find & Check Availability',
      desc: 'Search drilling machines, ladders, pressure washers or toolkits available right in your neighbourhood.',
      icon: Search,
      color: 'bg-emerald-500 text-white'
    },
    {
      step: '02',
      title: 'Calculate Rent & Request',
      desc: 'Pick your hours or days. The platform automatically calculates the rental fee and refundable deposit.',
      icon: CalendarCheck,
      color: 'bg-sky-500 text-white'
    },
    {
      step: '03',
      title: 'QR Code Handover',
      desc: 'Meet your neighbour. Scan the transaction QR code or enter the 6-digit OTP to safely hand over the item.',
      icon: QrCode,
      color: 'bg-amber-500 text-white'
    },
    {
      step: '04',
      title: 'Return & Build Trust',
      desc: 'Mark as returned. The owner confirms condition, the security deposit is released, and trust scores go up!',
      icon: ThumbsUp,
      color: 'bg-purple-500 text-white'
    }
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3">
            How NeighbourShare Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Seamless borrowing and lending designed with privacy, safety, and community trust in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/80 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-2xl font-black text-slate-600 group-hover:text-emerald-400/60 transition-colors">
                    {s.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
