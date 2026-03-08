export interface CityPin {
  name: string;
  coordinates: [number, number]; // [lon, lat]
}

export interface StateZoomEntry {
  center: [number, number]; // [lon, lat]
  zoom: number;
  cities: CityPin[];
}

export const stateZoomConfig: Record<string, StateZoomEntry> = {
  Rajasthan: {
    center: [73.8, 26.3],
    zoom: 3.5,
    cities: [
      { name: "Jaipur", coordinates: [75.79, 26.91] },
      { name: "Jodhpur", coordinates: [73.02, 26.24] },
      { name: "Jaisalmer", coordinates: [70.91, 26.92] },
      { name: "Udaipur", coordinates: [73.71, 24.59] },
    ],
  },
  "Himachal Pradesh": {
    center: [77.4, 31.8],
    zoom: 5.0,
    cities: [
      { name: "Manali", coordinates: [77.19, 32.24] },
      { name: "Kasol", coordinates: [77.32, 32.01] },
      { name: "Tosh", coordinates: [77.45, 32.05] },
      { name: "Kheerganga", coordinates: [77.49, 32.03] },
    ],
  },
  Kerala: {
    center: [76.3, 10.2],
    zoom: 5.5,
    cities: [
      { name: "Kochi", coordinates: [76.27, 9.93] },
      { name: "Alleppey", coordinates: [76.34, 9.5] },
      { name: "Munnar", coordinates: [77.06, 10.09] },
      { name: "Varkala", coordinates: [76.72, 8.74] },
    ],
  },
};
