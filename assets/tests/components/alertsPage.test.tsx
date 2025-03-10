import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import AlertsPage from "Components/AlertsPage";
import { renderWithScreenplayProvider } from "../utils/renderWithScreenplayProvider";

describe("Alerts Page", () => {
  describe("filtering", () => {
    test("filters places by mode and route", async () => {
      renderWithScreenplayProvider(<AlertsPage />);

      expect(await screen.findByTestId("1")).toBeInTheDocument();
      // Verify alerts not present on a screen are not visible
      expect(screen.queryByTestId("5")).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Blue Line" }));
      expect(await screen.findByTestId("3")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Red Line" }));
      expect(await screen.findByTestId("10")).toBeInTheDocument();
      expect(await screen.findByTestId("2")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Bus" }));
      expect(await screen.findByTestId("10")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All MODES" }));
      fireEvent.click(
        await screen.findByRole("button", { name: "Commuter Rail" }),
      );
      expect(await screen.findByTestId("9")).toBeInTheDocument();
    });

    test("filters places by screen type", async () => {
      renderWithScreenplayProvider(<AlertsPage />);

      fireEvent.click(screen.getByRole("button", { name: "All SCREEN TYPES" }));
      fireEvent.click(
        await screen.findByRole("button", { name: "Bus Shelter" }),
      );
      expect(await screen.findByTestId("4")).toBeInTheDocument();
      expect(await screen.findByTestId("6")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All SCREEN TYPES" }));
      fireEvent.click(await screen.findByRole("button", { name: "Pre-Fare" }));
      expect(await screen.findByTestId("2")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "All SCREEN TYPES" }));
      fireEvent.click(await screen.findByRole("button", { name: "PA ESS" }));
      expect(screen.queryAllByTestId("place-row")).toStrictEqual([]);
    });
  });
});
