import { z } from "zod" 
import type { Station as StationModelDB } from "@prisma/client"
import { prisma } from "../db"

export const SearchQuerySchema = z.object({
  latitude: z.string(),
  longitude: z.string(),
  radiusKilometers: z.string(),
  companyId: z.string()
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>

type GroupedLocation = {
  latitude: string;
  longitude: string;
  stations: {
    id: string;
    name: string;
    companyId: string;
  }[];
};

export const getStationsWithinRadiusForCompanyGrouped = async (props: SearchQuery)  => {
  const stations = await prisma.station.findNearestStationsWithinRadiusForCompany(props)
  const groupedStations = groupStationsByLocation(stations)
  return groupedStations
}

/** Groups stations by their location (latitude, longitude) */
function groupStationsByLocation(stations: StationModelDB[]): GroupedLocation[] {
  const locationMap: Record<string, GroupedLocation> = {};

  stations.forEach((station) => {
    const key = `${station.latitude},${station.longitude}`;
    if (!locationMap[key]) {
      locationMap[key] = {
        latitude:  station.latitude.toString(),
        longitude: station.longitude.toString(),
        stations: []
      };
    }
    locationMap[key].stations.push({
      id: station.id,
      name: station.name,
      companyId: station.companyId
    });
  });

  return Object.values(locationMap);
}