import React from "react";
import { fireEvent, render } from "@testing-library/react";
import FilterDropdown from "../../js/components/Dashboard/FilterDropdown";

describe("Dashboard", () => {
  test("renders clear filter button if default is not selected", async () => {
    const list = ["item1", "item2", "item3"];
    const { getByTestId } = render(
      <FilterDropdown
        list={list}
        onSelect={() => null}
        selectedValue={list[1]}
      />
    );

    expect(getByTestId("filter-dropdown-clear-button")).toBeVisible();
  });

  test("renders default if clear button is clicked", async () => {
    const list = ["item1", "item2", "item3"];
    const onSelect = (newValue: any) => (selectedValue = newValue);
    let selectedValue = list[1];
    const { getByTestId, rerender, queryByTestId } = render(
      <FilterDropdown
        list={list}
        onSelect={onSelect}
        selectedValue={selectedValue}
      />
    );

    expect(getByTestId("filter-dropdown-clear-button")).toBeVisible();
    fireEvent.click(getByTestId("filter-dropdown-clear-button"));
    rerender(
      <FilterDropdown
        list={list}
        onSelect={onSelect}
        selectedValue={selectedValue}
      />
    );
    expect(queryByTestId("filter-dropdown-clear-button")).toBeNull();
    expect(getByTestId("filter-dropdown-button").firstChild?.textContent).toBe(
      list[0]
    );
  });
});
