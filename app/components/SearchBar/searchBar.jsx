import { useState, useRef, useEffect } from "react";
import "../../css/searchBar.css";

const searchIcon = "../assets/search.svg";

export default function SearchBar({ onSearch, placeholder = "Search drive", onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          searchQuery: query,
          requestType: 'search_files'
        })
      };
      
      const response = await fetch('/databaseApi', options);
      const data = await response.json();
      setSuggestions(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(value);
      }, 300); // Debounce delay
      return () => clearTimeout(timeoutId);
    } else {
      setShowDropdown(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.metadata.name);
    onSearch(suggestion.metadata.name);
    if (suggestion.parent && suggestion.parent.id) {
      onNavigate(suggestion.parent.id);
    }
    setShowDropdown(false);
  };

  return (
    <div className="search-bar-wrapper">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <img
            className="search-icon"
            src={searchIcon}
            alt="search icon"
          />
          <input
            ref={searchInputRef}
            className="search-input"
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            aria-label="Search input"
          />
          {showDropdown && (
            <div
              className="search-dropdown"
              ref={dropdownRef}
              aria-label="Search suggestions"
            >
              <div className="search-dropdown-content">
                {isLoading ? (
                  <div className="search-suggestion loading">Loading...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id || index}
                      className="search-suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span>{suggestion.metadata.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="search-suggestion no-results">No results found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}