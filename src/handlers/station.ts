import { prisma } from "../db"
import type { Context } from "hono"

type Station = {
  name: string
  latitude: string
  longitude: string
  companyId: string
}

export const getStations = async (c: Context ) => {
  try {
    const stations = await prisma.station.findMany()
    return c.json(stations, 200)
  } catch (err) {
    console.error(err)
    return c.json(
      { error: 'Something went wrong.', err: JSON.stringify(err) },
      { status: 500 }
    )
  }
}

export const getOneStation = async (c: Context) => {
  try {
    const stationId = c.req.param('id')
    const station = await prisma.station.findUnique({
      where: { id: stationId }
    })
    return c.json(station, 200)
  } catch (err) {
    console.error(err)
    return c.json(
      { error: 'Something went wrong.', err: JSON.stringify(err) },
      { status: 500 }
    )
  }
}

export const createStation = async (c: Context) => {
  const body: Station = await c.req.json()
  try {
    const newStation = await prisma.station.create({
      data: {
        name: body.name,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        companyId: body.companyId
      }
    })

    return c.json(
      { message: 'Success' },
      { status: 201 }
    )
  } catch (err) {
      
      console.error(err)
      return c.json(
        { error: 'Something went wrong.', err: JSON.stringify(err) },
        { status: 500 }
      )
  }
}

export const deleteStation = async (c: Context) => {
  try {
    const stationId = c.req.param('id')
    const stationDeleted = await prisma.station.delete({
      where: { id: stationId }
    })

    return c.json(
      { data: stationDeleted },
      { status: 204 }
    )
  } catch (err) {
    console.error(err)
    return c.json(
      { error: 'Something went wrong.', err: JSON.stringify(err) },
      { status: 500 }
    )
  }
}

export const updateStation = async (c: Context) => {
  const body: Station = await c.req.json()
  try {
    const stationId = c.req.param('id')
    const updatedStation = await prisma.station.update({
      where: { id: stationId },
      data: {
        name: body.name,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        companyId: body.companyId
      }
    })

    return c.json(
      { data: updatedStation },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return c.json(
      { error: 'Something went wrong.', err: JSON.stringify(err) },
      { status: 500 }
    )
  }
}