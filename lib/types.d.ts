export interface Entity {
  _: string;
  __: string[];
}

export interface EntityInstance extends Entity {
  id: string;
}
