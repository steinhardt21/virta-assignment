import { z } from "zod"
import { prisma } from "../db"

export const StationSchema = z.object({
  name: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  companyId: z.string()
})

export type Station = z.infer<typeof StationSchema>

export const getStations = async (): Promise<Station[]> => {
    const parsedStations: Station[] = []
    const stations = await prisma.station.findMany()

    stations.forEach((station) => {
      parsedStations.push(StationSchema.parse(station))
    })
    
    return parsedStations
}

export const getOneStation = async (id: string): Promise<Station | null> => {
    const station = await prisma.station.findUnique({
      where: { id: id }
    })
    return StationSchema.parse(station)
}

export const createStation = async ({ name, latitude, longitude, companyId }: Station): Promise<Station> => {
  const newStation = await prisma.station.create({
    data: {
      name: name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      companyId: companyId
    }
  })
  return StationSchema.parse(newStation)
}

export const deleteStation = async (id: string): Promise<Station | null> => {
    const stationDeleted = await prisma.station.delete({
      where: { id: id }
    })

    return StationSchema.parse(stationDeleted)
}

export const updateStation = async ({stationId, newNameStation, newCompanyId}: { stationId: string, newNameStation?: string, newCompanyId?: string}): Promise<Station> => {
  const updatedStation = await prisma.station.update({
    where: { id: stationId },
    data: {
      name: newNameStation,
      companyId: newCompanyId
    }
  })

  return StationSchema.parse(updatedStation)
}