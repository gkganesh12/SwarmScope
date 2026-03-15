import { useState, useRef } from 'react';
import SwarmCanvas from '../components/SwarmCanvas';
import { UploadCloud, Terminal, Play, ArrowDown, Zap, Shield, BarChart3, Users, Cpu, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

/* ── animation variants ───────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── workflow steps ───────────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Graph Construction', desc: 'Seed extraction & entity-relation graph via GraphRAG' },
  { num: '02', title: 'Environment Setup', desc: 'Agent profile generation & simulation parameter injection' },
  { num: '03', title: 'Run Simulation', desc: 'Dual-platform parallel simulation with dynamic memory' },
  { num: '04', title: 'Report Generation', desc: 'ReportAgent deep-dives into post-simulation environment' },
  { num: '05', title: 'Deep Interaction', desc: 'Converse with any agent or the ReportAgent directly' },
];

/* ── features ─────────────────────────────────────────── */
const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Run thousands of agent simulations in minutes, not hours.' },
  { icon: Shield, title: 'High Fidelity', desc: 'Realistic agent behaviors with memory, goals, and social dynamics.' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Post-simulation reports with actionable insights and trends.' },
  { icon: Users, title: '5,000+ Agents', desc: 'Scale from a handful to thousands of concurrent agents.' },
  { icon: Cpu, title: 'Dual-Platform', desc: 'Parallel execution across multiple simulation engines.' },
  { icon: Globe, title: 'Any Domain', desc: 'Market research, policy testing, social dynamics, and more.' },
];

/* ── component ────────────────────────────────────────── */
export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    if (e.dataTransfer.files?.length) setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
  };
  const canSubmit = files.length > 0 && prompt.trim() !== '';

  return (
    <div className="home-root">

      {/* ─── Nav ─────────────────────────────────────── */}
      <motion.nav
        className="nav"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav-left">
          <span className="nav-brand">SWARMSCOPE</span>
          <span className="nav-badge">PREVIEW</span>
        </div>
        <div className="nav-links">
          <a href="#">Docs</a>
          <a href="#">API</a>
          <a href="#">GitHub&nbsp;<span className="arrow">↗</span></a>
        </div>
      </motion.nav>

      {/* ─── Hero Section ────────────────────────────── */}
      <section className="hero">
        <div className="hero-canvas-bg">
          <SwarmCanvas />
          <div className="hero-canvas-fade" />
        </div>

        <div className="hero-left">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <span className="tag">MULTI-AGENT SIMULATION ENGINE</span>
          </motion.div>

          <motion.h1 className="hero-title" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            Upload Seed Data.
            <br />
            <span className="gradient-text">Simulate Reality.</span>
          </motion.h1>

          <motion.div className="hero-desc" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            <p>
              Even a single paragraph of text — <strong className="hl-bold">SwarmScope</strong> auto-generates
              a parallel world with up to <span className="hl-accent">thousands of Agents</span> from your
              unstructured data. Inject variables from a God's-eye view and find the&nbsp;
              <span className="hl-code">"local optimum"</span>
            </p>
            <p className="slogan">
              Simulate before you decide — test every outcome before committing to one<span className="blink">_</span>
            </p>
          </motion.div>

          <motion.div className="hero-cta-row" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <button
              className="hero-btn-primary"
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
              <ArrowDown size={14} />
            </button>
            <button className="hero-btn-secondary">
              View Docs
            </button>
          </motion.div>
        </div>

        <div className="hero-right">
          <motion.div
            className="hero-stats"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <div className="hero-stat">
              <span className="hero-stat-val">~$5</span>
              <span className="hero-stat-label">per simulation</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-val">5K+</span>
              <span className="hero-stat-label">max agents</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-val">&lt;3m</span>
              <span className="hero-stat-label">avg. runtime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────── */}
      <section className="features">
        <motion.div
          className="features-inner"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div className="features-header" variants={fadeUp} custom={0}>
            <span className="section-tag">CAPABILITIES</span>
            <h2 className="section-title">Built for serious simulation</h2>
            <p className="section-desc">
              From market analysis to policy testing — simulate any scenario with autonomous agents.
            </p>
          </motion.div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} className="feature-card" variants={fadeUp} custom={i + 1}>
                <div className="feature-icon">
                  <f.icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Divider ─────────────────────────────────── */}
      <div className="section-divider" />

      {/* ─── Dashboard: Status + Console ─────────────── */}
      <section className="dashboard" ref={bottomRef}>

        {/* Left: Status & Workflow */}
        <motion.div
          className="dash-left"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.div className="panel-header" variants={fadeUp} custom={0}>
            <span className="status-dot" /> System Status
          </motion.div>

          <motion.h2 className="dash-title" variants={fadeUp} custom={1}>
            Ready
          </motion.h2>
          <motion.p className="dash-desc" variants={fadeUp} custom={2}>
            Prediction engine on standby. Upload unstructured data to initialise a simulation sequence.
          </motion.p>

          {/* Workflow Steps */}
          <motion.div className="steps-box" variants={fadeUp} custom={3}>
            <div className="steps-header">
              <span className="diamond">◇</span> Workflow Sequence
            </div>
            <div className="steps-list">
              {STEPS.map((s) => (
                <div key={s.num} className="step-row">
                  <span className="step-num">{s.num}</span>
                  <div>
                    <div className="step-title">{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Console */}
        <motion.div
          className="dash-right"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          custom={2}
        >
          <div className="console-box">

            {/* Upload */}
            <div className="console-section">
              <div className="console-label-row">
                <span className="console-label">01 / Seed Materials</span>
                <span className="console-meta">PDF, MD, TXT</span>
              </div>

              <div
                className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${files.length ? 'has-files' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file" ref={fileInputRef} className="hidden"
                  multiple accept=".pdf,.txt,.md" onChange={handleFileSelect}
                />
                {files.length > 0 ? (
                  <div className="file-list">
                    {files.map((f, i) => (
                      <span key={i} className="file-chip">
                        {f.name}
                        <button
                          onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_, idx) => idx !== i)); }}
                          className="file-rm"
                        >×</button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <UploadCloud size={22} strokeWidth={1.5} />
                    <span>Drag &amp; drop files</span>
                    <span className="upload-hint">or click to browse</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="console-divider">
              <span className="div-line" />
              <span className="div-text">parameters</span>
              <span className="div-line" />
            </div>

            {/* Prompt */}
            <div className="console-section">
              <div className="console-label-row">
                <span className="console-label">&gt;_ 02 / Scenario Directive</span>
              </div>
              <div className="input-wrap">
                <Terminal size={14} className="input-icon" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="code-input"
                  placeholder="// What happens if competitor X launches product Y?"
                  rows={5}
                />
                <span className="engine-badge">Engine: SwarmScope-v1.0</span>
              </div>
            </div>

            {/* CTA */}
            <div className="console-section cta-section">
              <button
                className={`start-btn ${canSubmit ? 'active' : ''}`}
                disabled={!canSubmit}
              >
                <span>START SIMULATION</span>
                <Play size={14} className="btn-play" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand">SWARMSCOPE</span>
            <span className="footer-copy">Multi-Agent Simulation Engine</span>
          </div>
          <div className="footer-right">
            <a href="#">Docs</a>
            <a href="#">API</a>
            <a href="#">GitHub</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SwarmScope. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
