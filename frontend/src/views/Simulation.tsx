import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Circle, Loader2, XCircle,
  MessageSquare, Send, ChevronDown, BarChart3, Users,
  Activity, FileText,
} from 'lucide-react';
import * as api from '../services/api';

/* ── Types ───────────────────────────────────────────── */

type StepStatus = 'pending' | 'running' | 'done' | 'error';

interface PipelineStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  progress: number;
  message: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/* ── Constants ───────────────────────────────────────── */

const INITIAL_STEPS: PipelineStep[] = [
  { id: 'ontology', title: 'Graph Construction', description: 'Extracting entities & building ontology from seed data', status: 'pending', progress: 0, message: '' },
  { id: 'graph', title: 'Knowledge Graph', description: 'Building entity-relation graph via GraphRAG', status: 'pending', progress: 0, message: '' },
  { id: 'prepare', title: 'Agent Generation', description: 'Generating agent profiles & simulation config', status: 'pending', progress: 0, message: '' },
  { id: 'simulate', title: 'Run Simulation', description: 'Dual-platform parallel simulation with dynamic memory', status: 'pending', progress: 0, message: '' },
  { id: 'report', title: 'Report Generation', description: 'ReportAgent analyzing post-simulation environment', status: 'pending', progress: 0, message: '' },
];

const POLL_INTERVAL = 2000;

/* ── Helpers ─────────────────────────────────────────── */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'done': return <CheckCircle2 size={18} className="step-icon done" />;
    case 'running': return <Loader2 size={18} className="step-icon running" />;
    case 'error': return <XCircle size={18} className="step-icon error" />;
    default: return <Circle size={18} className="step-icon pending" />;
  }
}

/* ── Component ───────────────────────────────────────── */

