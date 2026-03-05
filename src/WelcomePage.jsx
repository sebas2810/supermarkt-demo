import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const APP_VERSION = '2.1.0'
const BUILD_DATE = '5 Mar 2025'

const CHANGELOG = [
  {
    version: '2.1.0',
    date: '5 Mar 2025',
    title: 'Live Claude AI Chat, Brand Logos & Rich Responses',
    changes: [
      { type: 'added', text: 'Live Claude API integration — dashboard and chat powered by Claude Sonnet with full platform context' },
      { type: 'added', text: 'Rich markdown responses — bold, bullet lists, tables, and headings rendered in chat' },
      { type: 'added', text: 'Streaming typewriter effect on AI responses for live generation feel' },
      { type: 'added', text: 'Suggested follow-up question chips after each AI response' },
      { type: 'added', text: 'Starter question chips in empty chat state to guide first interaction' },
      { type: 'added', text: 'Copy button and rotating thinking indicator on chat messages' },
      { type: 'changed', text: 'Replaced all brand icons with real logos via Brandfetch CDN (AH, FL, DL, HF, SS)' },
      { type: 'changed', text: 'Replaced Capgemini and Ahold Delhaize SVG icons with real logos across all views' },
      { type: 'added', text: 'View Results button on Autonomous Execution step' },
      { type: 'changed', text: 'Chat redesigned with Claude-style left/right bubbles, avatars, and timestamps' },
    ],
  },
  {
    version: '2.0.0',
    date: '5 Mar 2025',
    title: 'Landing Page & Agentic Supply Chain Rebrand',
    changes: [
      { type: 'added', text: 'Landing page with value proposition, architecture diagram, AI layer overview, and agentic workflow phases' },
      { type: 'added', text: 'Version badge with expandable changelog history' },
      { type: 'changed', text: 'Rebranded platform from RAISE to Agentic Supply Chain across all views' },
      { type: 'added', text: 'GitHub Pages deployment for public sharing' },
    ],
  },
  {
    version: '1.5.0',
    date: '28 Feb 2025',
    title: 'Digital Twin Workflow & Platform Shell',
    changes: [
      { type: 'added', text: 'Digital Twin workflow — 5 screens: Overview, Burlington NC case study, What-If testing, Feedback Loop, Value at Scale' },
      { type: 'added', text: 'Platform Shell with sidebar navigation, brand selector, breadcrumb navigation, and embedded workflow views' },
      { type: 'added', text: 'Use Case Gallery with domain filters, AI layer badges, and use case detail drawer' },
      { type: 'added', text: 'Generative KPI Dashboard with Claude-powered executive summaries and conversational queries' },
    ],
  },
  {
    version: '1.0.0',
    date: '20 Feb 2025',
    title: 'Fresh Waste Intervention Workflow',
    changes: [
      { type: 'added', text: 'Six-phase agentic workflow — Control Tower, Alert Analysis, Simulation, Governance, Execution, Verification' },
      { type: 'added', text: 'Live intervention queue with animated incident lifecycle and agent orchestration' },
      { type: 'added', text: 'Monte Carlo scenario simulation with Digital Twin integration' },
      { type: 'added', text: 'Human-in-the-loop governance gate with threshold-based escalation' },
      { type: 'added', text: 'Before/after impact verification with animated KPI comparison' },
    ],
  },
  {
    version: '0.1.0',
    date: '12 Feb 2025',
    title: 'Initial Prototype',
    changes: [
      { type: 'added', text: 'Core application shell with Capgemini × Ahold Delhaize branding' },
      { type: 'added', text: 'Five AI layer architecture — ML, SLM, LLM, Agent, Digital Twin' },
      { type: 'added', text: 'Brand data model for Albert Heijn, Food Lion, Delhaize, Hannaford, Stop & Shop' },
    ],
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

// ── AI Layers ──────────────────────────────────────────────────────
const AI_LAYERS = [
  {
    name: 'Machine Learning',
    tag: 'ML',
    color: '#0058AB',
    textColor: 'text-[#0058AB]',
    bgColor: 'bg-[#0058AB]/10',
    borderColor: 'border-[#0058AB]/20',
    description: 'Demand forecasting, anomaly detection, risk scoring, route optimisation',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    name: 'Small Language Model',
    tag: 'SLM',
    color: '#1DB8F2',
    textColor: 'text-cap-cyan',
    bgColor: 'bg-cap-cyan/10',
    borderColor: 'border-cap-cyan/20',
    description: 'Edge classification, IoT signal parsing, real-time risk categorisation at DC level',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    name: 'Large Language Model',
    tag: 'LLM',
    color: '#00D5D0',
    textColor: 'text-cap-turquoise',
    bgColor: 'bg-cap-turquoise/10',
    borderColor: 'border-cap-turquoise/20',
    description: 'Decision briefs, scenario simulation, interactive deliberation with category managers',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    name: 'Agentic AI',
    tag: 'Agent',
    color: '#FF816E',
    textColor: 'text-cap-orange',
    bgColor: 'bg-cap-orange/10',
    borderColor: 'border-cap-orange/20',
    description: 'Autonomous orchestration, human-in-the-loop governance, multi-step intervention execution',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    name: 'Digital Twin',
    tag: 'Twin',
    color: '#00828E',
    textColor: 'text-cap-teal',
    bgColor: 'bg-cap-teal/10',
    borderColor: 'border-cap-teal/20',
    description: 'DC simulation, what-if scenario testing, continuous model learning and feedback loops',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
]

// ── Workflow Phases ─────────────────────────────────────────────────
const WORKFLOW_PHASES = [
  {
    phase: 1,
    name: 'Control Tower',
    role: 'Live AI orchestration, IoT monitoring, incident detection',
    color: '#0058AB',
  },
  {
    phase: 2,
    name: 'Alert Analysis',
    role: 'Risk scoring, SLM classification, LLM decision brief',
    color: '#FF816E',
  },
  {
    phase: 3,
    name: 'Simulation',
    role: 'Digital Twin what-if scenarios, Monte Carlo analysis',
    color: '#1DB8F2',
  },
  {
    phase: 4,
    name: 'Governance',
    role: 'Human-in-the-loop approval, threshold escalation',
    color: '#FEB100',
  },
  {
    phase: 5,
    name: 'Execution',
    role: 'Autonomous multi-system action, POS + supplier + logistics',
    color: '#FF816E',
  },
  {
    phase: 6,
    name: 'Verification',
    role: 'Before/after impact, feedback loop, model improvement',
    color: '#00D5D0',
  },
]

// ── Architecture Layers ────────────────────────────────────────────
const ARCH_LAYERS = [
  {
    label: 'APPLICATION LAYER',
    subtitle: 'What supply chain teams see and use',
    colorClass: 'from-cap-turquoise/15 to-cap-teal/15',
    borderColor: 'border-cap-turquoise/30',
    labelColor: 'text-cap-turquoise',
    cellBg: 'bg-cap-turquoise/10',
    items: [
      { name: 'Control Tower', desc: 'Live orchestration, incident queue, agent monitoring' },
      { name: 'Alert Analysis', desc: 'Risk briefs, SLM classification, decision support' },
      { name: 'Scenario Simulator', desc: 'What-if analysis, Monte Carlo, Digital Twin' },
      { name: 'KPI Dashboard', desc: 'Cross-brand performance, waste metrics, trends' },
      { name: 'Governance Gate', desc: 'Human approval, threshold escalation, audit trail' },
    ],
  },
  {
    label: 'ORCHESTRATION & GOVERNANCE',
    subtitle: 'Agentic coordination layer',
    colorClass: 'from-cap-blue/15 to-cap-cyan/15',
    borderColor: 'border-cap-blue/30',
    labelColor: 'text-cap-cyan',
    cellBg: 'bg-cap-blue/10',
    items: [
      { name: 'LangGraph Harness', desc: 'Agent lifecycle, phase routing, task orchestration' },
      { name: 'Approval Engine', desc: 'Threshold escalation, human-in-the-loop gates' },
      { name: 'Constraint Solver', desc: 'Markdown floors, supplier SLAs, capacity limits' },
      { name: 'MCP + A2A', desc: 'Tool discovery, inter-agent collaboration protocols' },
    ],
  },
  {
    label: 'AI & ANALYTICS MODEL LAYER',
    subtitle: 'Domain-specific intelligence',
    colorClass: 'from-[#7c3aed]/15 to-[#6d28d9]/15',
    borderColor: 'border-[#7c3aed]/30',
    labelColor: 'text-[#a78bfa]',
    cellBg: 'bg-[#7c3aed]/10',
    featured: {
      name: 'Claude — LLM Reasoning Engine',
      desc: 'Primary reasoning for all supply chain agents. Contextual analysis, scenario generation, decision brief drafting, interactive deliberation.',
      bg: 'bg-gradient-to-r from-cap-orange/15 to-cap-yellow/10 border border-cap-orange/25',
      labelColor: 'text-cap-orange',
    },
    items: [
      { name: 'Risk Scoring Models', desc: 'Temperature, freshness, spoilage prediction by product' },
      { name: 'Monte Carlo Engine', desc: 'Probabilistic waste/revenue forecasting, risk quantification' },
      { name: 'RAG + Embeddings', desc: 'Supply chain playbooks, product specs, SLA documents' },
    ],
  },
  {
    label: 'DATA & INTEGRATION LAYER',
    subtitle: 'Enterprise data sources',
    colorClass: 'from-cap-teal/15 to-cap-cyan/10',
    borderColor: 'border-cap-teal/30',
    labelColor: 'text-cap-teal',
    cellBg: 'bg-cap-teal/10',
    items: [
      { name: 'IoT Sensors', desc: 'Temperature, humidity, GPS tracking' },
      { name: 'ERP / SAP', desc: 'Inventory, orders, supplier data' },
      { name: 'POS Systems', desc: 'Real-time sales, markdown execution' },
      { name: 'Weather API', desc: 'Demand impact, logistics planning' },
      { name: 'DC Systems', desc: 'Warehouse management, routing' },
    ],
  },
]

const DESIGN_PRINCIPLES = [
  {
    title: 'Supply-Chain-First',
    desc: 'Architecture designed around fresh product workflows. Every component exists to prevent waste and protect quality from farm to shelf.',
    borderColor: 'border-cap-cyan/20',
    bg: 'bg-cap-cyan/5',
    labelColor: 'text-cap-cyan',
  },
  {
    title: 'Modular & Scalable',
    desc: 'Each layer independently evolvable. Roll out per brand, per region, per product category. Swap AI providers without re-architecting.',
    borderColor: 'border-cap-turquoise/20',
    bg: 'bg-cap-turquoise/5',
    labelColor: 'text-cap-turquoise',
  },
  {
    title: 'Human-in-the-Loop',
    desc: 'AI proposes, humans approve. Configurable by risk threshold, product value, and organisational hierarchy. Complete audit trail.',
    borderColor: 'border-cap-yellow/20',
    bg: 'bg-cap-yellow/5',
    labelColor: 'text-cap-yellow',
  },
]

// ── Use Case Domains ───────────────────────────────────────────────
const DOMAINS = [
  {
    name: 'Fresh',
    color: '#00D5D0',
    textColor: 'text-cap-turquoise',
    bgColor: 'bg-cap-turquoise/10',
    borderColor: 'border-cap-turquoise/20',
    useCases: ['Predictive Fresh Waste Prevention', 'Supplier Risk Monitor'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
  },
  {
    name: 'Demand',
    color: '#1DB8F2',
    textColor: 'text-cap-cyan',
    bgColor: 'bg-cap-cyan/10',
    borderColor: 'border-cap-cyan/20',
    useCases: ['AI Demand Sensing', 'Autonomous Replenishment'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    name: 'Logistics',
    color: '#FF816E',
    textColor: 'text-cap-orange',
    bgColor: 'bg-cap-orange/10',
    borderColor: 'border-cap-orange/20',
    useCases: ['Dynamic DC Routing', 'Store Energy Optimisation'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5 0h6.75c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H11.25m-3 0h3m-3 0a1.125 1.125 0 0 0-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h3" />
      </svg>
    ),
  },
  {
    name: 'Commercial',
    color: '#FEB100',
    textColor: 'text-cap-yellow',
    bgColor: 'bg-cap-yellow/10',
    borderColor: 'border-cap-yellow/20',
    useCases: ['Promotion ROI Optimiser', 'Dynamic Markdown Intelligence'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
]

export default function WelcomePage({ onEnter }) {
  const [showChangelog, setShowChangelog] = useState(false)

  return (
    <div className="relative w-screen h-screen overflow-y-auto overflow-x-hidden" style={{ background: '#0A0E1F' }}>
      {/* Background gradient effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cap-blue/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cap-teal/5 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-navy-light/20 rounded-full blur-[160px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* ═══════ HERO ═══════ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-16"
        >
          {/* Capgemini × Ahold Delhaize dual branding */}
          <motion.div variants={fadeInUp} custom={0} className="flex justify-center items-center gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <img
                src="https://cdn.brandfetch.io/capgemini.com"
                alt="Capgemini"
                className="w-9 h-9 rounded-lg object-contain shadow-lg shadow-cap-cyan/20"
              />
              <div className="text-left">
                <span className="text-sm font-semibold text-white tracking-wide block leading-tight">Capgemini</span>
                <span className="text-[9px] text-cap-cyan/70 tracking-wide">Enterprise AI at Scale</span>
              </div>
            </div>
            <div className="h-8 w-px bg-navy-mid" />
            <div className="flex items-center gap-2.5">
              <img
                src="https://cdn.brandfetch.io/aholddelhaize.com"
                alt="Ahold Delhaize"
                className="w-9 h-9 rounded-lg object-contain shadow-lg shadow-ah-blue/20"
              />
              <div className="text-left">
                <span className="text-sm font-semibold text-white tracking-wide block leading-tight">Ahold Delhaize</span>
                <span className="text-[9px] text-ah-blue/70 tracking-wide">Global Retail Leader</span>
              </div>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="text-5xl font-bold text-white tracking-tight mb-4"
          >
            Predictive Fresh Supply Chain
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            custom={2}
            className="text-lg text-gray-400 max-w-3xl mx-auto mb-3"
          >
            AI-powered fresh produce orchestration from farm to shelf
          </motion.p>

          <motion.div variants={fadeInUp} custom={3} className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-navy-mid" />
            <span className="text-xs text-gray-500 uppercase tracking-widest">Five AI layers &middot; Six autonomous agents &middot; One platform</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-navy-mid" />
          </motion.div>

          {/* Version badge — clickable */}
          <motion.div variants={fadeInUp} custom={3.5} className="flex justify-center mb-6">
            <button
              onClick={() => setShowChangelog(prev => !prev)}
              className="group inline-flex items-center gap-2 rounded-full border border-navy-mid/60 bg-navy-light/80 backdrop-blur-sm px-3.5 py-1.5 transition-all hover:border-gray-600 hover:bg-navy-light"
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cap-turquoise uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cap-turquoise animate-pulse" />
                v{APP_VERSION}
              </span>
              <span className="h-3 w-px bg-navy-mid" />
              <span className="text-[10px] text-gray-400">{BUILD_DATE}</span>
              <span className="h-3 w-px bg-navy-mid" />
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">
                What&apos;s new {showChangelog ? '\u2191' : '\u2193'}
              </span>
            </button>
          </motion.div>

          {/* Proposition statement */}
          <motion.div
            variants={fadeInUp}
            custom={4}
            className="max-w-2xl mx-auto rounded-xl border border-navy-mid/50 bg-navy-light/60 backdrop-blur-sm p-5"
          >
            <p className="text-sm text-gray-300 leading-relaxed">
              Built on <span className="text-cap-cyan font-medium">Capgemini&apos;s enterprise AI platforms and delivery at scale</span>,
              applied to <span className="text-[#5B9BD5] font-medium">Ahold Delhaize&apos;s fresh supply chain operations</span> —
              reducing waste, recovering revenue, and protecting product quality across 3,500+ stores.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-cap-cyan/60" />
                AI orchestration at scale
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-ah-blue/60" />
                Fresh supply chain domain
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-cap-turquoise/60" />
                Measurable waste reduction
              </div>
            </div>
          </motion.div>

          {/* Primary CTA */}
          <motion.div variants={fadeInUp} custom={5} className="flex justify-center mt-8">
            <button
              onClick={onEnter}
              className="group relative inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-cap-blue to-cap-cyan px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-cap-blue/20 transition-all duration-300 hover:shadow-cap-cyan/30 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cap-cyan/50"
            >
              Enter Intelligent Control Tower
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </motion.div>
        </motion.div>

        {/* ═══════ THE CHALLENGE ═══════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} custom={0} className="text-center mb-8">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">The Challenge</h2>
            <p className="text-xs text-gray-500">Fresh product waste costs retailers billions annually — most of it is preventable</p>
          </motion.div>

          <motion.div variants={fadeInUp} custom={1} className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {/* Traditional */}
              <div className="rounded-xl border border-navy-mid/50 bg-navy-light/50 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-navy-mid/10 rounded-full blur-[40px]" />
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">Traditional Approach</span>
                <div className="mt-4 mb-3">
                  <span className="text-4xl font-bold text-gray-500">Reactive</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                    Manual temperature checks at DCs
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                    End-of-day markdown decisions
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                    Spreadsheet-based waste reporting
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                    Siloed brand-by-brand operations
                  </div>
                </div>
                <div className="mt-5 h-1.5 rounded-full bg-navy overflow-hidden">
                  <div className="h-full w-1/4 rounded-full bg-gray-600" />
                </div>
              </div>

              {/* Agentic */}
              <div className="rounded-xl border border-cap-cyan/20 bg-gradient-to-br from-cap-blue/5 via-cap-cyan/5 to-transparent bg-navy-light/50 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cap-cyan/10 rounded-full blur-[40px]" />
                <span className="text-[10px] uppercase tracking-widest text-cap-cyan font-medium">Agentic Supply Chain</span>
                <div className="mt-4 mb-3">
                  <span className="text-4xl font-bold text-white">Predictive</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-1 h-1 rounded-full bg-cap-cyan" />
                    Continuous IoT monitoring across all DCs
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-1 h-1 rounded-full bg-cap-cyan" />
                    AI-optimised markdown timing and depth
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-1 h-1 rounded-full bg-cap-cyan" />
                    Autonomous intervention with human oversight
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-1 h-1 rounded-full bg-cap-cyan" />
                    Cross-brand AI orchestration platform
                  </div>
                </div>
                <div className="mt-5 h-1.5 rounded-full bg-navy overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-cap-blue to-cap-cyan"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════ DEMO SCOPE ═══════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} custom={0} className="text-center mb-8">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">Demo Scope</h2>
            <p className="text-xs text-gray-500">Albert Heijn Midlands DC — cold chain breach incident</p>
          </motion.div>

          <motion.div variants={fadeInUp} custom={1} className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: '5', label: 'Brands', detail: 'AH, Food Lion, Delhaize, Hannaford, Stop & Shop' },
                { value: '8', label: 'AI Use Cases', detail: 'Across Fresh, Demand, Logistics, Commercial' },
                { value: '26%', label: 'Waste Reduction', detail: 'Albert Heijn pilot results' },
                { value: '€1.2M', label: 'Revenue Recovered', detail: 'In 90-day intervention window' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  custom={i + 2}
                  className="rounded-xl border border-navy-mid/50 bg-navy-light/50 p-4 text-center"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs font-medium text-gray-300 mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{stat.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════ 5 AI LAYERS ═══════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} custom={0} className="text-center mb-8">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">Five AI Layers</h2>
            <p className="text-xs text-gray-500">From edge inference to autonomous orchestration — the full AI stack</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {AI_LAYERS.map((layer, i) => (
              <motion.div
                key={layer.name}
                variants={fadeInUp}
                custom={i + 1}
                className={`group rounded-xl border ${layer.borderColor} ${layer.bgColor} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${layer.bgColor} flex items-center justify-center ${layer.textColor}`}>
                    {layer.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${layer.bgColor} ${layer.textColor}`}>
                    {layer.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{layer.name}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">{layer.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════ USE CASE DOMAINS ═══════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} custom={0} className="text-center mb-8">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">Use Case Portfolio</h2>
            <p className="text-xs text-gray-500">Eight AI applications across four supply chain domains</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOMAINS.map((domain, i) => (
              <motion.div
                key={domain.name}
                variants={fadeInUp}
                custom={i + 1}
                className={`rounded-xl border ${domain.borderColor} bg-gradient-to-b from-[${domain.color}]/10 to-transparent bg-navy-light/40 p-5 backdrop-blur-sm`}
              >
                <div className={`mb-3 ${domain.textColor}`}>{domain.icon}</div>
                <h3 className="text-base font-semibold text-white mb-3">{domain.name}</h3>
                <ul className="space-y-1.5">
                  {domain.useCases.map(uc => (
                    <li key={uc} className="flex items-start gap-2 text-xs text-gray-400">
                      <div className="w-1 h-1 rounded-full mt-1.5 flex-none" style={{ backgroundColor: domain.color }} />
                      {uc}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════ 6-PHASE WORKFLOW ═══════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} custom={0} className="text-center mb-8">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">Agentic Workflow</h2>
            <p className="text-xs text-gray-500">Six autonomous phases — from incident detection to verified outcome</p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {WORKFLOW_PHASES.map((phase, i) => (
                <motion.div
                  key={phase.phase}
                  variants={fadeInUp}
                  custom={i + 1}
                  className="relative rounded-xl border border-navy-mid/50 bg-navy-light/40 p-4 backdrop-blur-sm"
                  style={{ borderColor: `${phase.color}30` }}
                >
                  <div
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full mb-3"
                    style={{ backgroundColor: `${phase.color}20` }}
                  >
                    <span className="text-xs font-bold" style={{ color: phase.color }}>{phase.phase}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{phase.name}</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{phase.role}</p>

                  {/* Connector arrow */}
                  {i < WORKFLOW_PHASES.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2.5 -translate-y-1/2 z-10">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══════ REFERENCE ARCHITECTURE ═══════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.div variants={fadeInUp} custom={0} className="text-center mb-8">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">Reference Architecture</h2>
            <p className="text-xs text-gray-500">Modular layers connecting IoT signals to autonomous fresh interventions</p>
          </motion.div>

          <motion.div variants={fadeInUp} custom={1} className="max-w-5xl mx-auto space-y-2.5">
            {ARCH_LAYERS.map((layer) => (
              <div
                key={layer.label}
                className={`rounded-xl p-3.5 bg-gradient-to-r ${layer.colorClass} border ${layer.borderColor}`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[10px] font-bold tracking-widest ${layer.labelColor}`}>{layer.label}</span>
                  <span className="text-[10px] text-gray-500">{layer.subtitle}</span>
                </div>

                {/* Featured item (AI Model layer) */}
                {layer.featured && (
                  <div className="mb-2.5">
                    <div className={`rounded-lg p-2.5 text-center ${layer.featured.bg}`}>
                      <div className={`font-bold text-sm mb-0.5 ${layer.featured.labelColor}`}>{layer.featured.name}</div>
                      <div className="text-[10px] text-gray-400 leading-relaxed max-w-xl mx-auto">{layer.featured.desc}</div>
                    </div>
                  </div>
                )}

                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${layer.items.length}, 1fr)` }}>
                  {layer.items.map((item) => (
                    <div key={item.name} className={`rounded-lg p-2 text-center ${layer.cellBg}`}>
                      <div className="font-semibold text-[11px] text-white mb-0.5">{item.name}</div>
                      <div className="text-[10px] text-gray-400 leading-snug">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Flow direction */}
            <div className="flex justify-center py-1">
              <span className="text-[9px] text-gray-500 tracking-wider uppercase">Signals flow up &middot; Decisions flow down</span>
            </div>

            {/* Design principles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DESIGN_PRINCIPLES.map((p) => (
                <div key={p.title} className={`rounded-lg p-3.5 ${p.bg} border ${p.borderColor}`}>
                  <div className={`font-bold text-xs mb-1.5 ${p.labelColor}`}>{p.title}</div>
                  <div className="text-[10px] text-gray-400 leading-relaxed">{p.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════ CHANGELOG ═══════ */}
        <AnimatePresence>
          {showChangelog && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-20 overflow-hidden"
            >
              <div className="text-center mb-8">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">What&apos;s New</h2>
                <p className="text-xs text-gray-500">Changelog and version history</p>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                {CHANGELOG.map((entry, ei) => (
                  <motion.div
                    key={entry.version}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ei * 0.08, duration: 0.4 }}
                    className={`rounded-xl border ${ei === 0 ? 'border-cap-turquoise/30 bg-cap-turquoise/5' : 'border-navy-mid/50 bg-navy-light/50'} p-5`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                        ei === 0 ? 'bg-cap-turquoise/15 text-cap-turquoise' : 'bg-navy-mid/50 text-gray-400'
                      }`}>
                        {ei === 0 && <span className="w-1.5 h-1.5 rounded-full bg-cap-turquoise" />}
                        v{entry.version}
                      </span>
                      <span className="text-[10px] text-gray-500">{entry.date}</span>
                      <span className="h-3 w-px bg-navy-mid" />
                      <span className={`text-xs font-medium ${ei === 0 ? 'text-white' : 'text-gray-300'}`}>{entry.title}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {entry.changes.map((change, ci) => (
                        <li key={ci} className="flex items-start gap-2 text-xs">
                          <span className={`shrink-0 mt-0.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            change.type === 'added' ? 'bg-cap-turquoise/15 text-cap-turquoise' :
                            change.type === 'changed' ? 'bg-cap-cyan/15 text-cap-cyan' :
                            'bg-cap-yellow/15 text-cap-yellow'
                          }`}>{change.type}</span>
                          <span className="text-gray-400 leading-relaxed">{change.text}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ═══════ BOTTOM CTA ═══════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center pb-12"
        >
          <motion.div variants={fadeInUp} custom={0}>
            <button
              onClick={onEnter}
              className="group relative inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-cap-blue to-cap-cyan px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-cap-blue/20 transition-all duration-300 hover:shadow-cap-cyan/30 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cap-cyan/50"
            >
              Enter Intelligent Control Tower
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            custom={1}
            className="text-xs text-gray-500 mt-4"
          >
            Interactive demo &middot; No real data &middot; Ahold Delhaize &times; Capgemini &middot; v{APP_VERSION}
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
