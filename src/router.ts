import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { getStations, getOneStation, createStation, deleteStation, updateStation, StationSchema } from "./handlers/station";
import { getCompanies, CompanySchema, createCompany } from "./handlers/company";
import { getStationsWithinRadiusForCompanyGrouped, SearchQuerySchema } from "./handlers/search";

const stationsApp = new Hono()
  .get('/', async (c) => {
    try {
      const stations = await getStations()
      return c.json({ data: stations }, 200)
    } catch (err) {
      return c.json(
        { error: 'Something went wrong.', err: JSON.stringify(err) },
        500
      )
    }
  })
  .get('/:id', zValidator("param", z.object({ id: z.string()})), async (c) => {
    const { id } = c.req.valid("param")
    try {
      const station = await getOneStation(id)
      return c.json({ data: station }, 200)
    } catch (err) {
      console.error(err)
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })
  .post('/', zValidator("json", StationSchema, (result, c) => {
    if (!result.success) {
      return c.text("Input payload is not correct. Be sure to insert in the body: name, companyId, latitude and longiture.", 400)
    }
    }), async (c) => {
    try {
      const validatedPayload =  c.req.valid("json")
      const newStation = await createStation({ ...validatedPayload })

      return c.json({ data: newStation }, 201)
    } catch (err) {
      console.error(err)
      if(err instanceof Error) {
        return c.json({ error: err.message }, 400)
      }
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })
  .delete('/:id', zValidator("param", z.object({ id: z.string()})), async (c) => {
    const { id } = c.req.valid("param")
    try {
      const station = await deleteStation(id)
      return c.json({ data: station }, 204)
    } catch (err) {
      console.error(err)
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })
  .put('/:id', zValidator("param", z.object({ id: z.string()})), zValidator("json", z.object({ name: z.string(), companyId: z.string() })), async (c) => {
    const { name, companyId } = c.req.valid("json")
    const { id } = c.req.valid("param")
    try {
      const station = await updateStation({ stationId: id, newNameStation: name, newCompanyId: companyId })
      return c.json({ data: station }, 200)
    } catch (err) {
      console.error(err)
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })

const companiesApp = new Hono()
  .get('/', async (c) => {
    try {
      const companies = await getCompanies()
      return c.json({ data: companies }, 200)
    } catch (err) {
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  
  })
  .post('/', zValidator("json", CompanySchema, async (result, c) => {
    if (!result.success) {
      return c.text("Input payload is not correct. Be sure to insert in the body: name, parentId.", 400)
    }
    }), async (c) => {
    try {
      const validatedPayload = c.req.valid("json")
      const newCompany = await createCompany({ ...validatedPayload })
      return c.json({ data: newCompany }, 201)
    } catch (err) {
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })

const searchApp = new Hono()
  .get('/', zValidator("query", SearchQuerySchema, (result, c) => {
    if (!result.success) {
      return c.text("Input payload is not correct. Be sure to insert in the params: radiusKilometers, companyId, latitude and longitude.", 400)
    }
  }), async (c) => {
    const { latitude, longitude, radiusKilometers, companyId } = c.req.valid("query")
    
    try {
      const stationsGroupedByLocations = await getStationsWithinRadiusForCompanyGrouped({ latitude, longitude, radiusKilometers, companyId })
      return c.json({ data: stationsGroupedByLocations }, 200)
    } catch (err) {

      console.error(err)
      if(err instanceof Error) {
        return c.json({ error: err.message }, 400)
      }

      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })

export { stationsApp, companiesApp, searchApp };
