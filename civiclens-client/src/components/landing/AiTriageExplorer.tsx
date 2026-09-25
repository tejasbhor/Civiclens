import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { 
  BrainCircuit, 
  GitMerge, 
  UserCheck2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface SampleComplaint {
  id: string;
  label: string;
  text: string;
  category: string;
  categoryConfidence: number;
  urgency: string;
  urgencyScore: number;
  urgencyColor: string;
  department: string;
  sla: string;
  duplicateCluster: {
    isDuplicate: boolean;
    similarity: number;
    parentTicket?: string;
    details: string;
  };
}

const SAMPLE_COMPLAINTS: SampleComplaint[] = [
  {
    id: "pothole",
    label: "Road Hazard",
    text: "Deep hazardous pothole on the left lane of ring road near the flyover ramp. Vehicles are braking abruptly and two-wheelers risk skidding.",
    category: "Roads & Infrastructure",
    categoryConfidence: 94.2,
    urgency: "High Priority",
    urgencyScore: 0.88,
    urgencyColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    department: "Public Works Department",
    sla: "24 Hours",
    duplicateCluster: {
      isDuplicate: true,
      similarity: 0.88,
      parentTicket: "#CIV-8411",
      details: "Clustered with report filed 18 mins ago at same coordinates (18.5204° N, 73.8567° E)"
    }
  },
  {
    id: "transformer",
    label: "Electrical Sparking",
    text: "High-voltage transformer sparking continuously on overhead pole outside Colony Gate 3 after heavy rainfall. Spark shower onto pavement.",
    category: "Electrical & Public Safety",
    categoryConfidence: 98.7,
    urgency: "Critical Emergency",
    urgencyScore: 0.98,
    urgencyColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    department: "Electricity Board & Fire Safety",
    sla: "6 Hours",
    duplicateCluster: {
      isDuplicate: false,
      similarity: 0.24,
      details: "Unique emergency incident. 0 matching clusters detected within 500m radius."
    }
  },
  {
    id: "sewage",
    label: "Drainage Overflow",
    text: "Main sewer line overflowing across pedestrian walkway near Shivaji Park playground. Foul smell and contaminated runoff pooling near residential gate.",
    category: "Sanitation & Drainage",
    categoryConfidence: 96.5,
    urgency: "High Priority",
    urgencyScore: 0.89,
    urgencyColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    department: "Water Supply & Sewerage Board",
    sla: "12 Hours",
    duplicateCluster: {
      isDuplicate: true,
      similarity: 0.92,
      parentTicket: "#CIV-8390",
      details: "High confidence duplicate (92% semantic cosine similarity). Auto-linked to open work order."
    }
  },
  {
    id: "garbage",
    label: "Waste Collection",
    text: "Commercial waste bins behind local market haven't been cleared for four days. Stray animals scattering plastic across the service road.",
    category: "Solid Waste Management",
    categoryConfidence: 95.1,
    urgency: "Medium Priority",
    urgencyScore: 0.62,
    urgencyColor: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    department: "Municipal Sanitation Department",
    sla: "48 Hours",
    duplicateCluster: {
      isDuplicate: false,
      similarity: 0.41,
      details: "No active tickets nearby. Dispatched to morning beat collection route."
    }
  }
];

export function AiTriageExplorer() {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_COMPLAINTS[0].id);
  const [humanOverrideActive, setHumanOverrideActive] = useState<boolean>(false);

  const active = SAMPLE_COMPLAINTS.find((c) => c.id === selectedId) || SAMPLE_COMPLAINTS[0];

  return (
    <section 
      id="ai-triage" 
      className="py-24 lg:py-32 bg-slate-900 text-slate-100 relative overflow-hidden border-t border-b border-slate-800"
      aria-label="Interactive AI triage and duplicate clustering explorer"
    >
      {/* Precision Background Ambience */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
        backgroundSize: "32px 32px"
      }} />

      <div className="container !px-5 max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono font-semibold text-emerald-400 mb-4">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Text-Based Machine Learning • Zero-Shot BART & MiniLM</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.12] text-balance">
            Triage that saves municipal dispatchers hours.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed text-balance">
            Civic complaints arrive in unformatted, conversational text. Our server-side NLP models read the text, 
            score severity, cluster semantic duplicates, and suggest departments — with mandatory human override controls.
          </p>
        </div>

        {/* Interactive Complaint Selector Tabs */}
        <div className="mt-10 flex flex-wrap gap-2.5 items-center">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 mr-2">Select Complaint:</span>
          {SAMPLE_COMPLAINTS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setHumanOverrideActive(false);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                selectedId === item.id 
                  ? "bg-emerald-500 text-slate-950 shadow-sm" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Interactive Demonstration Workspace */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Complaint Ingest & Vector Analysis */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Raw Citizen Text Input Box */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono pb-3 border-b border-slate-800/80">
                <span>Citizen Input Payload</span>
                <span>Unstructured Natural Language</span>
              </div>
              <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed italic font-serif">
                "{active.text}"
              </p>
            </div>

            {/* Semantic Duplicate Clustering Card */}
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200 font-display">MiniLM Vector Similarity & Clustering</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Threshold: 0.75</span>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${
                  active.duplicateCluster.isDuplicate ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {active.duplicateCluster.isDuplicate ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {active.duplicateCluster.isDuplicate ? "Duplicate Cluster Detected" : "Unique Event Confirmed"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      (Cosine: {(active.duplicateCluster.similarity * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {active.duplicateCluster.details}
                  </p>
                </div>
              </div>
            </div>

            {/* Human in the Loop Notice */}
            <div className="rounded-2xl bg-slate-850 border border-slate-800/80 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <UserCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Human-in-the-Loop Override</span>
                  <span className="text-[11px] text-slate-400 block">Dispatchers can adjust categorization or re-route anytime.</span>
                </div>
              </div>

              <button
                onClick={() => setHumanOverrideActive(!humanOverrideActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all active:scale-[0.98] ${
                  humanOverrideActive 
                    ? "bg-amber-500 text-slate-950" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {humanOverrideActive ? "Override Active" : "Simulate Override"}
              </button>
            </div>

          </div>

          {/* Right Column: AI Model Inferences & Routing Output */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-7 shadow-xl h-full flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    BART Zero-Shot Inference
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${active.urgencyColor}`}>
                    {active.urgency}
                  </span>
                </div>

                {/* Category Confidence Meter */}
                <div className="mt-6">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-400 font-medium">Inferred Category:</span>
                    <span className="font-bold text-white font-mono">{active.category} ({active.categoryConfidence}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${active.categoryConfidence}%` }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                {/* Urgency Score Meter */}
                <div className="mt-5">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-400 font-medium">Severity / Urgency Score:</span>
                    <span className="font-bold text-amber-400 font-mono">{(active.urgencyScore * 10).toFixed(1)} / 10.0</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${active.urgencyScore * 100}%` }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                {/* Department Dispatch Card */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Department Dispatch Route</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>{humanOverrideActive ? "Special Disaster Response Cell (Overridden)" : active.department}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>SLA: {active.sla}</span>
                    </span>
                  </div>

                  {humanOverrideActive && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-slate-800 text-xs text-amber-300 font-mono"
                    >
                      Audit Entry: Re-routed by Municipal Supervisor. Reason: "Immediate school bus route hazard."
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Technical Footnote */}
              <div className="mt-8 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>Model: facebook/bart-large-mnli</span>
                <span>Clustering: all-MiniLM-L6-v2</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
