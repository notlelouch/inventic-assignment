import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import NewsCard from './components/NewsCard';
import SearchBar from './components/SearchBar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

// Define types for our news article data
export interface NewsArticle {
  title: string;
  link: string;
  snippet: string;
  imageUrl?: string;
  source?: string;
  date?: string;
}

type TimeFilterOption = 'all' | 'day' | 'week' | 'month' | 'year';

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all');
  
  // Debounce search function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Search articles function
  const searchArticles = useCallback(async (name: string, timeFrame: TimeFilterOption = 'all') => {
    if (!name.trim()) {
      setArticles([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const url = `/api/search?name=${encodeURIComponent(name)}${timeFrame !== 'all' ? `&timeframe=${timeFrame}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to search news articles');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to re-search when time filter changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchArticles(searchTerm, timeFilter);
    }
  }, [timeFilter, searchArticles, searchTerm]);

  // Debounced version of searchArticles
  const debouncedSearch = useCallback(
    debounce((term: string) => searchArticles(term, timeFilter), 500),
    [searchArticles, timeFilter]
  );

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchArticles(searchTerm, timeFilter);
  };

  // Handle time filter change
  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFilter(e.target.value as TimeFilterOption);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      
      <main className="flex-grow">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8 max-w-7xl">
          <div className="max-w-3xl mx-auto mb-6 md:mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 animate-fade-in">
              Find the latest news about anyone
            </h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Enter a person's name to discover recent news articles and stay informed about their latest activities.
            </p>
            
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={handleSearchChange} 
              onSubmit={handleSubmit} 
            />
            
            {searchTerm && (
              <div className="mt-4">
                <select
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Time</option>
                  <option value="day">Past 24 Hours</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
            )}
          </div>
          
          {isLoading && <LoadingSpinner />}
          
          {error && <ErrorMessage message={error} />}
          
          {!isLoading && !error && articles.length === 0 && searchTerm && (
            <div className="text-center text-slate-600 my-12 p-6 bg-white rounded-lg shadow-sm max-w-2xl mx-auto animate-fade-in">
              <svg className="h-12 w-12 mx-auto text-slate-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">No news articles found</p>
              <p className="text-slate-500 mt-1">We couldn't find any recent news about "{searchTerm}".</p>
              <p className="text-slate-500 mt-4 text-sm">Try searching for a different name or check your spelling.</p>
            </div>
          )}
          
          {!isLoading && articles.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-slate-800">
                  Results for "{searchTerm}"
                </h3>
                <p className="text-slate-500 text-sm">
                  {articles.length} articles found
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {articles.map((article, index) => (
                  <NewsCard 
                    key={index} 
                    article={article} 
                    className={`animate-slide-up`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} NewsSearch. Powered by Serper API.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;