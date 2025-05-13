const hasRoleMeta = (name: string): boolean =>
  !!document.querySelector(`meta[name=is-${name}]`);

export const isEmergencyAdmin = (): boolean => hasRoleMeta("emergency-admin");
export const isPaMessageAdmin = (): boolean => hasRoleMeta("pa-message-admin");
export const isScreensAdmin = (): boolean => hasRoleMeta("screens-admin");
export const isSuppressionAdmin = () => hasRoleMeta("suppression-admin");
