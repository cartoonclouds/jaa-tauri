import { faker } from "@faker-js/faker";

export interface LondonLocationSeed {
  locationText: string;
  locationLat: number;
  locationLng: number;
}

const GREATER_LONDON_AREAS = [
  "London",
  "City of London",
  "Barking and Dagenham",
  "Barnet",
  "Bexley",
  "Brent",
  "Bromley",
  "Camden",
  "Croydon",
  "Ealing",
  "Enfield",
  "Greenwich",
  "Hackney",
  "Hammersmith and Fulham",
  "Haringey",
  "Harrow",
  "Havering",
  "Hillingdon",
  "Hounslow",
  "Islington",
  "Kensington and Chelsea",
  "Kingston upon Thames",
  "Lambeth",
  "Lewisham",
  "Merton",
  "Newham",
  "Redbridge",
  "Richmond upon Thames",
  "Southwark",
  "Sutton",
  "Tower Hamlets",
  "Waltham Forest",
  "Wandsworth",
  "Westminster",
] as const;

const LONDON_COORDINATE_BOUNDS = {
  lat: { min: 51.2868, max: 51.6919 },
  lng: { min: -0.5103, max: 0.334 },
} as const;

export function createLondonLocationSeed(): LondonLocationSeed {
  return {
    locationText: faker.helpers.arrayElement(GREATER_LONDON_AREAS),
    locationLat: faker.number.float({
      min: LONDON_COORDINATE_BOUNDS.lat.min,
      max: LONDON_COORDINATE_BOUNDS.lat.max,
      fractionDigits: 6,
    }),
    locationLng: faker.number.float({
      min: LONDON_COORDINATE_BOUNDS.lng.min,
      max: LONDON_COORDINATE_BOUNDS.lng.max,
      fractionDigits: 6,
    }),
  };
}

export function createPreferredLondonLocations(count = 2): string[] {
  return faker.helpers.uniqueArray(
    () => faker.helpers.arrayElement(GREATER_LONDON_AREAS),
    count,
  );
}
