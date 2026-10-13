import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  Droplets,
  Sun,
  ShieldAlert,
  Sprout,
  CheckCircle2,
  ChevronRight,
  Clock,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { IdentificationResponse, IdentificationCandidate } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface ScanPlantPageProps {
  onSaveToGarden: (candidate: IdentificationCandidate, imageUrl: string) => void;
}

export const ScanPlantPage: React.FC<ScanPlantPageProps> = ({ onSaveToGarden }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationResponse | null>(null);
  const [history, setHistory] = useState<IdentificationResponse[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    api.getIdentifications().then(setHistory).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file is too large. Please select an image under 10MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  const handleRetake = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleIdentify = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await api.identifyPlant(selectedFile);
      setResult(res);
      setHistory(prev => [res, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Identification failed. Please ensure the plant is clearly visible.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-leaf-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Botanical Vision Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
            Identify Any Plant
          </h2>
          <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-1">
            Capture a clear photograph of leaves, flowers, or the entire plant for taxonomic classification
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          icon={<Clock className="w-4 h-4" />}
        >
          {showHistory ? 'Back to Scanner' : `Scan History (${history.length})`}
        </Button>
      </div>

      {showHistory ? (
        /* History View */
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-forest-950 dark:text-leaf-200">Previous Identifications</h3>
          {history.length === 0 ? (
            <p className="text-xs text-botanical-muted py-8 text-center">No scans recorded yet.</p>
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
                  className="p-3 rounded-2xl border border-botanical-border dark:border-botanical-darkBorder hover:border-forest-400 transition cursor-pointer space-y-2 group"
                >
                  <div className="h-36 rounded-xl bg-forest-100 overflow-hidden">
                    <img src={h.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-forest-900 dark:text-leaf-200 truncate">
                      {h.primary_candidate?.common_name || (h as any).common_name || 'Botanical Specimen'}
                    </h4>
                    <p className="text-[11px] text-botanical-muted italic truncate">
                      {h.primary_candidate?.scientific_name || (h as any).scientific_name || ''}
                    </p>
                    <span className="text-[10px] text-forest-700 font-semibold mt-1 inline-block">
                      {((h.confidence || 0.95) * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Scanner View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Uploader / Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4 text-center">
              {!previewUrl ? (
                /* Empty Upload Target */
                <label className="border-2 border-dashed border-forest-300 dark:border-forest-700 hover:border-forest-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-forest-50/40 dark:bg-forest-950/20">
                  <div className="w-16 h-16 rounded-2xl bg-forest-100 dark:bg-forest-900 flex items-center justify-center text-forest-700 dark:text-leaf-300 mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-forest-900 dark:text-leaf-200">Upload or Snap Photo</h4>
                  <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-1">
                    Drag & drop or tap to browse from your device
                  </p>
                  <span className="text-[10px] text-botanical-muted mt-3 px-2 py-1 rounded-md bg-forest-100 dark:bg-forest-900">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                /* Image Preview with Controls */
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-forest-950 shadow-inner">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-forest-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
                        <div className="w-12 h-12 rounded-full border-4 border-leaf-400 border-t-transparent animate-spin" />
                        <p className="text-xs font-bold tracking-wider uppercase animate-pulse">Analyzing Botanical Features...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetake}
                      disabled={isAnalyzing}
                      className="flex-1"
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Replace Photo
                    </Button>
                    {!result && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleIdentify}
                        isLoading={isAnalyzing}
                        className="flex-1"
                        icon={<Sparkles className="w-3.5 h-3.5" />}
                      >
                        Analyze Now
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Analysis Result Sheet */}
          <div className="lg:col-span-7">
            {!result ? (
              <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-8 shadow-soft text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-forest-50 dark:bg-forest-900 text-forest-700 dark:text-leaf-300 flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="text-base font-bold text-forest-900 dark:text-leaf-200">
                  Ready to Inspect Specimen
                </h3>
                <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted max-w-sm mx-auto leading-relaxed">
                  Upload an image on the left and FloraAI will identify the genus and species, determine ideal soil & lighting conditions, and alert you to pet toxicity.
                </p>
              </div>
            ) : (
              <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-botanical-border/70 dark:border-botanical-darkBorder/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-700 dark:text-leaf-400 uppercase tracking-wider">
                        {result.primary_candidate?.family || (result as any).family || 'Identified Specimen'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-leaf-300 font-bold">
                        {((result.confidence || result.primary_candidate?.confidence || 0.95) * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight mt-1">
                      {result.primary_candidate?.common_name || (result as any).common_name || 'Specimen'}
                    </h3>
                    <p className="text-sm text-botanical-muted italic mt-0.5">
                      {result.primary_candidate?.scientific_name || (result as any).scientific_name || ''}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      const candidateToSave = result.primary_candidate || {
                        common_name: (result as any).common_name || 'Specimen',
                        scientific_name: (result as any).scientific_name || '',
                        confidence: result.confidence || 0.95,
                        description: (result as any).description || '',
                        light: (result as any).light_requirements || 'Bright indirect light',
                        water: (result as any).watering_guidance || 'Weekly',
                        soil: (result as any).soil_preferences || 'Potting soil',
                      };
                      onSaveToGarden(candidateToSave, result.image_url);
                    }}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Save to My Garden
                  </Button>
                </div>

                {/* Description */}
                <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted leading-relaxed">
                  {result.primary_candidate?.description || (result as any).description || 'Botanical inspection completed successfully.'}
                </p>

                {/* Botanical Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-forest-50/60 dark:bg-forest-950/30 border border-forest-100/70 dark:border-forest-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-forest-800 dark:text-leaf-300 font-bold">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Needs</span>
                    </div>
                    <p className="text-botanical-muted dark:text-botanical-darkMuted leading-normal">
                      {result.primary_candidate?.light || (result as any).light_requirements || 'Bright indirect light'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-forest-50/60 dark:bg-forest-950/30 border border-forest-100/70 dark:border-forest-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-forest-800 dark:text-leaf-300 font-bold">
                      <Droplets className="w-4 h-4 text-sky-500" />
                      <span>Watering Routine</span>
                    </div>
                    <p className="text-botanical-muted dark:text-botanical-darkMuted leading-normal">
                      {result.primary_candidate?.water || (result as any).watering_guidance || 'Water when topsoil is dry'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-forest-50/60 dark:bg-forest-950/30 border border-forest-100/70 dark:border-forest-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-forest-800 dark:text-leaf-300 font-bold">
                      <Sprout className="w-4 h-4 text-leaf-500" />
                      <span>Soil Substrate</span>
                    </div>
                    <p className="text-botanical-muted dark:text-botanical-darkMuted leading-normal">
                      {result.primary_candidate?.soil || (result as any).soil_preferences || 'Well-draining potting soil'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-forest-50/60 dark:bg-forest-950/30 border border-forest-100/70 dark:border-forest-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-forest-800 dark:text-leaf-300 font-bold">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Toxicity Warning</span>
                    </div>
                    <p className="text-botanical-muted dark:text-botanical-darkMuted leading-normal">
                      {result.primary_candidate?.pet_toxicity || (result as any).pet_toxicity || 'Check local guidelines'}
                    </p>
                  </div>
                </div>

                {/* Propagation Advice */}
                {(result.primary_candidate?.propagation || (result as any).propagation_advice) && (
                  <div className="p-4 rounded-2xl bg-leaf-50/40 dark:bg-leaf-950/20 border border-leaf-200/60 dark:border-forest-900 space-y-1 text-xs">
                    <h5 className="font-bold text-forest-900 dark:text-leaf-200">Propagation Advice</h5>
                    <p className="text-botanical-muted leading-relaxed">
                      {result.primary_candidate?.propagation || (result as any).propagation_advice}
                    </p>
                  </div>
                )}

                {/* Alternative Candidates if any */}
                {(result.alternative_candidates || []).length > 0 && (
                  <div className="pt-4 border-t border-botanical-border/60 space-y-2">
                    <h5 className="text-xs font-bold text-forest-900 dark:text-leaf-200">Alternative Potential Matches:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(result.alternative_candidates || []).map((alt, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-botanical-border text-xs flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-forest-900 dark:text-leaf-200">{alt.common_name}</span>
                            <span className="text-[11px] text-botanical-muted block italic">{alt.scientific_name}</span>
                          </div>
                          <span className="text-[10px] text-botanical-muted">{((alt.confidence || 0.9) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
