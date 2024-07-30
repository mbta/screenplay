export interface Screen {
  id: string;
  station_code?: string;
  type: string;
  zone?: string;
  disabled: boolean;
  label?: string;
  location?: string;
  hidden?: boolean;
  route_ids?: string[];
}
