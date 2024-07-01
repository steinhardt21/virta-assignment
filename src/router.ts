import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { getStations, getOneStation, createStation, deleteStation, updateStation, StationSchema } from "./handlers/station";
import { getCompanies, CompanySchema, createCompany } from "./handlers/company";
import { getStationsWithinRadiusForCompanyGrouped, SearchQuerySchema } from "./handlers/search";

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
  .post('/', zValidator("json", StationSchema, (result, c) => {
    if (!result.success) {
      return c.text("Input payload is not correct. Be sure to insert in the body: name, companyId, latitude and longiture.", 400)
    }
    }), (c) => {
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
  .get('/', (c) => {
    try {
      const companies = getCompanies()
      return c.json({ data: companies }, 200)
    } catch (err) {
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  
  })
  .post('/', zValidator("json", CompanySchema, (result, c) => {
    if (!result.success) {
      return c.text("Input payload is not correct. Be sure to insert in the body: name, parentId.", 400)
    }
    }), (c) => {
    try {
      const validatedPayload = c.req.valid("json")
      const newCompany = createCompany({ ...validatedPayload })
      return c.json({ data: newCompany }, 201)
    } catch (err) {
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })

const searchApp = new Hono()
  .get('/', zValidator('json', SearchQuerySchema, (result, c) => {
    if (!result.success) {
      return c.text("Input payload is not correct. Be sure to insert in the body: radiusKilometers, companyId, latitude and longiture.", 400)
    }
    }), (c) => {
    const { latitude, longitude, radiusKilometers, companyId } = c.req.valid("json")
    
    try {
      const stationsGroupedByLocations = getStationsWithinRadiusForCompanyGrouped({ latitude, longitude, radiusKilometers, companyId })
      return c.json({ data: stationsGroupedByLocations }, 200)
    } catch (err) {
      return c.json({ error: 'Something went wrong.', err: JSON.stringify(err) }, 500)
    }
  })

export { stationsApp, companiesApp, searchApp };
