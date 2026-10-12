import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Droplets,
  Sun,
  MapPin,
  ChevronRight,
  Sprout,
  Scan,
  AlertCircle
} from 'lucide-react';
import { Plant } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface MyPlantsPageProps {
  onSelectPlant: (plant: Plant) => void;
  onOpenAddModal: () => void;
  onNavigateToScan: () => void;
  initialFilter?: string;
}

export const MyPlantsPage: React.FC<MyPlantsPageProps> = ({
  onSelectPlant,
  onOpenAddModal,
  onNavigateToScan,
  initialFilter,
}) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState(initialFilter || 'All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Indoor', 'Outdoor', 'Succulent', 'Herb', 'Vegetable', 'Flower', 'Tropical'];

  const fetchPlants = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPlants({
        search: searchTerm || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        health_status: healthFilter !== 'All' ? healthFilter : undefined,
      });
      setPlants(data);
    } catch (err) {
      console.error('Failed to load plants', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, [searchTerm, categoryFilter, healthFilter]);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
            My Digital Garden
          </h2>
          <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted">
            {plants.length} plant{plants.length === 1 ? '' : 's'} registered in your personal collection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onNavigateToScan}
            icon={<Scan className="w-4 h-4" />}
          >
            Identify & Add
          </Button>
          <Button
            variant="primary"
            onClick={onOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Plant
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-4 shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-botanical-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by common or botanical name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs focus:ring-2 focus:ring-forest-500/30 outline-none"
            />
          </div>

          {/* Health Status & View Mode */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-card dark:bg-botanical-darkCard text-xs font-medium focus:ring-2 focus:ring-forest-500/30 outline-none"
            >
              <option value="All">All Health Statuses</option>
              <option value="healthy">Healthy Only</option>
              <option value="needs_attention">Needs Attention</option>
              <option value="recovering">Recovering</option>
              <option value="diseased">Diseased</option>
            </select>

            <div className="flex items-center border border-botanical-border dark:border-botanical-darkBorder rounded-xl p-0.5 bg-botanical-bg/50 dark:bg-botanical-darkBg/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'text-botanical-muted hover:text-forest-700'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'text-botanical-muted hover:text-forest-700'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-forest-700 text-white font-bold shadow-sm'
                  : 'bg-forest-50/70 dark:bg-forest-950/40 text-forest-900 dark:text-leaf-300 hover:bg-forest-100 dark:hover:bg-forest-900/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plants Grid / List View */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          ))}
        </div>
      ) : plants.length === 0 ? (
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-leaf-300 flex items-center justify-center mx-auto text-3xl">
            🪴
          </div>
          <h3 className="text-xl font-bold text-forest-900 dark:text-leaf-200">
            No Plants Found
          </h3>
          <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'All' || healthFilter !== 'All'
              ? 'No specimens match your current filter settings. Try clearing your search.'
              : 'Your garden is empty. Add your first houseplant or herb to begin tracking care.'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="primary" onClick={onOpenAddModal} icon={<Plus className="w-4 h-4" />}>
              Add Plant
            </Button>
            <Button variant="outline" onClick={onNavigateToScan} icon={<Scan className="w-4 h-4" />}>
              Scan with AI
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div
              key={plant.id}
              onClick={() => onSelectPlant(plant)}
              className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder overflow-hidden shadow-soft hover:shadow-card hover:border-forest-300 dark:hover:border-forest-700 transition cursor-pointer group flex flex-col"
            >
              {/* Photo Box */}
              <div className="relative h-48 w-full bg-forest-100 dark:bg-forest-950 overflow-hidden">
                {plant.photo_url ? (
                  <img
                    src={plant.photo_url}
                    alt={plant.common_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🌿
                  </div>
                )}
                {/* Badges on photo */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <Badge variant={plant.health_status} size="sm">
                    {plant.health_status.replace('_', ' ')}
                  </Badge>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-black/80 backdrop-blur-sm text-forest-900 dark:text-leaf-300 shadow-sm">
                    {plant.category}
                  </span>
                </div>
              </div>

              {/* Plant Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-forest-950 dark:text-leaf-100 group-hover:text-forest-700 dark:group-hover:text-leaf-300 transition-colors">
                    {plant.common_name}
                  </h3>
                  {plant.scientific_name && (
                    <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted italic mt-0.5">
                      {plant.scientific_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-botanical-border/60 dark:border-botanical-darkBorder/60 text-xs text-botanical-muted dark:text-botanical-darkMuted">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-forest-700 dark:text-leaf-400" />
                    <span>{plant.location || 'Living Room'} ({plant.environment})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-leaf-500" />
                    <span>Water every {plant.care_preferences?.watering_frequency_days || 7} days</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-forest-700 dark:text-leaf-400">
                  <span>View Details & History</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder divide-y divide-botanical-border/50 dark:divide-botanical-darkBorder/50 shadow-soft overflow-hidden">
          {plants.map((plant) => (
            <div
              key={plant.id}
              onClick={() => onSelectPlant(plant)}
              className="p-4 hover:bg-forest-50/50 dark:hover:bg-forest-950/30 transition cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-forest-100 dark:bg-forest-950 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                  {plant.photo_url ? (
                    <img src={plant.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    '🌿'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-forest-950 dark:text-leaf-100">
                      {plant.common_name}
                    </h3>
                    <Badge variant={plant.health_status} size="sm">
                      {plant.health_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-botanical-muted italic mt-0.5">
                    {plant.scientific_name || plant.category} • {plant.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-xs text-botanical-muted">
                  Water every {plant.care_preferences?.watering_frequency_days || 7}d
                </span>
                <ChevronRight className="w-4 h-4 text-botanical-muted group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
