import "@testing-library/jest-dom/extend-expect";
import alerts from "./alerts.test.json";
import alertsOnScreens from "./alerts_on_screens.test.json";
import places from "./places_and_screens.test.json";

const allAPIAlertIds = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

beforeAll(() => {
  const app = document.createElement("div");
  app.id = "app";
  app.dataset.username = "test";
  document.body.appendChild(app);
});

let originalFetch: any;

beforeEach(() => {
  originalFetch = global.fetch;
  global.fetch = jest
    .fn()
    .mockReturnValueOnce(
      Promise.resolve({
        json: () =>
          Promise.resolve({
            all_alert_ids: allAPIAlertIds,
            alerts,
            screens_by_alert: alertsOnScreens,
          }),
      })
    )
    .mockReturnValueOnce(
      Promise.resolve({
        json: () => Promise.resolve(places),
      })
    );
});

afterEach(() => {
  global.fetch = originalFetch;
});
