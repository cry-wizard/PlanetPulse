"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchCarbonNews, NewsArticle } from "@/lib/news-api";
import {
  Newspaper,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface NewsPanelProps {
  className?: string;
  category?: NewsArticle["category"] | "all";
  showCategoryFilter?: boolean;
  maxArticles?: number;
}

const CATEGORY_ICONS: Record<NewsArticle["category"], typeof Newspaper> = {
  carbon: Newspaper,
  policy: Newspaper,
  technology: Sparkles,
  science: Newspaper,
  general: Newspaper,
};

const CATEGORY_COLORS: Record<NewsArticle["category"], string> = {
  carbon: "bg-green-500/20 text-green-400 border-green-500/20",
  policy: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  technology: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  science: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  general: "bg-dark-500/20 text-dark-300 border-dark-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "All News",
  carbon: "Carbon",
  policy: "Policy",
  technology: "Tech",
  science: "Science",
  general: "General",
};

const CATEGORIES: Array<"all" | NewsArticle["category"]> = [
  "all",
  "carbon",
  "policy",
  "technology",
  "science",
  "general",
];

export function NewsPanel({
  className = "",
  category: propCategory = "all",
  showCategoryFilter = true,
  maxArticles = 8,
}: NewsPanelProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(propCategory);

  // Fetch news when category changes
  const fetchNews = useCallback(async (cat: string) => {
    setLoading(true);
    setError(null);
    try {
      let data: NewsArticle[];
      if (cat === "all") {
        data = await fetchCarbonNews(maxArticles);
      } else {
        const catKey = cat as NewsArticle["category"];
        data = await fetchCarbonNews(maxArticles * 2).then((all) =>
          all.filter((a) => a.category === catKey).slice(0, maxArticles),
        );
      }
      setArticles(data);
    } catch (err) {
      setError("Failed to load news. Showing saved articles.");
      // Load fallback
      try {
        const { FALLBACK_ARTICLES } = await import("@/lib/news-api");
        setArticles(
          (cat === "all"
            ? FALLBACK_ARTICLES
            : FALLBACK_ARTICLES.filter((a) => a.category === cat)
          ).slice(0, maxArticles),
        );
      } catch {
        setArticles([]);
      }
    } finally {
      setLoading(false);
    }
  }, [maxArticles]);

  useEffect(() => {
    fetchNews(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, fetchNews]);

  const getCategoryLabel = (cat: string) => CATEGORY_LABELS[cat] || cat;

  return (
    <div className={`rounded-xl border border-dark-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-amber-500/20 flex items-center justify-center">
            <Newspaper size={16} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-100">Climate News</h3>
            <p className="text-xs text-dark-400">Latest updates on carbon & climate</p>
          </div>
        </div>
        {showCategoryFilter && (
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-xs px-2 py-1 rounded-md transition-all ${
              activeCategory === "all"
                ? "bg-green-500/20 text-green-400 border border-green-500/20"
                : "text-dark-400 hover:text-dark-200 border border-transparent hover:border-dark-700"
            }`}
          >
            All
          </button>
        )}
      </div>

      {/* Category filter */}
      {showCategoryFilter && (
        <div className="flex flex-wrap gap-1 px-4 pt-3 pb-2 border-b border-dark-800/50">
          {CATEGORIES.filter((c) => c !== "all").map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                activeCategory === cat
                  ? "bg-dark-700 text-dark-200 border border-dark-500"
                  : "text-dark-400 hover:text-dark-200 border border-transparent hover:border-dark-700"
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="divide-y divide-dark-800/50">
        {loading && (
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-dark-400">Loading latest news...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-4">
            <p className="text-sm text-dark-400">{error}</p>
          </div>
        )}

        {articles.length === 0 && !loading && !error && (
          <div className="p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-3">
              <Newspaper size={20} className="text-dark-500" />
            </div>
            <p className="text-sm text-dark-400">No news articles found</p>
          </div>
        )}

        {articles.map((article, index) => {
          const timeAgo = getTimeAgo(article.publishedAt);
          const CategoryIcon = CATEGORY_ICOLISTS[article.category] || Newspaper;

          return (
            <article
              key={`${article.title}-${article.publishedAt}`}
              className="p-4 hover:bg-dark-800/30 transition-colors group"
              style={{
                animationDelay: `${index * 60}ms`,
                animation: "fade-in-up 400ms ease both",
              }}
            >
              <div className="flex items-start gap-3">
                {/* Category badge */}
                <span
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${CATEGORY_COLORS[article.category]}`}
                  aria-label={`Category: ${article.category}`}
                >
                  {article.category === "carbon" && <Newspaper size={12} />}
                  {article.category === "policy" && <Newspaper size={12} className="text-amber-300" />}
                  {article.category === "technology" && <Sparkles size={12} />}
                  {article.category === "science" && <Newspaper size={12} />}
                  {article.category === "general" && <Newspaper size={12} />}
                </span>

                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h4 className="text-sm font-medium text-dark-100 leading-snug group-hover:text-green-400 transition-colors line-clamp-2">
                    {article.title}
                  </h4>

                  {/* Summary */}
                  <p className="text-xs text-dark-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-dark-500">
                      <Clock size={10} />
                      {timeAgo}
                    </span>
                    <span className="text-xs text-dark-500 truncate max-w-[120px]">
                      {article.source}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Read full article: ${article.title}`}
                    >
                      Read more
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// Category icon map
const CATEGORY_ICOLISTS: Record<string, typeof Newspaper> = {
  carbon: Newspaper,
  policy: Newspaper,
  technology: Sparkles,
  science: Newspaper,
  general: Newspaper,
};

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (86400000));
  const diffHours = Math.floor(diffMs / (3600000));
  const diffMinutes = Math.floor(diffMs / (60000));

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return `${diffMinutes}m ago`;
}

export default NewsPanel;
