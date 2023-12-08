import React, { ComponentType, useEffect, useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

interface SearchItem {
  id: string;
  name: string;
}

interface SearchBarProps {
  items: SearchItem[];
  selectedItems: string[];
  handleSearchResultClick: (item: SearchItem) => void;
}

const SearchBar: ComponentType<SearchBarProps> = ({
  items,
  selectedItems,
  handleSearchResultClick,
}: SearchBarProps) => {
  const [inputString, setInputString] = useState<string>();

  const formatResult = (item: SearchItem) => {
    return (
      <span className="result-row body--regular">
        {item.name} · Station ID: {item.id}
      </span>
    );
  };

  // When pressing enter on a result instead of clicking the result, inputString is not cleared properly.
  // As an item is selected, inputString will be set to the full name of the item.
  // As the parent state changes, check if the inputString is the full item name or id.
  // If it is, the item was just selected and the text box needs to be cleared.
  useEffect(() => {
    const item = items.find(
      (item) => item.id === inputString || item.name === inputString
    );
    if (item && selectedItems.includes(item.id)) {
      setInputString("");
    } else {
      setInputString(inputString);
    }
  }, [selectedItems]);

  const handleOnSearch = (searchString: string, results: SearchItem[]) => {
    const item = results.find(
      (item) => item.id === searchString || item.name === searchString
    );
    if (item && selectedItems.includes(item.id)) {
      setInputString("");
    } else {
      setInputString(searchString);
    }
  };

  const handleOnSelect = (item: SearchItem) => {
    handleSearchResultClick(item);
    setInputString("");
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
      placeholder="Enter Station ID or name"
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
