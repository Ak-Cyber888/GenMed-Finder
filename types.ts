
export interface Store {
  name: string;
  city: string;
  state: string;
  address: string;
}

export interface Composition {
  ingredient: string;
  strength: string;
}

export interface MedicineInfo {
  brandName: string;
  genericName: string;
  publicName: string;
  composition: Composition[];
  dosage: string;
  timing: string;
  brandPrice: string;
  genericPrice: string;
  availableAt: Store[];
}