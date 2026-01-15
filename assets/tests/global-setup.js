module.exports = async () => {
  // Run jest in the Eastern timezone
  process.env.TZ = "America/New_York";
};
