import { motion, useReducedMotion } from "motion/react";
import { Check, ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Tilt, TiltContent } from "@/components/animate-ui/primitives/effects/tilt";

interface PersonaCard {
  role: string;
  headline: string;
  image: string;
  imageAlt: string;
  points: string[];
  link: string;
}

const PERSONAS: PersonaCard[] = [
  {
    role: "FOR RESIDENTS",
    headline: "Your voice on the city map.",
    image: "/images/resident-phone.jpg",
    imageAlt: "Resident using smartphone outdoors",
    points: [
      "Report in seconds with photo and GPS",
      "Live timeline from dispatch to fix",
      "Photo-verified proof of completion"
    ],
    link: "/citizen/login",
  },
  {
    role: "FOR FIELD TEAMS",
    headline: "The right job. Zero guesswork.",
    image: "/images/field-officer.jpg",
    imageAlt: "Field officer with rugged tablet on city street",
    points: [
      "Exact locations with report photos",
      "Offline sync in cellular dead zones",
      "One-tap before & after completion"
    ],
    link: "/officer/login",
  },
  {
    role: "FOR CITY LEADERS",
    headline: "Real-time clarity across every ward.",
    image: "/images/city-director.jpg",
    imageAlt: "City operations director looking at monitoring dashboard",
    points: [
      "Automated triage with zero duplicate clutter",
      "Live SLA tracking & department analytics",
      "Complete audit trail for civic accountability"
    ],
    link: "/admin/login",
  },
];

export function StakeholderGrid() {
  const reduce = useReducedMotion();

  return (
    <section id="stakeholders" className="relative overflow-hidden pt-10 pb-20 lg:pt-14 lg:pb-28 bg-white border-b border-slate-200/80">
      {/* Ambient background lighting & civic dot grid texture */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-60" />
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.25) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)" }}
        />
      </div>

      <div className="container !px-5 max-w-7xl mx-auto relative z-10">
        {/* Header directly matching reference */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">
              BUILT FOR PEOPLE
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-slate-950 font-display leading-[1.06]">
              Designed for <span className="text-emerald-700">impact.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:self-end">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              DIFFERENT ROLES. A BRIGHTER TOMORROW.
            </span>
            <Link
              to="/documentation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 shadow-xs transition-colors"
            >
              <span>Explore all solutions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3-Column Persona Cards + Right Testimonial */}
        <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-8 items-stretch">
          {/* 3 Persona Cards with 3D Spatial Tilt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PERSONAS.map((persona, i) => (
              <Tilt key={persona.role} maxTilt={reduce ? 0 : 8} perspective={900} className="h-full">
                <TiltContent className="h-full">
                  <motion.div
                    className="flex flex-col h-full rounded-3xl border border-white/80 bg-white/80 backdrop-blur-2xl overflow-hidden shadow-sm hover:shadow-xl transition-[border-color,box-shadow,transform] duration-200 hover:border-teal-500/50 active:scale-[0.98]"
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {/* Photo Header */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <img
                        src={persona.image}
                        alt={persona.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase text-emerald-300 border border-emerald-500/30 shadow-md">
                        {persona.role}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 mb-3 font-display">
                          {persona.headline}
                        </h3>
                        <ul className="space-y-2 text-xs text-slate-600">
                          {persona.points.map((point) => (
                            <li key={point} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        to={persona.link}
                        className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-teal-600 transition-colors pt-2 border-t border-slate-100 active:scale-95"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </motion.div>
                </TiltContent>
              </Tilt>
            ))}
          </div>

          {/* Right Testimonial Card with Subtle 3D Tilt */}
          <Tilt maxTilt={reduce ? 0 : 5} perspective={1000} className="h-full">
            <TiltContent className="h-full">
              <motion.div
                className="h-full rounded-3xl border border-white/80 bg-white/80 backdrop-blur-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl relative overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:border-emerald-500/40"
                initial={reduce ? false : { opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="space-y-6">
                  <Quote className="w-8 h-8 text-teal-600/40" />
                  <blockquote className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed italic font-display">
                    "CivicLens helps us listen better, respond faster, and deliver real results for our community."
                  </blockquote>
                </div>

                <div className="pt-6 border-t border-slate-200/60 mt-6">
                  <div className="font-bold text-sm text-slate-900">
                    Jasmine R.
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    City Administrator, Riverside, CA
                  </div>
                </div>
              </motion.div>
            </TiltContent>
          </Tilt>
        </div>
      </div>
    </section>
  );
}
