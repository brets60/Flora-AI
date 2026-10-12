import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Droplets,
  Sun,
  ShieldAlert,
  Calendar,
  Activity,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  Camera,
  AlertCircle
} from 'lucide-react';
import { Plant, CareReminder, CareLog, GrowthRecord, DiagnosisResponse } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

interface PlantDetailPageProps {
  plantId: string;
  onBack: () => void;
  onPlantUpdated: (plant: Plant) => void;
  onPlantDeleted: (plantId: string) => void;
}

export const PlantDetailPage: React.FC<PlantDetailPageProps> = ({
  plantId,
  onBack,
  onPlantUpdated,
  onPlantDeleted,
}) => {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reminders' | 'growth' | 'history'>('overview');
  const [reminders, setReminders] = useState<CareReminder[]>([]);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Growth modal state
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [newHeight, setNewHeight] = useState('');
  const [newLeafCount, setNewLeafCount] = useState('');
  const [newObservation, setNewObservation] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit health state
  const [isUpdatingHealth, setIsUpdatingHealth] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await api.getPlant(plantId);
      setPlant(p);

      const [rems, logs, growth, diags] = await Promise.all([
        api.getReminders({ plant_id: plantId }),
        api.getPlantCareLogs(plantId),
        api.getGrowthRecords(plantId),
        api.getDiagnoses(),
      ]);

      setReminders(rems);
      setCareLogs(logs);
      setGrowthRecords(growth);
      setDiagnoses(diags.filter(d => (d as any).plant_id === plantId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [plantId]);

  const handleHealthChange = async (newStatus: Plant['health_status']) => {
    if (!plant) return;
    setIsUpdatingHealth(true);
    try {
      const updated = await api.updatePlant(plant.id, { health_status: newStatus });
      setPlant(updated);
      onPlantUpdated(updated);
    } finally {
      setIsUpdatingHealth(false);
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    await api.completeReminder(reminderId);
    await loadData();
  };

  const handleAddGrowthRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plant) return;
    try {
      await api.addGrowthRecord(plant.id, {
        height: newHeight ? parseFloat(newHeight) : undefined,
        leaf_count: newLeafCount ? parseInt(newLeafCount) : undefined,
        observation: newObservation || undefined,
        health_status: plant.health_status,
      });
      setIsAddGrowthOpen(false);
      setNewHeight('');
      setNewLeafCount('');
      setNewObservation('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!plant) return;
    setIsDeleting(true);
    try {
      await api.deletePlant(plant.id);
      onPlantDeleted(plant.id);
      onBack();
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !plant) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Back button & Actions Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-forest-800 dark:text-leaf-300 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Garden</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Banner with Photo and Core Meta */}
      <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder overflow-hidden shadow-card flex flex-col md:flex-row">
        <div className="md:w-1/3 h-64 md:h-auto bg-forest-100 dark:bg-forest-950 relative overflow-hidden flex items-center justify-center">
          {plant.photo_url ? (
            <img src={plant.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">🌿</span>
          )}
        </div>

        <div className="p-6 sm:p-8 md:w-2/3 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={plant.health_status}>
                {plant.health_status.replace('_', ' ')}
              </Badge>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-leaf-300">
                {plant.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-leaf-50 dark:bg-leaf-950/40 text-leaf-700 dark:text-leaf-300">
                {plant.environment}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
              {plant.common_name}
            </h1>
            {plant.scientific_name && (
              <p className="text-sm text-botanical-muted dark:text-botanical-darkMuted italic">
                {plant.scientific_name}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-botanical-border/60 dark:border-botanical-darkBorder/60 text-xs">
            <div className="p-3 rounded-2xl bg-forest-50/50 dark:bg-forest-950/30">
              <span className="text-botanical-muted block">Watering Routine</span>
              <span className="font-bold text-forest-900 dark:text-leaf-200 mt-0.5 block">
                Every {plant.care_preferences?.watering_frequency_days || 7} days
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-forest-50/50 dark:bg-forest-950/30">
              <span className="text-botanical-muted block">Lighting</span>
              <span className="font-bold text-forest-900 dark:text-leaf-200 mt-0.5 block">
                {plant.care_preferences?.light || 'Bright indirect'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-forest-50/50 dark:bg-forest-950/30 col-span-2 sm:col-span-1">
              <span className="text-botanical-muted block">Location</span>
              <span className="font-bold text-forest-900 dark:text-leaf-200 mt-0.5 block">
                {plant.location || 'Living Room'}
              </span>
            </div>
          </div>

          {/* Health Status Modifier */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-bold text-forest-900 dark:text-leaf-300">Set Health Status:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['healthy', 'needs_attention', 'recovering', 'diseased'] as const).map((status) => (
                <button
                  key={status}
                  disabled={isUpdatingHealth}
                  onClick={() => handleHealthChange(status)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                    plant.health_status === status
                      ? 'bg-forest-700 text-white shadow-sm'
                      : 'bg-botanical-bg dark:bg-botanical-darkBg border border-botanical-border text-botanical-muted hover:text-forest-700'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="border-b border-botanical-border/70 dark:border-botanical-darkBorder/70 flex gap-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Care Overview', icon: Droplets },
          { id: 'reminders', label: `Reminders (${reminders.length})`, icon: Calendar },
          { id: 'growth', label: `Growth Records (${growthRecords.length})`, icon: TrendingUp },
          { id: 'history', label: `Care Logs (${careLogs.length})`, icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-forest-700 text-forest-800 dark:border-leaf-400 dark:text-leaf-300'
                  : 'border-transparent text-botanical-muted hover:text-forest-700 dark:hover:text-leaf-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-forest-900 dark:text-leaf-200 uppercase tracking-wider">
              Care Specifications
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-botanical-border/50">
                <span className="text-botanical-muted">Light Exposure</span>
                <span className="font-semibold text-forest-900 dark:text-leaf-200">{plant.care_preferences?.light || 'Bright indirect'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-botanical-border/50">
                <span className="text-botanical-muted">Watering Cadence</span>
                <span className="font-semibold text-forest-900 dark:text-leaf-200">Every {plant.care_preferences?.watering_frequency_days || 7} days</span>
              </div>
              <div className="flex justify-between py-2 border-b border-botanical-border/50">
                <span className="text-botanical-muted">Fertilizing Schedule</span>
                <span className="font-semibold text-forest-900 dark:text-leaf-200">Every {plant.care_preferences?.fertilizing_frequency_days || 30} days</span>
              </div>
              <div className="flex justify-between py-2 border-b border-botanical-border/50">
                <span className="text-botanical-muted">Recommended Soil</span>
                <span className="font-semibold text-forest-900 dark:text-leaf-200">{plant.care_preferences?.soil || 'Well-draining potting soil'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-botanical-border/50">
                <span className="text-botanical-muted">Pet Toxicity</span>
                <span className="font-semibold text-forest-900 dark:text-leaf-200">{plant.care_preferences?.toxicity || 'Non-toxic'}</span>
              </div>
            </div>
          </div>

          <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-forest-900 dark:text-leaf-200 uppercase tracking-wider">
              Notes & Journal
            </h3>
            <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted leading-relaxed whitespace-pre-wrap">
              {plant.notes || 'No special notes recorded for this plant yet. Record observations regarding potting mixes, light adjustments, or seasonal responses.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Reminders */}
      {activeTab === 'reminders' && (
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-forest-900 dark:text-leaf-200">Active Care Reminders</h3>
          </div>

          {reminders.length === 0 ? (
            <div className="py-8 text-center text-xs text-botanical-muted">
              No reminders scheduled for this plant.
            </div>
          ) : (
            <div className="divide-y divide-botanical-border/40">
              {reminders.map((rem) => (
                <div key={rem.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-950 dark:text-leaf-100">{rem.title}</span>
                      <Badge variant={rem.status === 'overdue' ? 'overdue' : 'pending'} size="sm">
                        {rem.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-botanical-muted">
                      Due: {new Date(rem.due_at).toLocaleDateString()} • Repeats: {rem.repeat_rule.replace('_', ' ')}
                    </p>
                  </div>
                  {rem.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleCompleteReminder(rem.id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Growth Records */}
      {activeTab === 'growth' && (
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-forest-900 dark:text-leaf-200">Growth Timeline</h3>
              <p className="text-xs text-botanical-muted">Record height measurements, new leaves, and photos</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddGrowthOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Entry
            </Button>
          </div>

          {growthRecords.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs text-botanical-muted">No growth measurements logged yet.</p>
              <Button size="sm" variant="outline" onClick={() => setIsAddGrowthOpen(true)}>
                Record Initial Height
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {growthRecords.map((rec) => (
                <div key={rec.id} className="p-4 rounded-2xl bg-forest-50/40 dark:bg-forest-950/20 border border-botanical-border/60 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-900 dark:text-leaf-200">
                        {rec.height ? `${rec.height} ${rec.measurement_unit}` : 'Milestone'}
                      </span>
                      {rec.leaf_count && (
                        <span className="text-xs text-forest-700 font-medium">({rec.leaf_count} leaves)</span>
                      )}
                      <span className="text-[11px] text-botanical-muted">
                        • {new Date(rec.recorded_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rec.observation && (
                      <p className="text-xs text-botanical-muted">{rec.observation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Care History Logs */}
      {activeTab === 'history' && (
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-forest-900 dark:text-leaf-200">Care Log History</h3>
          {careLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-botanical-muted">
              No care actions logged yet. As you complete tasks, they are permanently archived here.
            </div>
          ) : (
            <div className="divide-y divide-botanical-border/40">
              {careLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-forest-100 dark:bg-forest-900/60 text-forest-700">
                      <Droplets className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-forest-950 dark:text-leaf-200 capitalize">{log.action_type}</span>
                      <p className="text-[11px] text-botanical-muted">{log.notes || 'Activity completed'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-botanical-muted">
                    {new Date(log.completed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Growth Modal */}
      <Modal
        isOpen={isAddGrowthOpen}
        onClose={() => setIsAddGrowthOpen(false)}
        title="Record Growth Milestone"
        subtitle={`Track development for ${plant.common_name}`}
      >
        <form onSubmit={handleAddGrowthRecord} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-forest-900 mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.5"
              value={newHeight}
              onChange={(e) => setNewHeight(e.target.value)}
              placeholder="e.g. 48.5"
              className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-forest-900 mb-1">Total Leaf Count</label>
            <input
              type="number"
              value={newLeafCount}
              onChange={(e) => setNewLeafCount(e.target.value)}
              placeholder="e.g. 7"
              className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-forest-900 mb-1">Observation</label>
            <textarea
              rows={2}
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              placeholder="e.g. Unfurled a new fenestrated leaf!"
              className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddGrowthOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Plant Record?"
        subtitle="This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-botanical-muted leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-forest-900">{plant.common_name}</span>? All associated care schedules and growth records will be permanently removed.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
