export const isPaMessageAdmin = (): boolean => {
  return !!document.querySelector("meta[name=is-pa-message-admin]");
};
