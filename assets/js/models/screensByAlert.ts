type AlertID = string;
type ScreenID = string;

export interface ScreensByAlert {
  [id: AlertID]: ScreenID[];
}
