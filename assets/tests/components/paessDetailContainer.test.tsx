import React from "react";
import PaessDetailContainer from "../../js/components/Dashboard/PaessDetailContainer";
import { render } from "@testing-library/react";
import { Screen } from "../../js/models/screen";

beforeAll(() => {
  const app = document.createElement("div");
  app.id = "app";
  app.dataset.username = "test";
  document.body.appendChild(app);
});

describe("PaessDetailContainer", () => {
  test("Renders screens in columns", async () => {
    const screens: Screen[] = [
      {
        id: "test_mezzanine",
        station_code: "ABCD",
        type: "pa_ess",
        zone: "m",
        disabled: false,
      },
      {
        id: "test_northbound",
        station_code: "ABCD",
        type: "pa_ess",
        zone: "n",
        disabled: false,
      },
      {
        id: "test_southbound",
        station_code: "ABCD",
        type: "pa_ess",
        zone: "s",
        disabled: false,
      },
    ];

    const { getByTestId } = render(<PaessDetailContainer screens={screens} />);

    expect(getByTestId("paess-col-left")).toBeVisible();
    expect(getByTestId("paess-col-center")).toBeVisible();
    expect(getByTestId("paess-col-right")).toBeVisible();
  });

  test("Renders only one column", async () => {
    const screens: Screen[] = [
      {
        id: "test_mezzanine",
        station_code: "ABCD",
        type: "pa_ess",
        zone: "m",
        disabled: false,
      },
    ];

    const { getByTestId, queryByTestId } = render(
      <PaessDetailContainer screens={screens} />
    );

    expect(queryByTestId("paess-col-left")).toBeNull();
    expect(queryByTestId("paess-col-right")).toBeNull();
    expect(getByTestId("paess-col-center")).toBeVisible();
  });
});
