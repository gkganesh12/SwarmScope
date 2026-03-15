import { useState, useEffect } from 'react';
import { Key, Check, X, Loader2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { getStoredApiKeys, saveApiKeys, clearApiKeys, type ApiKeys } from '../services/apiKeys';
import { validateApiKeys } from '../services/api';

interface ValidationResult {
  llm: { valid: boolean; source: string; model?: string; error?: string };
  zep: { valid: boolean; source: string; error?: string };
  all_valid: boolean;
}

export default function ApiKeySettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [keys, setKeys] = useState<ApiKeys>(getStoredApiKeys());
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeys(getStoredApiKeys());
  }, [isOpen]);

  const handleChange = (field: keyof ApiKeys, value: string) => {
    setKeys(prev => ({ ...prev, [field]: value }));
    setValidation(null);
    setSaved(false);
  };

  const handleSave = () => {
    saveApiKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearApiKeys();
    setKeys({ llm_api_key: '', llm_base_url: '', llm_model_name: '', zep_api_key: '' });
    setValidation(null);
  };

  const handleValidate = async () => {
    // Save first so headers are sent
    saveApiKeys(keys);
    setValidating(true);
    setValidation(null);
    try {
      const res = await validateApiKeys();
      setValidation(res);
    } catch (e: any) {
      setValidation({
        llm: { valid: false, source: 'unknown', error: e.message },
        zep: { valid: false, source: 'unknown', error: e.message },
        all_valid: false,
      });
    } finally {
      setValidating(false);
    }
  };

  const toggleShow = (field: string) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const hasAnyKeys = !!(keys.llm_api_key || keys.zep_api_key);

  return (
    <div className="api-key-settings">
      <button className="api-key-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Key size={14} />
        <span>API Keys</span>
        {hasAnyKeys && <span className="api-key-dot" />}
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className="api-key-panel">
          <div className="api-key-panel-header">
            <span>Bring Your Own API Keys</span>
            <span className="api-key-hint">Keys are stored locally in your browser</span>
          </div>

          {/* LLM Section */}
          <div className="api-key-section">
            <div className="api-key-section-title">LLM Provider (OpenAI-compatible)</div>

            <div className="api-key-field">
              <label>API Key</label>
              <div className="api-key-input-wrap">
                <input
                  type={showKeys['llm_api_key'] ? 'text' : 'password'}
                  value={keys.llm_api_key}
                  onChange={e => handleChange('llm_api_key', e.target.value)}
                  placeholder="sk-..."
                  spellCheck={false}
                />
                <button className="api-key-eye" onClick={() => toggleShow('llm_api_key')}>
                  {showKeys['llm_api_key'] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="api-key-field">
              <label>Base URL</label>
              <input
                type="text"
                value={keys.llm_base_url}
                onChange={e => handleChange('llm_base_url', e.target.value)}
                placeholder="https://api.openai.com/v1 (default)"
                spellCheck={false}
              />
            </div>

            <div className="api-key-field">
              <label>Model</label>
              <input
                type="text"
                value={keys.llm_model_name}
                onChange={e => handleChange('llm_model_name', e.target.value)}
                placeholder="gpt-4o-mini (default)"
                spellCheck={false}
              />
            </div>

            {validation?.llm && (
              <div className={`api-key-status ${validation.llm.valid ? 'valid' : 'invalid'}`}>
                {validation.llm.valid ? <Check size={12} /> : <X size={12} />}
                <span>
                  {validation.llm.valid
                    ? `Connected (${validation.llm.source})`
                    : validation.llm.error || 'Invalid'}
                </span>
              </div>
            )}
          </div>

          {/* Zep Section */}
          <div className="api-key-section">
            <div className="api-key-section-title">Zep Cloud</div>

            <div className="api-key-field">
              <label>API Key</label>
              <div className="api-key-input-wrap">
                <input
                  type={showKeys['zep_api_key'] ? 'text' : 'password'}
                  value={keys.zep_api_key}
                  onChange={e => handleChange('zep_api_key', e.target.value)}
                  placeholder="z_..."
                  spellCheck={false}
                />
                <button className="api-key-eye" onClick={() => toggleShow('zep_api_key')}>
                  {showKeys['zep_api_key'] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {validation?.zep && (
              <div className={`api-key-status ${validation.zep.valid ? 'valid' : 'invalid'}`}>
                {validation.zep.valid ? <Check size={12} /> : <X size={12} />}
                <span>
                  {validation.zep.valid
                    ? `Connected (${validation.zep.source})`
                    : validation.zep.error || 'Invalid'}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="api-key-actions">
            <button className="api-key-btn validate" onClick={handleValidate} disabled={validating}>
              {validating ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {validating ? 'Validating...' : 'Validate'}
            </button>
            <button className="api-key-btn save" onClick={handleSave}>
              {saved ? 'Saved!' : 'Save'}
            </button>
            {hasAnyKeys && (
              <button className="api-key-btn clear" onClick={handleClear}>
                Clear All
              </button>
            )}
          </div>

          {validation?.all_valid && (
            <div className="api-key-status valid" style={{ marginTop: 8 }}>
              <Check size={12} />
              <span>All keys validated successfully</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
