import React, { ComponentType, useEffect, useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

interface SearchItem {
  id: string;
  name: string;
}

interface PlacesSearchBarProps {
  places: SearchItem[];
  selectedItems: string[];
  handleSearchResultClick: (item: SearchItem) => void;
}

const PlacesSearchBar: ComponentType<PlacesSearchBarProps> = ({
  places,
  selectedItems,
  handleSearchResultClick,
}: PlacesSearchBarProps) => {
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
    const place = places.find(
      (place) => place.id === inputString || place.name === inputString
    );
    if (place && selectedItems.includes(place.id)) {
      setInputString("");
    } else {
      setInputString(inputString);
    }
  }, [selectedItems]);

  const handleOnSearch = (searchString: string, results: SearchItem[]) => {
    const place = results.find(
      (place) => place.id === searchString || place.name === searchString
    );
    if (place && selectedItems.includes(place.id)) {
      setInputString("");
    } else {
      setInputString(searchString);
    }
  };

  const handleOnSelect = (place: SearchItem) => {
    handleSearchResultClick(place);
    setInputString("");
  };

  return (
    <ReactSearchAutocomplete
      formatResult={formatResult}
      fuseOptions={{
        keys: ["id", "name"],
        minMatchCharLength: 2,
      }}
      items={places}
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
        placeholderColor: "#6C757D",
      }}
    />
  );
};

export { SearchItem };
export default PlacesSearchBar;
