import { z } from "zod"
import { prisma } from "../db"
import { Company as CompanyModelDB } from "@prisma/client"

export const CompanySchema = z.object({
  name: z.string(),
  parentId: z.string().optional()
})

export type Company = z.infer<typeof CompanySchema>

export const getCompanies = async (): Promise<CompanyModelDB[]> => {
  const companies = await prisma.company.findMany()
  return companies
}

export const createCompany = async ({ name, parentId }: Company): Promise<CompanyModelDB> => {
  if (parentId !== undefined) {
    const parentCompany = await prisma.company.findUnique({
      where: { id: parentId }
    })

    if (!parentCompany) {
      throw new Error("Parent company not found!")
    }
  }
  console.log("name", name)
  console.log("parentId", parentId)
  const newCompany = await prisma.company.create({
    data: {
      name: name,
      parentId: parentId !== undefined ? parentId : null
    }
  })

  console.log("newCompany", newCompany)

  return newCompany
}