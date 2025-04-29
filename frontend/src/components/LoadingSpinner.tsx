import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-12 animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-slate-600">Searching for news articles...</p>
    </div>
  );
};

export default LoadingSpinner;