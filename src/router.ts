import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { getStations, getOneStation, createStation, deleteStation, updateStation, StationSchema } from "./handlers/station";
import { getCompanies, createCompany } from "./handlers/company";
import { getStationsWithinRadiusForCompany } from "./handlers/search";

const stationsApp = new Hono()
  .get('/', (c) => {
    try {
      const stations = getStations()
      return c.json({ data: stations }, 200)
    } catch (err) {
      return c.json(
        { error: 'Something went wrong.', err: JSON.stringify(err) },
        500
      )
    }
  })
  .get('/:id', zValidator("param", z.object({ id: z.string()})), (c) => {
    const { id } = c.req.valid("param")
    try {
      const station = getOneStation(id)
      return c.json({ data: station }, 200)
    } catch (err) {
      console.error(err)
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })
  .post('/', zValidator("json", StationSchema), (c) => {
    try {
      const validatedPayload =  c.req.valid("json")
      const newStation = createStation({ ...validatedPayload })

      return c.json({ data: newStation }, 201)
    } catch (err) {
      console.error(err)
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })
  .delete('/:id', zValidator("param", z.object({ id: z.string()})), (c) => {
    const { id } = c.req.valid("param")
    try {
      const station = deleteStation(id)
      return c.json({ data: station }, 204)
    } catch (err) {
      console.error(err)
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })
  .put('/:id', zValidator("param", z.object({ id: z.string()})), zValidator("json", z.object({ name: z.string(), companyId: z.string() })), (c) => {
    const { name, companyId } = c.req.valid("json")
    const { id } = c.req.valid("param")
    try {
      const station = updateStation({ stationId: id, newNameStation: name, newCompanyId: companyId })
      return c.json({ data: station }, 200)
    } catch (err) {
      console.error(err)
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })

const companiesApp = new Hono()
  .get('/', getCompanies)
  .post('/', createCompany)

const searchApp = new Hono()
  .get('/', getStationsWithinRadiusForCompany)

export { stationsApp, companiesApp, searchApp };
