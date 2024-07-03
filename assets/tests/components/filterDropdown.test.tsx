import React from "react";
import { fireEvent, render } from "@testing-library/react";
import FilterDropdown from "Components/FilterDropdown";

describe("FilterDropdown", () => {
  test("renders clear filter button if default is not selected", async () => {
    const list = [
      { label: "item1", ids: ["item1"] },
      { label: "item2", ids: ["item2"] },
      { label: "item3", ids: ["item3"] },
    ];
    const { getByTestId } = render(
      <FilterDropdown
        list={list}
        onSelect={() => null}
        selectedValue={list[1]}
        className="test"
      />,
    );

    expect(getByTestId("filter-dropdown-clear-button")).toBeVisible();
  });

  test("renders default if clear button is clicked", async () => {
    const list = [
      { label: "item1", ids: ["item1"] },
      { label: "item2", ids: ["item2"] },
      { label: "item3", ids: ["item3"] },
    ];
    const onSelect = (newValue: any) => {
      const selectedItem = list.find(({ label }) => label === newValue);
      if (selectedItem) {
        selectedValue = selectedItem;
      }
    };
    let selectedValue = list[1];
    const { getByTestId, rerender, queryByTestId } = render(
      <FilterDropdown
        list={list}
        onSelect={onSelect}
        selectedValue={selectedValue}
        className="test"
      />,
    );

    expect(getByTestId("filter-dropdown-clear-button")).toBeVisible();
    fireEvent.click(getByTestId("filter-dropdown-clear-button"));
    rerender(
      <FilterDropdown
        list={list}
        onSelect={onSelect}
        selectedValue={selectedValue}
        className="test"
      />,
    );
    expect(queryByTestId("filter-dropdown-clear-button")).toBeNull();
    expect(getByTestId("filter-dropdown-button").firstChild?.textContent).toBe(
      list[0].label,
    );
  });
});
