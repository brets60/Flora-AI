import React, { useState, useEffect } from 'react';
import { Camera, Upload, Plus, X, Sprout, Sun, Droplets, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plant, IdentificationCandidate } from '../../types';
import { api } from '../../services/api';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantAdded: (plant: Plant) => void;
  prefillCandidate?: IdentificationCandidate | null;
  prefillImageUrl?: string | null;
}

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onPlantAdded,
  prefillCandidate,
  prefillImageUrl,
}) => {
  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState('Indoor');
  const [customCategory, setCustomCategory] = useState('');
  const [location, setLocation] = useState('Living Room');
  const [environment, setEnvironment] = useState('indoor');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'needs_attention' | 'recovering' | 'diseased'>('healthy');
  const [light, setLight] = useState('Bright indirect');
  const [wateringDays, setWateringDays] = useState(7);
  const [fertilizingDays, setFertilizingDays] = useState(30);
  const [soil, setSoil] = useState('Well-draining potting soil');
  const [toxicity, setToxicity] = useState('Non-toxic');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate prefill data if opened from Plant Identification scan!
  useEffect(() => {
    if (prefillCandidate) {
      setCommonName(prefillCandidate.common_name || '');
      setScientificName(prefillCandidate.scientific_name || '');
      setLight(prefillCandidate.light || 'Bright indirect');
      setSoil(prefillCandidate.soil || 'Well-draining potting soil');
      setToxicity(prefillCandidate.pet_toxicity || 'Check safety');
      setNotes(`Identified via FloraAI. ${prefillCandidate.description || ''}`);
    }
    if (prefillImageUrl) {
      setPhotoPreview(prefillImageUrl);
    }
  }, [prefillCandidate, prefillImageUrl]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonName.trim()) {
      setError('Plant common name is required.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const finalCategory = category === 'Custom' ? (customCategory.trim() || 'Custom') : category;
      const newPlant = await api.createPlant({
        common_name: commonName.trim(),
        scientific_name: scientificName.trim() || undefined,
        category: finalCategory,
        location: location.trim(),
        environment,
        health_status: healthStatus,
        photo_url: photoPreview && !photoFile ? photoPreview : undefined,
        care_preferences: {
          light,
          watering_frequency_days: Number(wateringDays) || 7,
          fertilizing_frequency_days: Number(fertilizingDays) || 30,
          soil,
          toxicity,
        },
        notes: notes.trim() || undefined,
      });

      // If user uploaded a new local file, upload photo to plant endpoint
      if (photoFile) {
        try {
          const updatedWithPhoto = await api.uploadPlantPhoto(newPlant.id, photoFile);
          onPlantAdded(updatedWithPhoto);
        } catch {
          onPlantAdded(newPlant);
        }
      } else {
        onPlantAdded(newPlant);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save plant.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Plant to Your Garden"
      subtitle="Track growth, health history, and automatic watering schedules"
      maxWidth="xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Photo Upload Box */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-forest-50/50 dark:bg-forest-950/30 border border-forest-100 dark:border-forest-900/60">
          <div className="w-24 h-24 rounded-2xl bg-forest-100 dark:bg-forest-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-forest-200 dark:border-forest-800">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <Sprout className="w-8 h-8 text-forest-600 dark:text-leaf-300" />
            )}
          </div>
          <div className="flex-1 space-y-1.5 text-center sm:text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-leaf-200">Plant Photograph</h4>
            <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted">Upload a clear photo of your plant for visual tracking.</p>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-700 text-white text-xs font-bold cursor-pointer hover:bg-forest-800 transition">
              <Camera className="w-3.5 h-3.5" />
              <span>Choose Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-forest-900 dark:text-leaf-300 mb-1">Common Name *</label>
            <input
              type="text"
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              placeholder="e.g. Monstera Deliciosa"
              required
              className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-900 dark:text-leaf-300 mb-1">Scientific Name</label>
            <input
              type="text"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="e.g. Monstera deliciosa"
              className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs focus:ring-2 focus:ring-forest-500/30 outline-none italic"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-forest-900 dark:text-leaf-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-card dark:bg-botanical-darkCard text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
            >
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Succulent">Succulent</option>
              <option value="Herb">Herb</option>
              <option value="Vegetable">Vegetable</option>
              <option value="Flower">Flower</option>
              <option value="Tropical">Tropical</option>
              <option value="Custom">Custom...</option>
            </select>
            {category === 'Custom' && (
              <input
                type="text"
                placeholder="Enter category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-1.5 w-full px-2 py-1.5 text-xs rounded-lg border border-botanical-border"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-900 dark:text-leaf-300 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Living Room, Balcony"
              className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-900 dark:text-leaf-300 mb-1">Environment</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-card dark:bg-botanical-darkCard text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="garden">Garden</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="farm">Farm</option>
            </select>
          </div>
        </div>

        {/* Care Settings */}
        <div className="p-4 rounded-2xl bg-botanical-bg/50 dark:bg-botanical-darkBg/50 border border-botanical-border/60 dark:border-botanical-darkBorder/60 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-forest-800 dark:text-leaf-300">
            Smart Care Schedules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-botanical-muted dark:text-botanical-darkMuted mb-1">
                Watering Every (Days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={wateringDays}
                onChange={(e) => setWateringDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-botanical-muted dark:text-botanical-darkMuted mb-1">
                Fertilizing Every (Days)
              </label>
              <input
                type="number"
                min="7"
                max="180"
                value={fertilizingDays}
                onChange={(e) => setFertilizingDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-botanical-muted dark:text-botanical-darkMuted mb-1">
                Light Needs
              </label>
              <input
                type="text"
                value={light}
                onChange={(e) => setLight(e.target.value)}
                placeholder="Bright indirect, Low light"
                className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-botanical-muted dark:text-botanical-darkMuted mb-1">
                Soil Mix
              </label>
              <input
                type="text"
                value={soil}
                onChange={(e) => setSoil(e.target.value)}
                placeholder="Chunky aroid mix, Cactus soil"
                className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-forest-900 dark:text-leaf-300 mb-1">Notes & Observations</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special care notes, potting date, origin story..."
            className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} icon={<Plus className="w-4 h-4" />}>
            Add Plant
          </Button>
        </div>
      </form>
    </Modal>
  );
};
