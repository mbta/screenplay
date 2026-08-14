/**
 * Helper function to decouple directly calling the browser's `location.reload`
 * API. This function exists so that it can be mocked by Jest, as `location`
 * cannot be mocked directly in newer versions of the library.
 */
export const reloadWindow = () => {
  window.location.reload();
};
