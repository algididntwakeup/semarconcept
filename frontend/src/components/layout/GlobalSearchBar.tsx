// platform/frontend-mui/src/components/layout/GlobalSearchBar.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const GlobalSearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Handle search submission
  const handleSearchSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsFocused(false);
    }
  }, [searchTerm, navigate]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setIsFocused(false);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('global-search') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          setIsFocused(true);
        }
      }
      
      // Escape to blur search
      if (event.key === 'Escape' && isFocused) {
        const searchInput = document.getElementById('global-search') as HTMLInputElement;
        if (searchInput) {
          searchInput.blur();
          setIsFocused(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <form 
      onSubmit={handleSearchSubmit}
      className={`relative flex items-center bg-slate-100 rounded-full px-4 py-1.5 transition-all min-w-[200px] w-full max-w-sm mr-4 border ${isFocused ? 'bg-white border-primary-500 shadow-sm ring-2 ring-primary-500/20' : 'border-transparent hover:bg-slate-200'}`}
    >
      <Search className={`w-4 h-4 mr-2 ${isFocused ? 'text-primary-500' : 'text-slate-500'}`} />
      
      <input
        id="global-search"
        type="text"
        placeholder="Search (Ctrl+K)"
        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-500 py-1"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="off"
        spellCheck={false}
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="p-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Hidden submit button explicitly for forms standard behavior */}
      <button type="submit" className="hidden" aria-hidden="true" disabled={!searchTerm.trim()} />
    </form>
  );
};

export default GlobalSearchBar;