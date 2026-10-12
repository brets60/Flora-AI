import React, { useState, useEffect } from 'react';
import {
  Sprout,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Scan,
  Activity,
  PlusCircle,
  MessageSquare,
  Droplets,
  ArrowRight,
  Sun,
  ShieldAlert,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats, CareReminder } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface DashboardPageProps {
  onNavigate: (tab: string, extra?: any) => void;
  onOpenAddPlant: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenAddPlant }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCompleteTask = async (task: CareReminder) => {
    setCompletingTaskId(task.id);
    try {
      await api.completeReminder(task.id);
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#245C43', '#69A86B', '#91c9ad']
        });
      } catch {
        // Ignored
      }
      await fetchStats();
    } finally {
      setCompletingTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl w-2/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  const hasNoPlants = (stats?.total_plants || 0) === 0;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Botanical Header Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/60 border border-forest-600/50 text-leaf-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plant Care & Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {user?.full_name ? user.full_name.split(' ')[0] : 'Gardener'} 🌿
            </h1>
            <p className="text-sm text-forest-100/90 max-w-xl">
              {(stats?.total_plants || 0) === 0
                ? "Your botanical sanctuary is ready. Add or identify your first plant to start personalized care scheduling."
                : `You have ${stats?.total_plants || 0} living specimens in your care. ${(stats?.today_tasks || []).length} tasks need your loving attention today.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => onNavigate('scan')}
              icon={<Scan className="w-4 h-4" />}
            >
              Scan Plant
            </Button>
            <Button
              variant="outline"
              onClick={onOpenAddPlant}
              className="bg-forest-700/40 text-white border-forest-600 hover:bg-forest-700/80"
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Add Plant
            </Button>
          </div>
        </div>

        {/* Botanical watermark pattern */}
        <div className="absolute -right-8 -bottom-10 text-forest-700/30 text-9xl pointer-events-none select-none">
          🌿
        </div>
      </div>

      {/* Onboarding State if 0 plants */}
      {hasNoPlants && (
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-8 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-leaf-300 flex items-center justify-center mx-auto text-3xl">
            🌱
          </div>
          <h3 className="text-xl font-bold text-forest-900 dark:text-leaf-200">
            Start Your Digital Garden
          </h3>
          <p className="text-sm text-botanical-muted dark:text-botanical-darkMuted max-w-md mx-auto">
            Take a photo of any houseplant or garden crop to instantly identify its species, receive exact watering intervals, and prevent common problems.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Button variant="primary" onClick={() => onNavigate('scan')} icon={<Scan className="w-4 h-4" />}>
              Identify with AI
            </Button>
            <Button variant="outline" onClick={onOpenAddPlant} icon={<PlusCircle className="w-4 h-4" />}>
              Add Manually
            </Button>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          onClick={() => onNavigate('plants')}
          className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-5 hover:border-forest-300 dark:hover:border-forest-700 transition cursor-pointer shadow-soft group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-botanical-muted dark:text-botanical-darkMuted">Total Plants</span>
            <div className="p-2.5 rounded-xl bg-forest-50 dark:bg-forest-900/50 text-forest-700 dark:text-leaf-300 group-hover:scale-110 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-forest-950 dark:text-leaf-100 mt-3">{stats?.total_plants || 0}</p>
          <span className="text-xs text-forest-700 dark:text-leaf-400 font-medium mt-1 inline-block">Active collection →</span>
        </div>

        <div
          onClick={() => onNavigate('plants', { filter: 'attention' })}
          className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-5 hover:border-amber-300 transition cursor-pointer shadow-soft group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-botanical-muted dark:text-botanical-darkMuted">Needs Attention</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-forest-950 dark:text-leaf-100 mt-3">{stats?.plants_needing_attention || 0}</p>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 inline-block">Check health status →</span>
        </div>

        <div
          onClick={() => onNavigate('reminders')}
          className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-5 hover:border-leaf-300 transition cursor-pointer shadow-soft group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-botanical-muted dark:text-botanical-darkMuted">Today's Tasks</span>
            <div className="p-2.5 rounded-xl bg-leaf-50 dark:bg-leaf-950/50 text-leaf-600 dark:text-leaf-400 group-hover:scale-110 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-forest-950 dark:text-leaf-100 mt-3">{(stats?.today_tasks || []).length}</p>
          <span className="text-xs text-leaf-600 dark:text-leaf-400 font-medium mt-1 inline-block">Scheduled for today →</span>
        </div>

        <div
          onClick={() => onNavigate('reminders')}
          className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-5 hover:border-forest-300 transition cursor-pointer shadow-soft group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-botanical-muted dark:text-botanical-darkMuted">Done This Week</span>
            <div className="p-2.5 rounded-xl bg-forest-50 dark:bg-forest-900/50 text-forest-700 dark:text-leaf-300 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-forest-950 dark:text-leaf-100 mt-3">{stats?.completed_tasks_this_week || 0}</p>
          <span className="text-xs text-forest-700 dark:text-leaf-400 font-medium mt-1 inline-block">Care activities logged →</span>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-botanical-border/60 dark:border-botanical-darkBorder/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-leaf-300">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-forest-900 dark:text-leaf-200">Today's Care Activities</h3>
                  <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted">Check soil and complete scheduled tasks</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('reminders')}
              >
                View all ({stats?.upcoming_tasks_count || (stats?.today_tasks || []).length})
              </Button>
            </div>

            <div className="mt-4 divide-y divide-botanical-border/40 dark:divide-botanical-darkBorder/40">
              {(stats?.today_tasks || []).length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                    ✨
                  </div>
                  <p className="text-sm font-semibold text-forest-900 dark:text-leaf-200">All caught up for today!</p>
                  <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted">No pending watering or care tasks due right now.</p>
                </div>
              ) : (
                (stats?.today_tasks || []).map((task) => (
                  <div key={task.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-forest-100 dark:bg-forest-900/50 overflow-hidden flex-shrink-0 flex items-center justify-center text-lg">
                        {task.plant_photo ? (
                          <img src={task.plant_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          '🌿'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-forest-950 dark:text-leaf-100">{task.title}</h4>
                          <Badge variant={task.status === 'overdue' ? 'overdue' : 'pending'} size="sm">
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-0.5">
                          {task.plant_name} • {task.repeat_rule.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={completingTaskId === task.id}
                        onClick={() => handleCompleteTask(task)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Seasonal Gardening Tip Card */}
          {stats?.seasonal_tip && (
            <div className="bg-gradient-to-r from-leaf-500/10 via-forest-500/10 to-transparent dark:from-forest-950/50 dark:to-transparent rounded-3xl border border-leaf-200 dark:border-forest-800 p-6 shadow-soft flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-leaf-100 dark:bg-forest-900 text-leaf-700 dark:text-leaf-300 flex-shrink-0 text-xl">
                ☀️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700 dark:text-leaf-400">
                    {stats.seasonal_tip.season}
                  </span>
                </div>
                <h4 className="text-base font-bold text-forest-900 dark:text-leaf-200">
                  {stats.seasonal_tip.title}
                </h4>
                <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted leading-relaxed">
                  {stats.seasonal_tip.tip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Action Cards & Recent Diagnoses */}
        <div className="space-y-6">
          {/* Quick Action Matrix */}
          <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-3">
            <h3 className="font-bold text-forest-900 dark:text-leaf-200 text-sm">Quick Actions</h3>

            <button
              onClick={() => onNavigate('scan')}
              className="w-full p-3.5 rounded-2xl bg-forest-50 dark:bg-forest-950/50 border border-forest-100 dark:border-forest-800 flex items-center justify-between text-left hover:bg-forest-100 dark:hover:bg-forest-900/60 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-forest-700 text-white group-hover:scale-105 transition-transform">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-forest-950 dark:text-leaf-200">Identify New Plant</p>
                  <p className="text-[11px] text-botanical-muted dark:text-botanical-darkMuted">Take a leaf or flower photo</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-forest-700 dark:text-leaf-300" />
            </button>

            <button
              onClick={() => onNavigate('diagnose')}
              className="w-full p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between text-left hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-600 text-white group-hover:scale-105 transition-transform">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-forest-950 dark:text-leaf-200">Diagnose Disease</p>
                  <p className="text-[11px] text-botanical-muted dark:text-botanical-darkMuted">Detect pests & leaf damage</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="w-full p-3.5 rounded-2xl bg-leaf-50/60 dark:bg-leaf-950/30 border border-leaf-100 dark:border-leaf-900/50 flex items-center justify-between text-left hover:bg-leaf-100/60 dark:hover:bg-leaf-900/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-leaf-500 text-forest-950 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-forest-950 dark:text-leaf-200">Ask AI Doctor</p>
                  <p className="text-[11px] text-botanical-muted dark:text-botanical-darkMuted">Conversational plant care advice</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-leaf-600 dark:text-leaf-400" />
            </button>

            <button
              onClick={() => onNavigate('calendar')}
              className="w-full p-3.5 rounded-2xl bg-botanical-bg dark:bg-botanical-darkBg border border-botanical-border dark:border-botanical-darkBorder flex items-center justify-between text-left hover:bg-forest-50 dark:hover:bg-forest-950/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-forest-600 text-white group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-forest-950 dark:text-leaf-200">Care Calendar</p>
                  <p className="text-[11px] text-botanical-muted dark:text-botanical-darkMuted">Monthly watering schedule</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-forest-600 dark:text-leaf-400" />
            </button>
          </div>

          {/* Recent Diagnoses Widget */}
          <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-forest-900 dark:text-leaf-200 text-sm">Recent Diagnoses</h3>
              <button
                onClick={() => onNavigate('diagnose')}
                className="text-xs text-forest-700 dark:text-leaf-400 hover:underline font-semibold"
              >
                History →
              </button>
            </div>

            {(stats?.recent_diagnoses || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-botanical-muted dark:text-botanical-darkMuted">
                No disease diagnoses recorded yet. Your garden appears healthy!
              </div>
            ) : (
              <div className="space-y-3">
                {(stats?.recent_diagnoses || []).slice(0, 3).map((diag) => (
                  <div
                    key={diag.id}
                    onClick={() => onNavigate('diagnose')}
                    className="p-3 rounded-2xl border border-botanical-border dark:border-botanical-darkBorder hover:border-forest-300 transition cursor-pointer flex items-center gap-3"
                  >
                    <img
                      src={diag.image_url}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold text-forest-950 dark:text-leaf-200 truncate">
                        {diag.possible_conditions[0]?.name || 'Analyzed Specimen'}
                      </p>
                      <p className="text-[11px] text-botanical-muted truncate">
                        Confidence: {(diag.confidence * 100).toFixed(0)}% • {diag.isolation_needed ? 'Quarantine recommended' : 'Gentle care'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
