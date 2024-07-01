import { prisma } from "../db"
import type { Context } from "hono"

type Company = {
  name: string
  parentCompanyID?: string
}

export const getCompanies = async (c: Context) => {
  try {
    const companies = await prisma.company.findMany()
    return c.json(companies, 200)
  } catch (err) {
    console.error(err)
    return c.json(
      { error: 'Something went wrong.', err: JSON.stringify(err) },
      { status: 500 }
    )
  }
}

export const createCompany = async (c: Context) => {

  if (c.req.header('Content-Type') !== 'application/json') {
    return c.json({ error: 'JSON body expected.' }, { status: 406 })
  }

  const body: Company = await c.req.json()

  try {
    const parentCompany = body.parentCompanyID ? body.parentCompanyID : null

    await prisma.company.create({
      data: {
        name: body.name,
        parentId: parentCompany
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