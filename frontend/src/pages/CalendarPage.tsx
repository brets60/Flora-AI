import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Sparkles,
  Scissors,
  CheckCircle2,
  Clock,
  Sprout
} from 'lucide-react';
import { CalendarEvent, Plant } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPlant, setSelectedPlant] = useState<string>('all');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCalendar = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const [evts, userPlants] = await Promise.all([
        api.getCalendarEvents({
          start_date: start,
          end_date: end,
          plant_id: selectedPlant !== 'all' ? selectedPlant : undefined,
          task_type: selectedTaskType !== 'all' ? selectedTaskType : undefined,
        }),
        api.getPlants(),
      ]);

      setEvents(evts);
      setPlants(userPlants);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [currentDate, selectedPlant, selectedTaskType]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar days calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  // Filter events for the selected day
  const selectedDayEvents = events.filter((e) => {
    const eventDayStr = e.date.split('T')[0];
    return eventDayStr === selectedDate;
  });

  const handleCompleteCalendarEvent = async (reminderId?: string) => {
    if (!reminderId) return;
    await api.completeReminder(reminderId);
    await fetchCalendar();
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
            Botanical Care Calendar
          </h2>
          <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-1">
            Visual map of scheduled watering, fertilizing, and completed care activities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card text-xs font-medium outline-none"
          >
            <option value="all">All Plants</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>{p.common_name}</option>
            ))}
          </select>

          <select
            value={selectedTaskType}
            onChange={(e) => setSelectedTaskType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card text-xs font-medium outline-none"
          >
            <option value="all">All Task Types</option>
            <option value="watering">Watering</option>
            <option value="fertilizing">Fertilizing</option>
            <option value="pruning">Pruning</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-3 border-b border-botanical-border/60">
            <h3 className="text-base font-bold text-forest-900 dark:text-leaf-200">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-botanical-border hover:bg-forest-50 dark:hover:bg-forest-900/40 text-botanical-muted hover:text-forest-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-botanical-border hover:bg-forest-50"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-botanical-border hover:bg-forest-50 dark:hover:bg-forest-900/40 text-botanical-muted hover:text-forest-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-botanical-muted">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-20 rounded-xl bg-transparent" />;
              }

              const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === formattedDate;
              const isToday = new Date().toISOString().split('T')[0] === formattedDate;

              // Events on this day
              const dayEvents = events.filter((e) => e.date.split('T')[0] === formattedDate);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(formattedDate)}
                  className={`h-14 sm:h-20 p-1.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-forest-700 bg-forest-50/60 dark:bg-forest-950/60 shadow-sm'
                      : 'border-botanical-border/60 hover:border-forest-300 dark:hover:border-forest-700 bg-botanical-bg/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-forest-700 text-white shadow-sm'
                          : 'text-forest-900 dark:text-leaf-200'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Event indicators dots/chips */}
                  <div className="flex items-center gap-1 overflow-hidden flex-wrap">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          e.type === 'completed_log'
                            ? 'bg-emerald-500'
                            : e.status === 'overdue'
                            ? 'bg-rose-500'
                            : 'bg-sky-500'
                        }`}
                        title={e.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-botanical-muted font-bold">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda (4 cols) */}
        <div className="lg:col-span-4 bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 shadow-soft space-y-4">
          <div className="pb-3 border-b border-botanical-border/60">
            <h3 className="text-sm font-bold text-forest-900 dark:text-leaf-200">
              Agenda for {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-[11px] text-botanical-muted">
              {selectedDayEvents.length} event{selectedDayEvents.length === 1 ? '' : 's'} recorded
            </p>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-botanical-muted space-y-2">
              <CalendarIcon className="w-8 h-8 text-botanical-muted/50 mx-auto" />
              <p>No care tasks scheduled for this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl bg-forest-50/50 dark:bg-forest-950/30 border border-botanical-border/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-forest-950 dark:text-leaf-100">{evt.title}</h4>
                      <p className="text-[11px] text-botanical-muted mt-0.5">{evt.plant_name}</p>
                    </div>
                    <Badge variant={evt.status === 'completed' ? 'completed' : evt.status === 'overdue' ? 'overdue' : 'pending'} size="sm">
                      {evt.status}
                    </Badge>
                  </div>

                  {evt.type === 'reminder' && evt.status !== 'completed' && evt.reminder_id && (
                    <div className="pt-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCompleteCalendarEvent(evt.reminder_id)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Mark Completed
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