export default function Simulation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { files, prompt } = (location.state || {}) as { files?: File[]; prompt?: string };

  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // IDs accumulated during the pipeline
  const [projectId, setProjectId] = useState<string | null>(null);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  // Post-sim tabs
  const [activeTab, setActiveTab] = useState<'report' | 'chat' | 'stats'>('report');
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [agentStats, setAgentStats] = useState<Record<string, unknown> | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  }, []);

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /* ── Pipeline ──────────────────────────────────────── */

  const runPipeline = useCallback(async () => {
    if (!files?.length || !prompt) return;
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      // ── Step 1: Ontology ────────────────────────────
      updateStep('ontology', { status: 'running', message: 'Uploading files & generating ontology...' });
      addLog('Uploading seed materials...');

      const projectName = `sim_${Date.now()}`;
      const ontologyResult = await api.generateOntology(files, prompt, projectName);
      const pId = ontologyResult.project_id;
      setProjectId(pId);

      addLog(`Project created: ${pId}`);
      addLog(`Ontology generated — ${ontologyResult.ontology?.entity_types?.length || 0} entity types found`);
      updateStep('ontology', { status: 'done', progress: 100, message: 'Ontology ready' });

      // ── Step 2: Graph Building ──────────────────────
      updateStep('graph', { status: 'running', message: 'Building knowledge graph...' });
      addLog('Starting graph construction...');

      const graphResult = await api.buildGraph(pId);
      const graphTaskId = graphResult.task_id;
      addLog(`Graph build task: ${graphTaskId}`);

      // Poll graph build
      let graphDone = false;
      while (!graphDone) {
        await delay(POLL_INTERVAL);
        const taskStatus = await api.getTaskStatus(graphTaskId);
        updateStep('graph', {
          progress: taskStatus.progress || 0,
          message: taskStatus.message || 'Building...',
        });
        addLog(`Graph: ${taskStatus.progress}% — ${taskStatus.message}`);

        if (taskStatus.status === 'COMPLETED') {
          graphDone = true;
        } else if (taskStatus.status === 'FAILED') {
          throw new Error(taskStatus.error || 'Graph construction failed');
        }
      }

      // Get the graph_id from project
      const project = await api.getProject(pId);
      const graphId = project.graph_id as string;
      addLog(`Knowledge graph ready: ${graphId}`);
      updateStep('graph', { status: 'done', progress: 100, message: 'Graph complete' });

      // ── Step 3: Prepare Simulation ──────────────────
      updateStep('prepare', { status: 'running', message: 'Creating simulation & generating agents...' });
      addLog('Creating simulation...');

      const simResult = await api.createSimulation(pId, graphId);
      const sId = simResult.simulation_id;
      setSimulationId(sId);
      addLog(`Simulation created: ${sId}`);

      addLog('Preparing simulation — generating agent profiles...');
      const prepResult = await api.prepareSimulation(sId);
      const prepTaskId = prepResult.task_id;
      addLog(`Expected entities: ${prepResult.expected_entities_count || 'calculating...'}`);

      // Poll preparation
      let prepDone = false;
      while (!prepDone) {
        await delay(POLL_INTERVAL);
        const prepStatus = await api.getPrepareStatus(prepTaskId);
        updateStep('prepare', {
          progress: prepStatus.progress || 0,
          message: prepStatus.message || 'Preparing...',
        });
        addLog(`Prepare: ${prepStatus.progress}% — ${prepStatus.message}`);

        if (prepStatus.status === 'COMPLETED' || prepStatus.already_prepared) {
          prepDone = true;
        } else if (prepStatus.status === 'FAILED') {
          throw new Error('Simulation preparation failed');
        }
      }

      addLog('Agent profiles generated. Simulation ready.');
      updateStep('prepare', { status: 'done', progress: 100, message: 'Agents ready' });

      // ── Step 4: Run Simulation ──────────────────────
      updateStep('simulate', { status: 'running', message: 'Starting simulation...' });
      addLog('Launching simulation...');

      await api.startSimulation(sId);
      addLog('Simulation running...');

      // Poll simulation progress
      let simDone = false;
      while (!simDone) {
        await delay(POLL_INTERVAL);
        try {
          const runStatus = await api.getRunStatus(sId);
          const round = runStatus.current_round || 0;
          const maxRounds = runStatus.max_rounds || 5;
          const pct = Math.round((round / maxRounds) * 100);
          updateStep('simulate', {
            progress: pct,
            message: `Round ${round}/${maxRounds}`,
          });
          addLog(`Simulation: Round ${round}/${maxRounds} — ${runStatus.runner_status}`);

          if (runStatus.runner_status === 'completed' || runStatus.runner_status === 'finished') {
            simDone = true;
          } else if (runStatus.runner_status === 'failed' || runStatus.runner_status === 'error') {
            throw new Error('Simulation execution failed');
          }
        } catch (e) {
          // If run-status endpoint fails, check simulation state directly
          const sim = await api.getSimulation(sId);
          if (sim.status === 'COMPLETED') {
            simDone = true;
          } else if (sim.status === 'FAILED') {
            throw new Error('Simulation failed');
          }
        }
      }

      addLog('Simulation complete!');
      updateStep('simulate', { status: 'done', progress: 100, message: 'Complete' });

      // ── Step 5: Report Generation ───────────────────
      updateStep('report', { status: 'running', message: 'Generating analysis report...' });
      addLog('Starting report generation...');

      const reportResult = await api.generateReport(sId);
      const rId = reportResult.report_id;
      setReportId(rId);
      const reportTaskId = reportResult.task_id;

      // Poll report generation
      let reportDone = false;
      while (!reportDone) {
        await delay(POLL_INTERVAL);
        const reportStatus = await api.getReportStatus(reportTaskId);
        updateStep('report', {
          progress: reportStatus.progress || 0,
          message: reportStatus.message || 'Analyzing...',
        });
        addLog(`Report: ${reportStatus.progress}% — ${reportStatus.message}`);

        if (reportStatus.status === 'COMPLETED') {
          reportDone = true;
        } else if (reportStatus.status === 'FAILED') {
          throw new Error('Report generation failed');
        }
      }

      addLog('Report ready!');
      updateStep('report', { status: 'done', progress: 100, message: 'Report ready' });

      // Load final data
      const [report, stats] = await Promise.all([
        api.getReport(rId),
        api.getAgentStats(sId).catch(() => null),
      ]);
      setReportData(report);
      setAgentStats(stats);
      setCompleted(true);
      addLog('Pipeline complete. All systems nominal.');

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      addLog(`ERROR: ${msg}`);

      // Mark the currently running step as error
      setSteps((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'error', message: msg } : s))
      );
    }
  }, [files, prompt, addLog, updateStep]);

  // Start pipeline on mount
  useEffect(() => {
    if (files?.length && prompt) {
      runPipeline();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Chat Handler ──────────────────────────────────── */

  const handleChat = async () => {
    if (!chatInput.trim() || !reportId) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    try {
      const result = await api.chatWithReport(reportId, userMsg);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: result.response }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to get response. Please try again.' },
      ]);
    }
    setChatLoading(false);
  };

  /* ── No data guard ─────────────────────────────────── */

  if (!files?.length || !prompt) {
    return (
      <div className="sim-root">
        <div className="sim-empty">
          <p>No simulation data. Please start from the home page.</p>
          <button className="sim-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* ── Render ────────────────────────────────────────── */

  return (
    <div className="sim-root">

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-left">
          <button className="sim-nav-back" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
          </button>
          <span className="nav-brand">SWARMSCOPE</span>
          <span className="nav-badge">SIMULATION</span>
        </div>
        <div className="nav-links">
          <span className="sim-status-indicator">
            <span className={`status-dot ${error ? 'error' : completed ? 'complete' : ''}`} />
            {error ? 'Error' : completed ? 'Complete' : 'Running'}
          </span>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────── */}
      <div className="sim-content">

        {/* ── Left: Pipeline Steps ──────────────────── */}
        <motion.div
          className="sim-pipeline"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="sim-panel-header">
            <Activity size={14} />
            Pipeline Progress
          </div>

          <div className="sim-steps">
            {steps.map((step, i) => (
              <div key={step.id} className={`sim-step ${step.status}`}>
                <div className="sim-step-left">
                  <StepIcon status={step.status} />
                  {i < steps.length - 1 && <div className={`sim-step-line ${step.status}`} />}
                </div>
                <div className="sim-step-content">
                  <div className="sim-step-header">
                    <span className="sim-step-num">0{i + 1}</span>
                    <span className="sim-step-title">{step.title}</span>
                  </div>
                  <p className="sim-step-desc">{step.description}</p>
                  {step.status === 'running' && (
                    <div className="sim-step-progress">
                      <div className="sim-progress-bar">
                        <div
                          className="sim-progress-fill"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      <span className="sim-progress-text">{step.progress}%</span>
                    </div>
                  )}
                  {step.message && (
                    <span className="sim-step-msg">{step.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Seed info */}
          <div className="sim-seed-info">
            <div className="sim-seed-label">Seed Materials</div>
            <div className="sim-seed-files">
              {files.map((f, i) => (
                <span key={i} className="file-chip">{f.name}</span>
              ))}
            </div>
            <div className="sim-seed-label" style={{ marginTop: 12 }}>Scenario</div>
            <p className="sim-seed-prompt">{prompt}</p>
          </div>
        </motion.div>

        {/* ── Right: Console / Results ──────────────── */}
        <motion.div
          className="sim-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {!completed ? (
            /* Console Log */
            <div className="sim-console">
              <div className="sim-panel-header">
                <FileText size={14} />
                Console Output
              </div>
              <div className="sim-log-area">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`sim-log-line ${log.includes('ERROR') ? 'error' : ''}`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          ) : (
            /* Post-Simulation Results */
            <div className="sim-results">
              <div className="sim-tabs">
                <button
                  className={`sim-tab ${activeTab === 'report' ? 'active' : ''}`}
                  onClick={() => setActiveTab('report')}
                >
                  <BarChart3 size={14} /> Report
                </button>
                <button
                  className={`sim-tab ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquare size={14} /> Chat
                </button>
                <button
                  className={`sim-tab ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  <Users size={14} /> Agent Stats
                </button>
              </div>

              <div className="sim-tab-content">
                {activeTab === 'report' && (
                  <div className="sim-report">
                    {reportData ? (
                      <pre className="sim-report-json">
                        {JSON.stringify(reportData, null, 2)}
                      </pre>
                    ) : (
                      <p className="sim-no-data">No report data available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="sim-chat">
                    <div className="sim-chat-messages">
                      {chatMessages.length === 0 && (
                        <div className="sim-chat-empty">
                          <MessageSquare size={24} />
                          <p>Ask questions about the simulation results.</p>
                          <p className="sim-chat-hint">
                            e.g., "What were the key findings?" or "How did agents react to the scenario?"
                          </p>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`sim-chat-msg ${msg.role}`}>
                          <div className="sim-chat-bubble">{msg.content}</div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="sim-chat-msg assistant">
                          <div className="sim-chat-bubble">
                            <Loader2 size={14} className="step-icon running" /> Thinking...
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="sim-chat-input-row">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Ask about the simulation..."
                        className="sim-chat-input"
                      />
                      <button
                        className="sim-chat-send"
                        onClick={handleChat}
                        disabled={!chatInput.trim() || chatLoading}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="sim-stats">
                    {agentStats ? (
                      <pre className="sim-report-json">
                        {JSON.stringify(agentStats, null, 2)}
                      </pre>
                    ) : (
                      <p className="sim-no-data">No agent statistics available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              className="sim-error-banner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <XCircle size={16} />
              <span>{error}</span>
              <button className="sim-retry-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
