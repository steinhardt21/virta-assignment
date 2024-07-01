import { z } from "zod"
import { prisma } from "../db"

export const CompanySchema = z.object({
  name: z.string(),
  parentId: z.string().optional()
})

export type Company = z.infer<typeof CompanySchema>

export const getCompanies = async (): Promise<Company[]> => {
  const parsedCompanies: Company[] = []
  const companies = await prisma.company.findMany()

  companies.forEach((company) => {
    parsedCompanies.push(CompanySchema.parse(company))
  })

  return parsedCompanies
}

export const createCompany = async ({ name, parentId }: Company): Promise<Company> => {
  if (parentId !== undefined) {
    const parentCompany = await prisma.company.findUnique({
      where: { id: parentId }
    })

    if (!parentCompany) {
      throw new Error("Parent company not found!")
    }
  }
  
  const newCompany = await prisma.company.create({
    data: {
      name: name,
      parentId: parentId
    }
  })

  return CompanySchema.parse(newCompany)
}