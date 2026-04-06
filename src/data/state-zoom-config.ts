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
  "Jammu and Kashmir": {
    center: [75.5, 33.5],
    zoom: 3.5,
    cities: [
      { name: "Katra", coordinates: [74.93, 32.99] },
      { name: "Srinagar", coordinates: [74.79, 34.08] },
      { name: "Sonmarg", coordinates: [75.3, 34.3] },
      { name: "Gulmarg", coordinates: [74.38, 34.05] },
      { name: "Pahalgam", coordinates: [75.32, 34.01] },
      { name: "Patnitop", coordinates: [75.32, 33.09] },
    ],
  },
  Punjab: {
    center: [75.5, 31.0],
    zoom: 4.5,
    cities: [
      { name: "Amritsar", coordinates: [74.87, 31.63] },
    ],
  },
  Uttaranchal: {
    center: [79.0, 30.3],
    zoom: 4.0,
    cities: [
      { name: "Dehradun", coordinates: [78.03, 30.32] },
      { name: "Mussoorie", coordinates: [78.07, 30.46] },
      { name: "Rishikesh", coordinates: [78.27, 30.09] },
      { name: "Kedarkantha", coordinates: [78.13, 31.02] },
    ],
  },
  Rajasthan: {
    center: [73.8, 26.3],
    zoom: 3.5,
    cities: [
      { name: "Udaipur", coordinates: [73.71, 24.59] },
      { name: "Jaipur", coordinates: [75.79, 26.91] },
      { name: "Jhunjhunu", coordinates: [75.4, 28.13] },
    ],
  },
  Maharashtra: {
    center: [75.5, 19.5],
    zoom: 3.0,
    cities: [
      { name: "Alibaug", coordinates: [72.87, 18.64] },
      { name: "Nashik", coordinates: [73.79, 19.99] },
      { name: "Trimbakeshwar", coordinates: [73.53, 19.94] },
      { name: "Harishchandragad", coordinates: [73.78, 19.39] },
    ],
  },
  "Madhya Pradesh": {
    center: [78.0, 23.5],
    zoom: 3.5,
    cities: [
      { name: "Bhopal", coordinates: [77.41, 23.26] },
      { name: "Ujjain", coordinates: [75.77, 23.18] },
      { name: "Omkareshwar", coordinates: [76.15, 22.24] },
    ],
  },
  "Himachal Pradesh": {
    center: [77.4, 31.8],
    zoom: 4.0,
    cities: [
      { name: "Shimla", coordinates: [77.17, 31.1] },
      { name: "Kasol", coordinates: [77.32, 32.01] },
      { name: "Manali", coordinates: [77.19, 32.24] },
      { name: "Kaza", coordinates: [78.07, 32.23] },
      { name: "Sissu", coordinates: [77.12, 32.47] },
    ],
  },
  "Tamil Nadu": {
    center: [78.5, 11.0],
    zoom: 4.0,
    cities: [
      { name: "Coimbatore", coordinates: [76.96, 11.01] },
      { name: "Ooty", coordinates: [76.69, 11.41] },
    ],
  },
  Karnataka: {
    center: [76.5, 14.0],
    zoom: 3.5,
    cities: [
      { name: "Bangalore", coordinates: [77.59, 12.97] },
      { name: "Mysore", coordinates: [76.66, 12.3] },
      { name: "Coorg", coordinates: [75.74, 12.42] },
      { name: "Gokarna", coordinates: [74.32, 14.55] },
      { name: "Murudeshwar", coordinates: [74.49, 14.09] },
    ],
  },
  Gujarat: {
    center: [72.0, 22.5],
    zoom: 4.0,
    cities: [
      { name: "Ahmedabad", coordinates: [72.57, 23.02] },
    ],
  },
};
