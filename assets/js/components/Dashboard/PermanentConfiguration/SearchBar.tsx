import React, { ComponentType } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

interface SearchItem {
  id: string;
  name: string;
}

interface SearchBarProps {
  items: SearchItem[];
}

const SearchBar: ComponentType<SearchBarProps> = ({
  items,
}: SearchBarProps) => {
  const formatResult = (item: SearchItem) => {
    return (
      <span className="result-row body--regular">
        {item.name} · Station ID: {item.id}
      </span>
    );
  };

  return (
    <ReactSearchAutocomplete
      formatResult={formatResult}
      fuseOptions={{
        keys: ["id", "name"],
        minMatchCharLength: 2,
      }}
      items={items}
      className="search-bar body--medium"
      showIcon={false}
      showClear={false}
      styling={{
        height: "38px",
        border: "none",
        backgroundColor: "#0F1417",
        hoverBackgroundColor: "#0F1417",
        color: "#F8F9FA",
        fontSize: "16px",
        fontFamily: "Inter",
      }}
    />
  );
};

export default SearchBar;
