import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto relative">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Enter a person's name (e.g., Elon Musk, Taylor Swift)"
          className="w-full px-12 py-4 text-slate-800 bg-white rounded-lg shadow-sm border border-slate-200 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          aria-label="Search for a person"
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-3 bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 
                   transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>
      <p className="text-sm text-slate-500 mt-3 text-center animate-fade-in">
        Enter a name to search for recent news articles
      </p>
    </form>
  );
};

export default SearchBar;