/**
 * BYO API key management.
 * Keys are stored in localStorage and sent as request headers.
 */

const STORAGE_KEY = 'swarmscope_api_keys';

export interface ApiKeys {
  llm_api_key: string;
  llm_base_url: string;
  llm_model_name: string;
  zep_api_key: string;
}

const DEFAULTS: ApiKeys = {
  llm_api_key: '',
  llm_base_url: '',
  llm_model_name: '',
  zep_api_key: '',
};

export function getStoredApiKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveApiKeys(keys: Partial<ApiKeys>): void {
  const current = getStoredApiKeys();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...keys }));
}

export function clearApiKeys(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasAnyByoKeys(): boolean {
  const keys = getStoredApiKeys();
  return !!(keys.llm_api_key || keys.zep_api_key);
}

/**
 * Build custom headers for BYO API keys.
 * Only includes headers for non-empty keys.
 */
export function getByoHeaders(): Record<string, string> {
  const keys = getStoredApiKeys();
  const headers: Record<string, string> = {};
  if (keys.llm_api_key) headers['X-LLM-API-Key'] = keys.llm_api_key;
  if (keys.llm_base_url) headers['X-LLM-Base-URL'] = keys.llm_base_url;
  if (keys.llm_model_name) headers['X-LLM-Model-Name'] = keys.llm_model_name;
  if (keys.zep_api_key) headers['X-Zep-API-Key'] = keys.zep_api_key;
  return headers;
}
