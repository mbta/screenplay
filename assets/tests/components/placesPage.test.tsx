import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import PlacesPage from "Components/PlacesPage";
import { renderWithScreenplayProvider } from "../utils/renderWithScreenplayProvider";

describe("PlacesPage", () => {
  describe("filtering", () => {
    test("filters places by screen type", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      fireEvent.click(screen.getByRole("button", { name: "All SCREEN TYPES" }));
      fireEvent.click(await screen.findByRole("button", { name: "DUP" }));
      expect(await screen.findByText("Davis")).toBeInTheDocument();
      expect(screen.queryByText("ALEWIFE")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Columbus Ave @ Bray St"),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All SCREEN TYPES" }));
      fireEvent.click(await screen.findByRole("button", { name: "PA ESS" }));
      expect(await screen.findByText("Davis")).toBeInTheDocument();
      expect(screen.getByText("ALEWIFE")).toBeInTheDocument();
      expect(
        screen.queryByText("Columbus Ave @ Bray St"),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All SCREEN TYPES" }));
      fireEvent.click(
        await screen.findByRole("button", { name: "Bus Shelter" }),
      );
      expect(screen.queryByText("Davis")).not.toBeInTheDocument();
      expect(screen.queryByText("ALEWIFE")).not.toBeInTheDocument();
      expect(
        await screen.findByText("Columbus Ave @ Bray St"),
      ).toBeInTheDocument();
    });

    test("filters places by mode and route", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Blue Line" }));
      expect(await screen.findByText("WONDERLAND")).toBeInTheDocument();
      expect(screen.queryByText("ALEWIFE")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Columbus Ave @ Bray St"),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Red Line" }));
      expect(await screen.findByText("ALEWIFE")).toBeInTheDocument();
      expect(screen.queryByText("WONDERLAND")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Columbus Ave @ Bray St"),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Bus" }));
      expect(
        await screen.findByText("Columbus Ave @ Bray St"),
      ).toBeInTheDocument();
      expect(await screen.findByText("ALEWIFE")).toBeInTheDocument();
      expect(await screen.findByText("WONDERLAND")).toBeInTheDocument();
    });

    test("adds `filtered` class to PlaceRow when filtered", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Blue Line" }));
      expect(
        (await screen.findAllByTestId("place-row"))[0].className,
      ).toContain("filtered");
    });

    test("reset button clears filters", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Blue Line" }));
      fireEvent.click(
        screen.getByTestId("places-action-bar-reset-filters-button"),
      );
      expect(await screen.findByText("ALEWIFE")).toBeInTheDocument();
    });
  });

  describe("sorting", () => {
    test("sort label changes depending on filter selected", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      expect(screen.getByTestId("sort-label").textContent?.trim()).toBe("ABC");
      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Blue Line" }));
      expect(
        (await screen.findByTestId("sort-label")).textContent?.trim(),
      ).toBe("WESTBOUND");

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Red Line" }));
      expect(
        (await screen.findByTestId("sort-label")).textContent?.trim(),
      ).toBe("SOUTHBOUND");

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Bus" }));
      expect(
        (await screen.findByTestId("sort-label")).textContent?.trim(),
      ).toBe("ABC");
    });

    test("sort label changes when clicked", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      expect(screen.getByTestId("sort-label").textContent?.trim()).toBe("ABC");
      fireEvent.click(screen.getByTestId("sort-label"));
      expect(
        (await screen.findByTestId("sort-label")).textContent?.trim(),
      ).toBe("ZYX");

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Red Line" }));
      // When a mode or line is selected, sort direction resets to 0.
      // If not, we would have expected the label to still be that
      // of the "reverse" direction for the Red Line: "NORTHBOUND"
      expect(
        (await screen.findByTestId("sort-label")).textContent?.trim(),
      ).toBe("SOUTHBOUND");
      fireEvent.click(screen.getByTestId("sort-label"));
      expect(
        (await screen.findByTestId("sort-label")).textContent?.trim(),
      ).toBe("NORTHBOUND");

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Blue Line" }));
      fireEvent.click(screen.getByTestId("sort-label"));
      expect(
        (await screen.findByTestId("sort-label")).textContent?.trim(),
      ).toBe("EASTBOUND");
    });

    test("sort order changes for RL", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Red Line" }));
      expect(
        (await screen.findAllByTestId("place-name")).map(
          (placeName) => placeName.textContent,
        ),
      ).toStrictEqual(["ALEWIFE", "Davis", "Porter", "Park Street", "ASHMONT"]);

      fireEvent.click(screen.getByTestId("sort-label"));
      expect(
        (await screen.findAllByTestId("place-name")).map(
          (placeName) => placeName.textContent,
        ),
      ).toStrictEqual(["ASHMONT", "Park Street", "Porter", "Davis", "ALEWIFE"]);
    });

    test("sort order changes for OL", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(screen.getByRole("button", { name: "Orange Line" }));
      expect(
        (await screen.findAllByTestId("place-name")).map(
          (placeName) => placeName.textContent,
        ),
      ).toStrictEqual([
        "OAK GROVE",
        "Malden Center",
        "Wellington",
        "North Station",
        "Haymarket",
      ]);

      fireEvent.click(screen.getByTestId("sort-label"));
      expect(
        (await screen.findAllByTestId("place-name")).map(
          (placeName) => placeName.textContent,
        ),
      ).toStrictEqual([
        "Haymarket",
        "North Station",
        "Wellington",
        "Malden Center",
        "OAK GROVE",
      ]);
    });

    test("sort order changes for GL", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(screen.getByRole("button", { name: "Green Line" }));

      expect(
        (await screen.findAllByTestId("place-name")).map(
          (placeName) => placeName.textContent,
        ),
      ).toStrictEqual([
        "MEDFORD/TUFTS",
        "Ball Square",
        "Magoun Square",
        "Gilman Square",
        "East Somerville",
        "UNION SQUARE",
        "Lechmere",
        "Science Park/West End",
        "North Station",
        "Haymarket",
        "GOVERNMENT CENTER",
        "Park Street",
        "Boylston",
        "Blandford Street",
      ]);

      fireEvent.click(screen.getByTestId("sort-label"));
      expect(
        (await screen.findAllByTestId("place-name")).map(
          (placeName) => placeName.textContent,
        ),
      ).toStrictEqual([
        "Blandford Street",
        "Boylston",
        "Park Street",
        "GOVERNMENT CENTER",
        "Haymarket",
        "North Station",
        "Science Park/West End",
        "Lechmere",
        "UNION SQUARE",
        "East Somerville",
        "Gilman Square",
        "Magoun Square",
        "Ball Square",
        "MEDFORD/TUFTS",
      ]);
    });

    test("sort order changes for BL", async () => {
      renderWithScreenplayProvider(<PlacesPage />);

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(screen.getByRole("button", { name: "Blue Line" }));

      expect(
        (await screen.findAllByTestId("place-name")).map(
          (placeName) => placeName.textContent,
        ),
      ).toStrictEqual([
        "WONDERLAND",
        "Revere Beach",
        "Beachmont",
        "Government Center",
      ]);

      fireEvent.click(screen.getByTestId("sort-label"));
      expect(
        (await screen.findAllByTestId("place-name")).map(
          (placeName) => placeName.textContent,
        ),
      ).toStrictEqual([
        "Government Center",
        "Beachmont",
        "Revere Beach",
        "WONDERLAND",
      ]);
    });
  });
});
