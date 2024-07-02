import React from "react";
import PaessDetailContainer from "Components/PaessDetailContainer";
import { ScreenplayProvider } from "Hooks/useScreenplayContext";
import { render } from "@testing-library/react";
import { Screen } from "Models/screen";

beforeAll(() => {
  const app = document.createElement("div");
  app.id = "app";
  app.dataset.username = "test";
  document.body.appendChild(app);
});

describe("PaessDetailContainer", () => {
  test("Renders all columns", async () => {
    const screens: Screen[] = [
      {
        id: "test_mezzanine",
        station_code: "ABCD",
        type: "pa_ess",
        zone: "m",
        disabled: false,
      },
    ];

    const { getByTestId } = render(
      <ScreenplayProvider>
        <PaessDetailContainer screens={screens} />
      </ScreenplayProvider>,
    );

    expect(getByTestId("paess-col-left")).toBeVisible();
    expect(getByTestId("paess-col-center")).toBeVisible();
    expect(getByTestId("paess-col-right")).toBeVisible();
  });

  test("Label passed to screen", async () => {
    const screens: Screen[] = [
      {
        id: "test_mezzanine",
        station_code: "ABCD",
        type: "pa_ess",
        zone: "m",
        disabled: false,
        label: "Test Label",
      },
    ];

    const { getByText } = render(
      <ScreenplayProvider>
        <PaessDetailContainer screens={screens} />
      </ScreenplayProvider>,
    );

    expect(getByText("Test Label")).toBeInTheDocument();
  });
});
