import { z } from "zod"
import { prisma } from "../db"
import { Station as StationModelDB } from "@prisma/client"

export const StationSchema = z.object({
  name: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  companyId: z.string()
})

export type Station = z.infer<typeof StationSchema>

export const getStations = async (): Promise<StationModelDB[]> => {
    const stations = await prisma.station.findMany()
    return stations
}

export const getOneStation = async (id: string): Promise<StationModelDB | null> => {
    const station = await prisma.station.findUnique({
      where: { id: id }
    })

    if (!station) {
      return null
    }

    return station
}

export const createStation = async ({ name, latitude, longitude, companyId }: Station): Promise<StationModelDB> => {
  
  const companyOwner = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!companyOwner) {
    throw new Error("Company not found! Insert correct companyId.")
  }

  const newStation = await prisma.station.create({
    data: {
      name: name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      companyId: companyId
    }
  })

  return newStation
}

export const deleteStation = async (id: string): Promise<StationModelDB | null> => {
    const stationDeleted = await prisma.station.delete({
      where: { id: id }
    })

    if (!stationDeleted) {
      return null
    }

    return stationDeleted
}

export const updateStation = async ({stationId, newNameStation, newCompanyId}: { stationId: string, newNameStation?: string, newCompanyId?: string}): Promise<StationModelDB> => {
  const updatedStation = await prisma.station.update({
    where: { id: stationId },
    data: {
      name: newNameStation,
      companyId: newCompanyId
    }
  })

  return updatedStation
}