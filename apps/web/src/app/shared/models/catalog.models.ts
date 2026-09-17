export interface Species {
  id: string;
  common_name: string;
  scientific_name: string;
  sensitivity: "EXACT" | "APPROXIMATE" | "HIDDEN";
  description?: string;
  habitat?: string;
  conservation_status?: string;
}
