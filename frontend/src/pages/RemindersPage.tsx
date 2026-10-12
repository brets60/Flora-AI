import React, { useState, useEffect } from 'react';
import {
  Bell,
  Droplets,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  Scissors,
  Layers,
  Bug,
  Sparkles,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CareReminder, Plant } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<CareReminder[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [taskFilter, setTaskFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // New Reminder Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [taskType, setTaskType] = useState('watering');
  const [customTitle, setCustomTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeatRule, setRepeatRule] = useState('weekly');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Snooze popup
  const [snoozeTargetId, setSnoozeTargetId] = useState<string | null>(null);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const [rems, userPlants] = await Promise.all([
        api.getReminders({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          task_type: taskFilter !== 'all' ? taskFilter : undefined,
        }),
        api.getPlants(),
      ]);
      setReminders(rems);
      setPlants(userPlants);
      if (userPlants.length > 0 && !selectedPlantId) {
        setSelectedPlantId(userPlants[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [statusFilter, taskFilter]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('FloraAI Reminders Activated 🌿', {
          body: 'You will receive timely botanical care alerts when watering is due!',
        });
      }
    }
  };

  const handleComplete = async (id: string) => {
    await api.completeReminder(id);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 }, colors: ['#245C43', '#69A86B'] });
    } catch {}
    await fetchReminders();
  };

  const handleSnooze = async (id: string, days: number) => {
    await api.snoozeReminder(id, days);
    setSnoozeTargetId(null);
    await fetchReminders();
  };

  const handleDelete = async (id: string) => {
    await api.deleteReminder(id);
    await fetchReminders();
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantId) return;
    setIsSubmitting(true);
    try {
      const chosenPlant = plants.find(p => p.id === selectedPlantId);
      const title = customTitle || `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} ${chosenPlant?.common_name || 'Plant'}`;
      
      let repeatDays = 7;
      if (repeatRule === 'daily') repeatDays = 1;
      else if (repeatRule === 'every_3_days') repeatDays = 3;
      else if (repeatRule === 'weekly') repeatDays = 7;
      else if (repeatRule === 'biweekly') repeatDays = 14;
      else if (repeatRule === 'monthly') repeatDays = 30;

      const dateObj = dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000);

      await api.createReminder({
        plant_id: selectedPlantId,
        task_type: taskType,
        title,
        due_at: dateObj.toISOString(),
        repeat_rule: repeatRule,
        repeat_days: repeatDays,
        notes: notes || undefined,
      });

      setIsAddModalOpen(false);
      setCustomTitle('');
      setNotes('');
      await fetchReminders();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'watering': return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'fertilizing': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'pruning': return <Scissors className="w-4 h-4 text-emerald-600" />;
      case 'repotting': return <Layers className="w-4 h-4 text-orange-500" />;
      case 'pest_inspection': return <Bug className="w-4 h-4 text-rose-500" />;
      default: return <Droplets className="w-4 h-4 text-forest-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
            Care Reminders & Schedules
          </h2>
          <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-1">
            Keep your botanical collection hydrated and nourished with adaptive schedules
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Reminder
        </Button>
      </div>

      {/* Browser Notification Banner if not granted */}
      {notificationPermission !== 'granted' && (
        <div className="p-4 rounded-2xl bg-forest-50/80 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-forest-700 text-white flex-shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-forest-950 dark:text-leaf-200">Enable Desktop & Push Notifications</h4>
              <p className="text-[11px] text-botanical-muted dark:text-botanical-darkMuted">
                FloraAI will alert you when plants need water, preventing dehydration or overwatering shock.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={requestNotificationPermission}
          >
            Allow Notifications
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-3 flex flex-wrap items-center justify-between gap-3 shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'pending', label: 'Due & Pending' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.id
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'text-botanical-muted hover:text-forest-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={taskFilter}
          onChange={(e) => setTaskFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-botanical-border bg-botanical-card text-xs font-medium outline-none"
        >
          <option value="all">All Task Types</option>
          <option value="watering">Watering</option>
          <option value="fertilizing">Fertilizing</option>
          <option value="pruning">Pruning</option>
          <option value="repotting">Repotting</option>
          <option value="pest_inspection">Pest Inspection</option>
        </select>
      </div>

      {/* Reminders List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-10 text-center space-y-2 shadow-soft">
          <p className="text-sm font-bold text-forest-900 dark:text-leaf-200">No Reminders Found</p>
          <p className="text-xs text-botanical-muted">You have no tasks matching this filter view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-4 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-forest-300 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-forest-100 dark:bg-forest-900 overflow-hidden flex items-center justify-center flex-shrink-0 text-xl">
                  {rem.plant_photo ? (
                    <img src={rem.plant_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getTaskIcon(rem.task_type)
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-forest-950 dark:text-leaf-100">{rem.title}</h4>
                    <Badge variant={rem.status === 'overdue' ? 'overdue' : rem.status === 'completed' ? 'completed' : 'pending'} size="sm">
                      {rem.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-0.5">
                    {rem.plant_name} • Due: {new Date(rem.due_at).toLocaleDateString()} • Repeats: {rem.repeat_rule.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {rem.status !== 'completed' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleComplete(rem.id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Done
                    </Button>

                    <div className="relative">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSnoozeTargetId(snoozeTargetId === rem.id ? null : rem.id)}
                        icon={<Clock className="w-3.5 h-3.5" />}
                      >
                        Snooze
                      </Button>

                      {snoozeTargetId === rem.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-botanical-card dark:bg-botanical-darkCard rounded-xl shadow-elevated border border-botanical-border p-1.5 z-20 text-xs">
                          <button
                            onClick={() => handleSnooze(rem.id, 1)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-forest-50 dark:hover:bg-forest-900/40"
                          >
                            +1 Day
                          </button>
                          <button
                            onClick={() => handleSnooze(rem.id, 2)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-forest-50 dark:hover:bg-forest-900/40"
                          >
                            +2 Days
                          </button>
                          <button
                            onClick={() => handleSnooze(rem.id, 7)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-forest-50 dark:hover:bg-forest-900/40"
                          >
                            +1 Week
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <button
                  onClick={() => handleDelete(rem.id)}
                  className="p-2 rounded-xl text-botanical-muted hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Care Task"
        subtitle="Set up recurring reminders for hydration, nutrients, and pruning"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-forest-900 mb-1">Target Plant *</label>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card text-xs outline-none"
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.common_name} ({p.location})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-forest-900 mb-1">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card text-xs outline-none"
            >
              <option value="watering">Watering</option>
              <option value="fertilizing">Fertilizing</option>
              <option value="pruning">Pruning</option>
              <option value="repotting">Repotting</option>
              <option value="pest_inspection">Pest Inspection</option>
              <option value="custom">Custom Task</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-forest-900 mb-1">Task Title (Optional override)</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Deep soak with rain water"
              className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-forest-900 mb-1">First Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-forest-900 mb-1">Repeat Cadence</label>
              <select
                value={repeatRule}
                onChange={(e) => setRepeatRule(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card text-xs outline-none"
              >
                <option value="daily">Daily</option>
                <option value="every_3_days">Every 3 Days</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every 2 Weeks</option>
                <option value="monthly">Monthly</option>
                <option value="once">Once only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-forest-900 mb-1">Special Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Check soil moisture 2 inches deep before watering..."
              className="w-full px-3 py-2 rounded-xl border border-botanical-border text-xs outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
