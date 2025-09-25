import "@testing-library/jest-dom";
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

let originalConsoleError: any;
let originalFetch: any;

beforeEach(() => {
  // Suppress console.error during tests to reduce noise
  originalConsoleError = console.error;
  console.error = jest.fn();

  originalFetch = global.fetch;
  global.fetch = jest.fn(async (url) => {
    if (url === "/api/alerts") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            all_alert_ids: allAPIAlertIds,
            alerts,
            screens_by_alert: alertsOnScreens,
          }),
      });
    } else if (url === "/api/dashboard") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(places),
      });
    } else if (url === "/api/line_stops") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      });
    } else if (url === "/api/suppressed-predictions") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });
    } else {
      throw "Missing mock";
    }
  }) as jest.Mock;
});

afterEach(() => {
  global.fetch = originalFetch;
  console.error = originalConsoleError;
});
