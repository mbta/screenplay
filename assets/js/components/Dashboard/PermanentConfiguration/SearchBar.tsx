import React, { ComponentType, useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

interface SearchItem {
  id: string;
  name: string;
}

interface SearchBarProps {
  items: SearchItem[];
  handleSearchResultClick: (item: SearchItem) => void;
}

const SearchBar: ComponentType<SearchBarProps> = ({
  items,
  handleSearchResultClick,
}: SearchBarProps) => {
  const [inputString, setInputString] = useState<string>("");

  const formatResult = (item: SearchItem) => {
    return (
      <span className="result-row body--regular">
        {item.name} · Station ID: {item.id}
      </span>
    );
  };

  const handleOnSearch = (searchString: string, _results: SearchItem[]) =>
    setInputString(searchString);

  const handleOnSelect = (item: SearchItem) => {
    setInputString("");
    handleSearchResultClick(item);
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
      onSearch={handleOnSearch}
      onSelect={handleOnSelect}
      inputSearchString={inputString}
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

export { SearchItem };
export default SearchBar;
