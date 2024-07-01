import { PrismaClient } from '@prisma/client'
import { Station } from '@prisma/client'

export const prisma = new PrismaClient().$extends({
  model: {
    station: {
      async findNearestStationsWithinRadiusForCompany(latitude: number, longitude: number, companyId: string, radius: number) {
        const result = await prisma.$queryRaw<
        Station[]
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
        SELECT s.*, ROUND(earth_distance(ll_to_earth(${latitude},${longitude}), ll_to_earth(latitude, longitude))::NUMERIC, 2) AS distance
        FROM "Station" AS s
        JOIN company_hierarchy ch ON s.company_id = ch.id
        WHERE
        earth_box(ll_to_earth (${latitude},${longitude}), ${radius}) @> ll_to_earth (latitude, longitude)
        AND earth_distance(ll_to_earth (${latitude},${longitude}), ll_to_earth (latitude, longitude)) < ${radius}
        ORDER BY
        distance;`

        return result
      },
    },
  },
})