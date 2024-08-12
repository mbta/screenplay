export interface Screen {
  id: string;
  station_code?: string;
  type: string;
  zone?: string;
  disabled: boolean;
  label?: string;
  location?: string;
  hidden?: boolean;
  routes?: PaEssSignRoutes[];
}

type PaEssSignRoutes = { id: string; direction_id: 0 | 1 };
