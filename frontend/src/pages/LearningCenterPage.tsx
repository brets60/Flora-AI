import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Sprout,
  Sun,
  Droplets,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { Article } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const LearningCenterPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'All',
    'Indoor Plants',
    'Succulents & Cacti',
    'Plant Diseases',
    'Propagation',
    'Soil & Nutrition'
  ];

  useEffect(() => {
    setIsLoading(true);
    api.getArticles({
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      search: searchTerm || undefined,
    })
      .then(setArticles)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchTerm]);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-leaf-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Botanical Care Encyclopedia</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
          Learning Center & Guides
        </h2>
        <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-1">
          Explore curated horticultural masterclasses on species care, propagation, and organic soil biology
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-2xl border border-botanical-border dark:border-botanical-darkBorder p-4 shadow-soft space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-botanical-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guides, care routines, pest remedies..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-botanical-border bg-botanical-bg/50 text-xs outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-forest-50/70 dark:bg-forest-950/40 text-forest-900 dark:text-leaf-300 hover:bg-forest-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border p-12 text-center space-y-2">
          <p className="text-sm font-bold text-forest-900 dark:text-leaf-200">No Articles Found</p>
          <p className="text-xs text-botanical-muted">Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder overflow-hidden shadow-soft hover:shadow-card hover:border-forest-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="h-44 bg-forest-100 relative overflow-hidden">
                {art.image_url ? (
                  <img src={art.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-forest-900 shadow-sm">
                    {art.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest-700 text-white shadow-sm">
                    {art.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-forest-950 dark:text-leaf-100 group-hover:text-forest-700 dark:group-hover:text-leaf-300 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-botanical-muted line-clamp-2 mt-1">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-botanical-border/60 flex items-center justify-between text-xs font-bold text-forest-700 dark:text-leaf-400">
                  <span>Read Guide</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <Modal
          isOpen={Boolean(selectedArticle)}
          onClose={() => setSelectedArticle(null)}
          title={selectedArticle.title}
          subtitle={`${selectedArticle.category} • Difficulty: ${selectedArticle.difficulty}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs text-botanical-text dark:text-botanical-darkText leading-relaxed">
            {selectedArticle.image_url && (
              <div className="h-60 rounded-2xl overflow-hidden shadow-inner">
                <img src={selectedArticle.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Light / Water Quick Specs */}
            {(selectedArticle.light_req || selectedArticle.water_req) && (
              <div className="grid grid-cols-2 gap-3">
                {selectedArticle.light_req && (
                  <div className="p-3 rounded-2xl bg-forest-50/60 dark:bg-forest-950/40 border border-forest-100 space-y-1">
                    <span className="font-bold text-forest-900 dark:text-leaf-200 block">☀️ Lighting:</span>
                    <span className="text-botanical-muted">{selectedArticle.light_req}</span>
                  </div>
                )}
                {selectedArticle.water_req && (
                  <div className="p-3 rounded-2xl bg-forest-50/60 dark:bg-forest-950/40 border border-forest-100 space-y-1">
                    <span className="font-bold text-forest-900 dark:text-leaf-200 block">💧 Watering:</span>
                    <span className="text-botanical-muted">{selectedArticle.water_req}</span>
                  </div>
                )}
              </div>
            )}

            {/* Markdown Content */}
            <div className="whitespace-pre-wrap leading-relaxed space-y-3">
              {selectedArticle.content}
            </div>

            {/* Step-by-step if present */}
            {selectedArticle.step_by_step && selectedArticle.step_by_step.length > 0 && (
              <div className="p-4 rounded-2xl bg-leaf-50/50 dark:bg-leaf-950/30 border border-leaf-200/60 space-y-2">
                <h4 className="font-bold text-forest-900 dark:text-leaf-200">Step-by-Step Instructions:</h4>
                <ol className="space-y-1 list-decimal list-inside text-botanical-muted">
                  {selectedArticle.step_by_step.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Common problems */}
            {selectedArticle.common_problems && selectedArticle.common_problems.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-forest-900 dark:text-leaf-200">Troubleshooting Common Issues:</h4>
                <div className="space-y-2">
                  {selectedArticle.common_problems.map((prob, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-botanical-bg/70 border border-botanical-border/60">
                      <span className="font-bold text-rose-700 dark:text-rose-400 block">• Issue: {prob.issue}</span>
                      <span className="text-botanical-muted block mt-0.5">Solution: {prob.fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedArticle.attribution && (
              <div className="pt-4 border-t border-botanical-border/60 text-[11px] text-botanical-muted italic">
                Source attribution: {selectedArticle.attribution}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
