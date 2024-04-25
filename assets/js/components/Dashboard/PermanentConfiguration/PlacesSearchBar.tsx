/* eslint-disable jsx-a11y/no-autofocus */
import React, { ComponentType, useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

interface SearchItem {
  id: string;
  name: string;
}

interface PlacesSearchBarProps {
  places: SearchItem[];
  handleSearchResultClick: (item: SearchItem) => void;
}

const PlacesSearchBar: ComponentType<PlacesSearchBarProps> = ({
  places,
  handleSearchResultClick,
}: PlacesSearchBarProps) => {
  // When selecting an item, the text in the input is not cleared properly.
  // This is likely due to a bug in the package.
  // To resolve this, we can force a rerender of the component so it resets to default.
  const [reset, setReset] = useState<number>(-1);

  const formatResult = (item: SearchItem) => {
    return (
      <span className="result-row body--regular">
        {item.name} · Station ID: {item.id}
      </span>
    );
  };

  const handleOnSelect = (place: SearchItem) => {
    handleSearchResultClick(place);
    setReset(1 - reset);
  };

  return (
    <ReactSearchAutocomplete
      autoFocus
      key={reset}
      formatResult={formatResult}
      fuseOptions={{
        keys: ["id", "name"],
        minMatchCharLength: 3,
      }}
      items={places}
      className="search-bar body--medium"
      showIcon={false}
      showClear={false}
      onSelect={handleOnSelect}
      placeholder="Enter Station ID or name"
      showNoResults={false}
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
