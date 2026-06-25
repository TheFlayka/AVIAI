export interface IBaseCompany {
  name: string
  yandexMapsUrl: string
}

export type UpdateCompanyObject = Partial<IBaseCompany>

export interface ICompany extends IBaseCompany {
  id: number
  ownerId: number
  createdAt: Date
}
