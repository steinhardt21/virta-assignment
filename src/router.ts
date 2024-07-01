import { Hono } from "hono";

import { getStations, getOneStation, createStation, deleteStation, updateStation } from "./handlers/station";
import { getCompanies, createCompany } from "./handlers/company";
import { getStationsWithinRadiusForCompany } from "./handlers/search";

const stationsApp = new Hono()
  .get('/', getStations)
  .get('/:id', getOneStation)
  .post('/', createStation)
  .delete('/:id', deleteStation)
  .put('/:id', updateStation)

const companiesApp = new Hono()
  .get('/', getCompanies)
  .post('/', createCompany)

const searchApp = new Hono()
  .get('/', getStationsWithinRadiusForCompany)

export { stationsApp, companiesApp, searchApp };
