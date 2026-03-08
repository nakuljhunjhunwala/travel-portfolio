export interface IndianState {
  name: string;
  code: string;
  visited: boolean;
  tripSlugs: string[];
}

export const visitedStates: Record<string, string[]> = {
  "Rajasthan": ["rajasthan-2024"],
  "Himachal Pradesh": ["spiti-2023", "mcleodganj-2024"],
  "Kerala": ["kerala-2024"],
};
