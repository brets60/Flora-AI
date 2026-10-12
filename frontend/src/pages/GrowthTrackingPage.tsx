import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Sprout,
  Calendar,
  Layers,
  Camera,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Plant, GrowthRecord } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const GrowthTrackingPage: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Growth Entry Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState('cm');
  const [leafCount, setLeafCount] = useState('');
  const [observation, setObservation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.getPlants().then((data) => {
      setPlants(data);
      if (data.length > 0) {
        setSelectedPlantId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const fetchRecords = async () => {
    if (!selectedPlantId) return;
    setIsLoading(true);
    try {
      const data = await api.getGrowthRecords(selectedPlantId);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedPlantId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantId) return;
    setIsSubmitting(true);
    try {
      await api.addGrowthRecord(selectedPlantId, {
        height: height ? parseFloat(height) : undefined,
        measurement_unit: unit,
        leaf_count: leafCount ? parseInt(leafCount) : undefined,
        observation: observation || undefined,
        photo: photoFile || undefined,
      });

      setIsModalOpen(false);
      setHeight('');
      setLeafCount('');
      setObservation('');
      setPhotoFile(null);
      setPhotoPreview(null);
      await fetchRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    await api.deleteGrowthRecord(id);
    await fetchRecords();
  };

  const currentPlant = plants.find(p => p.id === selectedPlantId);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-leaf-300 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Development Milestones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
            Growth Tracking & Metrics
          </h2>
          <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-1">
            Measure plant height progression, new foliage emergence, and visual development over time
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedPlantId}
          icon={<Plus className="w-4 h-4" />}
        >
          Record Measurement
        </Button>
      </div>

      {/* Plant Selector Bar */}
      <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-forest-900 dark:text-leaf-300 whitespace-nowrap">Select Plant:</span>
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg dark:bg-botanical-darkBg text-xs font-semibold outline-none flex-1 sm:w-64"
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id}>{p.common_name}</option>
            ))}
          </select>
        </div>

        {currentPlant && (
          <div className="text-xs text-botanical-muted flex items-center gap-3">
            <span>Location: <strong className="text-forest-900 dark:text-leaf-200">{currentPlant.location}</strong></span>
            <span>Status: <strong className="text-forest-900 dark:text-leaf-200">{currentPlant.health_status}</strong></span>
          </div>
        )}
      </div>

      {/* Growth Timeline Visualizer */}
      <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 sm:p-8 shadow-soft space-y-6">
        <h3 className="text-sm font-bold text-forest-900 dark:text-leaf-200 uppercase tracking-wider">
          Recorded Timeline for {currentPlant?.common_name || 'Selected Specimen'}
        </h3>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-forest-50 dark:bg-forest-900 text-forest-700 dark:text-leaf-300 flex items-center justify-center mx-auto text-2xl">
              📏
            </div>
            <p className="text-sm font-bold text-forest-900 dark:text-leaf-200">No Growth Records Logged</p>
            <p className="text-xs text-botanical-muted max-w-sm mx-auto">
              Start by logging your plant's current height in cm or inches and total leaf count.
            </p>
            <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
              Add First Measurement
            </Button>
          </div>
        ) : (
          <div className="relative border-l-2 border-forest-200 dark:border-forest-800 ml-4 pl-6 space-y-8">
            {records.map((rec) => (
              <div key={rec.id} className="relative group">
                {/* Node dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-forest-700 border-4 border-botanical-card dark:border-botanical-darkCard shadow-sm" />

                <div className="p-4 sm:p-5 rounded-2xl bg-forest-50/50 dark:bg-forest-950/30 border border-botanical-border/70 dark:border-botanical-darkBorder/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {rec.photo_url && (
                      <img src={rec.photo_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {rec.height && (
                          <span className="text-base font-extrabold text-forest-950 dark:text-leaf-100">
                            {rec.height} {rec.measurement_unit}
                          </span>
                        )}
                        {rec.leaf_count && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-leaf-300 font-semibold">
                            {rec.leaf_count} leaves
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-botanical-muted">
                        Recorded on {new Date(rec.recorded_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                      {rec.observation && (
                        <p className="text-xs text-botanical-text dark:text-botanical-darkText mt-1">
                          "{rec.observation}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="p-2 rounded-xl text-botanical-muted hover:text-rose-600 hover:bg-rose-50 transition self-end sm:self-center"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Growth Measurement"
        subtitle={`Record milestone metrics for ${currentPlant?.common_name || 'plant'}`}
      >
        <form onSubmit={handleAddRecord} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-forest-900 mb-1">Height</label>
              <input
                type="number"
                step="0.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 52"
                className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-forest-900 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card text-xs outline-none"
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="inches">Inches (in)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest-900 mb-1">Total Leaf Count</label>
            <input
              type="number"
              value={leafCount}
              onChange={(e) => setLeafCount(e.target.value)}
              placeholder="e.g. 8"
              className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-forest-900 mb-1">Milestone Observation</label>
            <textarea
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="e.g. Grew 2 new leaves after repotting into chunky aroid mix"
              className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-forest-900 mb-1">Progress Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Milestone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
