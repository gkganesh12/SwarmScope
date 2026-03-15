import { getByoHeaders } from './apiKeys';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const byoHeaders = getByoHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...byoHeaders, ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Graph API ──────────────────────────────────────────

export async function generateOntology(
  files: File[],
  simulationRequirement: string,
  projectName: string
) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('simulation_requirement', simulationRequirement);
  formData.append('project_name', projectName);

  const byoHeaders = getByoHeaders();
  const res = await fetch(`${API_BASE}/graph/ontology/generate`, {
    method: 'POST',
    headers: { ...byoHeaders },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Ontology generation failed');
  }
  return res.json();
}

export async function buildGraph(projectId: string, graphName?: string) {
  return request<{ task_id: string; message: string }>('/graph/build', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      graph_name: graphName || `graph_${Date.now()}`,
    }),
  });
}

export async function getTaskStatus(taskId: string) {
  return request<{
    task_id: string;
    status: string;
    progress: number;
    message: string;
    result?: Record<string, unknown>;
    error?: string;
  }>(`/graph/task/${taskId}`);
}

export async function getProject(projectId: string) {
  return request<Record<string, unknown>>(`/graph/project/${projectId}`);
}

// ── Simulation API ─────────────────────────────────────

export async function createSimulation(
  projectId: string,
  graphId?: string,
  enableTwitter = true,
  enableReddit = true
) {
  return request<{ simulation_id: string; status: string }>('/simulation/create', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      graph_id: graphId,
      enable_twitter: enableTwitter,
      enable_reddit: enableReddit,
    }),
  });
}

export async function prepareSimulation(simulationId: string) {
  return request<{ task_id: string; expected_entities_count?: number }>('/simulation/prepare', {
    method: 'POST',
    body: JSON.stringify({ simulation_id: simulationId }),
  });
}

export async function getPrepareStatus(taskIdOrSimId: string) {
  return request<{
    status: string;
    progress: number;
    message: string;
    already_prepared?: boolean;
  }>('/simulation/prepare/status', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskIdOrSimId }),
  });
}

export async function startSimulation(
  simulationId: string,
  platform = 'parallel',
  maxRounds = 5
) {
  return request<{ runner_status: string; process_pid?: number }>('/simulation/start', {
    method: 'POST',
    body: JSON.stringify({
      simulation_id: simulationId,
      platform,
      max_rounds: maxRounds,
    }),
  });
}

export async function getRunStatus(simulationId: string) {
  return request<{
    runner_status: string;
    current_round?: number;
    max_rounds?: number;
    progress?: number;
  }>(`/simulation/${simulationId}/run-status`);
}

export async function getRunStatusDetail(simulationId: string) {
  return request<Record<string, unknown>>(`/simulation/${simulationId}/run-status/detail`);
}

export async function stopSimulation(simulationId: string) {
  return request<{ message: string }>('/simulation/stop', {
    method: 'POST',
    body: JSON.stringify({ simulation_id: simulationId }),
  });
}

export async function getSimulation(simulationId: string) {
  return request<Record<string, unknown>>(`/simulation/${simulationId}`);
}

export async function getSimulationActions(simulationId: string, page = 1, limit = 50) {
  return request<{ actions: Record<string, unknown>[]; total: number }>(
    `/simulation/${simulationId}/actions?page=${page}&limit=${limit}`
  );
}

export async function getSimulationTimeline(simulationId: string) {
  return request<Record<string, unknown>>(`/simulation/${simulationId}/timeline`);
}

export async function getAgentStats(simulationId: string) {
  return request<Record<string, unknown>>(`/simulation/${simulationId}/agent-stats`);
}

export async function getSimulationPosts(simulationId: string) {
  return request<Record<string, unknown>>(`/simulation/${simulationId}/posts`);
}

// ── Report API ─────────────────────────────────────────

export async function generateReport(simulationId: string) {
  return request<{ report_id: string; task_id: string }>('/report/generate', {
    method: 'POST',
    body: JSON.stringify({ simulation_id: simulationId }),
  });
}

export async function getReportStatus(taskId: string) {
  return request<{ status: string; progress: number; message: string }>(
    '/report/generate/status',
    { method: 'POST', body: JSON.stringify({ task_id: taskId }) }
  );
}

export async function getReport(reportId: string) {
  return request<Record<string, unknown>>(`/report/${reportId}`);
}

export async function getReportSummary(reportId: string) {
  return request<Record<string, unknown>>(`/report/${reportId}/summary`);
}

export async function chatWithReport(reportId: string, message: string) {
  return request<{ response: string }>(`/report/${reportId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// ── Interview API ──────────────────────────────────────

export async function interviewAgent(simulationId: string, agentId: string, question: string) {
  return request<{ response: string }>('/simulation/interview', {
    method: 'POST',
    body: JSON.stringify({ simulation_id: simulationId, agent_id: agentId, question }),
  });
}

// ── Config / BYO API ──────────────────────────────────

export async function validateApiKeys() {
  return request<{
    llm: { valid: boolean; source: string; model?: string; base_url?: string; error?: string };
    zep: { valid: boolean; source: string; error?: string };
    all_valid: boolean;
  }>('/config/validate-keys', { method: 'POST' });
}

export async function getConfigStatus() {
  return request<{
    llm_configured: boolean;
    llm_source: string;
    llm_model: string;
    llm_base_url: string;
    zep_configured: boolean;
    zep_source: string;
  }>('/config/status');
}

// ── Health ─────────────────────────────────────────────

export async function healthCheck() {
  return request<{ status: string }>('/../health');
}
