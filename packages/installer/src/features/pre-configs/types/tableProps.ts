import { BuildingDTO } from ".";

export interface BuildingItem extends BuildingDTO {
  floors: any[];
  validity: string;
}

