import { prisma } from "../db"
import type { Context } from "hono"

type Task2 = {
  latitude: string
  longitude: string
  radius: string
  companyId: string
}

export const getStationsWithinRadiusForCompany = async (c: Context) => {
  const body: Task2 = await c.req.json()
  try {
    const stations = await prisma.station.findNearestStationsWithinRadiusForCompany(
      Number(body.latitude),
      Number(body.longitude),
      body.companyId,
      Number(body.radius))

    return c.json(stations, 200)
  } catch (err) {
    console.error(err)
    return c.json(
      { error: 'Something went wrong.', err: JSON.stringify(err) },
      { status: 500 }
    )
  }
}