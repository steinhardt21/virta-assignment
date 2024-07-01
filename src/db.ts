import { PrismaClient } from '@prisma/client'
import { Station as StationModelDB } from '@prisma/client'
import { SearchQuery } from './handlers/search'

export const prisma = new PrismaClient().$extends({
  model: {
    station: {
      async findNearestStationsWithinRadiusForCompany({companyId, latitude, longitude, radiusKilometers}: SearchQuery): Promise<StationModelDB[]> {
        const result = await prisma.$queryRaw<
        StationModelDB[]
        > `
         WITH RECURSIVE company_hierarchy AS (
          SELECT id, name, parent-id
          FROM "Company"
          WHERE id = ${companyId}
          UNION ALL
          SELECT c.id, c.name, c.parent-id
          FROM "Company" c
          INNER JOIN company_hierarchy ch ON c.parent-id = ch.id
        )
        SELECT s.*, ROUND(earth_distance(ll_to_earth(${Number(latitude)},${Number(longitude)}), ll_to_earth(latitude, longitude))::NUMERIC, 2) AS distance
        FROM "Station" AS s
        JOIN company_hierarchy ch ON s.company_id = ch.id
        WHERE
        earth_box(ll_to_earth (${Number(latitude)},${Number(longitude)}), ${Number(radiusKilometers)}) @> ll_to_earth (latitude, longitude)
        AND earth_distance(ll_to_earth (${Number(latitude)},${Number(longitude)}), ll_to_earth (latitude, longitude)) < ${Number(radiusKilometers)}
        ORDER BY
        distance;`

        return result
      },
    },
  },
})