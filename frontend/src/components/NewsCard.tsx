import React from 'react';
import { NewsArticle } from '../App';

interface NewsCardProps {
  article: NewsArticle;
  className?: string;
  style?: React.CSSProperties;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, className = '', style }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col ${className}`}
      style={style}
    >
      {article.imageUrl && (
        <div className="h-40 overflow-hidden bg-slate-50">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              // Hide image on error
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-3 md:p-4 flex-grow flex flex-col">
        <h2 className="text-base md:text-lg font-semibold text-slate-800 mb-1 md:mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
          {article.title}
        </h2>
        
        <div className="flex items-center text-xs text-slate-500 mb-2">
          {article.source && (
            <span className="inline-flex items-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              {article.source}
            </span>
          )}
          
          {article.date && (
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {article.date}
            </span>
          )}
        </div>
        
        <p className="text-sm text-slate-600 mb-3 line-clamp-2 md:line-clamp-3 flex-grow">
          {article.snippet}
        </p>
        
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors group mt-auto"
        >
          Read full article
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default NewsCard;