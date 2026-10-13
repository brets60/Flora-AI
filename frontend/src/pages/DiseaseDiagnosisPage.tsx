import React, { useState, useEffect } from 'react';
import {
  Activity,
  Upload,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { DiagnosisResponse } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const DiseaseDiagnosisPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [species, setSpecies] = useState('');
  const [environment, setEnvironment] = useState('indoor');
  const [symptomsDesc, setSymptomsDesc] = useState('');
  const [wateringFreq, setWateringFreq] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DiagnosisResponse[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    api.getDiagnoses().then(setHistory).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPG, PNG, WEBP).');
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setError(null);
      setResult(null);
    }
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please provide a photo of the affected leaf, stem, or plant part.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);

    try {
      const resp = await api.diagnoseDisease(file, {
        plant_species: species || undefined,
        environment,
        symptoms_description: symptomsDesc || undefined,
        watering_frequency: wateringFreq || undefined,
        sunlight_exposure: sunlight || undefined,
      });
      setResult(resp);
      setHistory(prev => [resp, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Diagnosis failed. Please try with another angle or clearer lighting.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>Plant Health & Pathology</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
            Diagnose Plant Problems
          </h2>
          <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-1">
            Analyze leaves, stems, or pests with visual AI and receive gentle, non-chemical treatment pathways
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          icon={<Clock className="w-4 h-4" />}
        >
          {showHistory ? 'Back to Doctor' : `Past Diagnoses (${history.length})`}
        </Button>
      </div>

      {showHistory ? (
        /* History View */
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-forest-950 dark:text-leaf-200">Diagnosis Records</h3>
          {history.length === 0 ? (
            <p className="text-xs text-botanical-muted py-8 text-center">No past diagnoses on record.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setResult(h);
                    setPreviewUrl(h.image_url);
                    setShowHistory(false);
                  }}
                  className="p-3 rounded-2xl border border-botanical-border dark:border-botanical-darkBorder hover:border-amber-400 transition cursor-pointer space-y-2 group"
                >
                  <div className="h-36 rounded-xl bg-forest-100 overflow-hidden">
                    <img src={h.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-forest-900 dark:text-leaf-200 truncate">
                      {h.possible_conditions?.[0]?.name || (h as any).condition_name || 'Analyzed Issue'}
                    </h4>
                    <span className="text-[10px] text-amber-700 font-semibold block">
                      {((h.confidence || 0.9) * 100).toFixed(0)}% confidence • {(h.isolation_needed ?? (h as any).isolation_recommended) ? 'Quarantine' : 'Standard care'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Diagnosis Submission and Results Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Photo & Context */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleDiagnose} className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
              {/* Photo Box */}
              {!previewUrl ? (
                <label className="border-2 border-dashed border-amber-300 dark:border-amber-800 hover:border-amber-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-amber-50/40 dark:bg-amber-950/20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-forest-900 dark:text-leaf-200">Upload Photo of Problem</h4>
                  <p className="text-[11px] text-botanical-muted mt-1">Leaves with spots, discoloration, or pests</p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-forest-950">
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white text-xs hover:bg-black/80"
                  >
                    Replace
                  </button>
                </div>
              )}

              {/* Context inputs */}
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Plant Species (if known)</label>
                  <input
                    type="text"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    placeholder="e.g. Tomato, Monstera, Basil"
                    className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Observed Symptoms</label>
                  <textarea
                    rows={2}
                    value={symptomsDesc}
                    onChange={(e) => setSymptomsDesc(e.target.value)}
                    placeholder="e.g. Yellowing on lower leaves with black edges, soil feels damp"
                    className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Environment</label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-botanical-border bg-botanical-card text-xs outline-none"
                    >
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="greenhouse">Greenhouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Watering</label>
                    <input
                      type="text"
                      value={wateringFreq}
                      onChange={(e) => setWateringFreq(e.target.value)}
                      placeholder="e.g. Every 3 days"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-botanical-border bg-botanical-card text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  ⚠️ {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isAnalyzing}
                disabled={!file}
                className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
                icon={<Activity className="w-4 h-4" />}
              >
                Run Disease Analysis
              </Button>
            </form>
          </div>

          {/* Right Column: Structured Pathology Report */}
          <div className="lg:col-span-7">
            {!result ? (
              <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-8 shadow-soft text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                  🩺
                </div>
                <h3 className="text-base font-bold text-forest-900 dark:text-leaf-200">
                  Preliminary Diagnostic Engine
                </h3>
                <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted max-w-sm mx-auto leading-relaxed">
                  Upload an image of the symptomatic tissue. FloraAI analyzes signs of fungus, mite damage, nutrient deficiencies, or moisture hypoxia.
                </p>
                <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-botanical-muted">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Prioritizes natural & cultural organic solutions first</span>
                </div>
              </div>
            ) : (
              <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in">
                {/* Preliminary Advisory Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                    <span className="font-bold">Preliminary Assessment:</span> Photodiagnosis estimates visible symptoms. It is not an absolute laboratory confirmation. Follow gentle cultural remedies first.
                  </p>
                </div>

                {/* Primary Condition Header */}
                <div className="pb-4 border-b border-botanical-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                      Estimated {((result.confidence || 0.9) * 100).toFixed(0)}% Probability
                    </span>
                    {(result.isolation_needed ?? (result as any).isolation_recommended) && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Isolate Plant
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight mt-2">
                    {result.possible_conditions?.[0]?.name || (result as any).condition_name || 'Analyzed Plant Condition'}
                  </h3>
                  <p className="text-xs text-botanical-muted leading-relaxed mt-1">
                    {result.possible_conditions?.[0]?.description || (result as any).probable_cause || 'Pathology assessment complete.'}
                  </p>
                </div>

                {/* Observed Symptoms */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-forest-900 dark:text-leaf-200 uppercase tracking-wider">
                    Observed Physical Indicators:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(Array.isArray(result.observed_symptoms)
                      ? result.observed_symptoms
                      : [typeof result.observed_symptoms === 'string' ? result.observed_symptoms : 'Physical symptoms observed']
                    ).map((symptom, idx) => (
                      <li key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-botanical-bg/60 border border-botanical-border/50 text-botanical-text">
                        <span className="text-emerald-600">✓</span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-forest-900 dark:text-leaf-200 uppercase tracking-wider">
                    Immediate Actionable Care:
                  </h4>

                  {(result.recommendations?.immediate_actions || []).length > 0 && (
                    <div className="p-4 rounded-2xl bg-forest-50/70 dark:bg-forest-950/40 border border-forest-100 space-y-1.5 text-xs">
                      <span className="font-bold text-forest-900 dark:text-leaf-200 block">Step 1: Immediate Triage</span>
                      {(result.recommendations?.immediate_actions || []).map((act, i) => (
                        <p key={i} className="text-botanical-muted leading-normal">• {act}</p>
                      ))}
                    </div>
                  )}

                  {((result.recommendations?.organic_remedies || (result as any).organic_remedies) || []).length > 0 && (
                    <div className="p-4 rounded-2xl bg-leaf-50/70 dark:bg-leaf-950/30 border border-leaf-200 space-y-1.5 text-xs">
                      <span className="font-bold text-forest-900 dark:text-leaf-200 block">Step 2: Non-Chemical & Organic Remedies</span>
                      {((result.recommendations?.organic_remedies || (result as any).organic_remedies) || []).map((rem: string, i: number) => (
                        <p key={i} className="text-botanical-muted leading-normal">• {rem}</p>
                      ))}
                    </div>
                  )}

                  {(result.recommendations?.expert_consultation || (result as any).expert_consultation_advised) && (
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 text-xs text-botanical-muted">
                      <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">Agricultural Extension Guidance:</span>
                      {result.recommendations?.expert_consultation || (result as any).expert_consultation_advised}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
