import { useState, useRef } from "react";
import "../../css/searchBar.css";

const searchIcon = "../assets/search.svg";

export default function SearchBar({ onSearch, placeholder = "Search drive" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
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
            onKeyDown={handleKeyDown}
            aria-label="Search input"
          />
        </div>
      </form>
    </div>
  );
}