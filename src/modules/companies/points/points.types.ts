export interface IPoint {
  id: number
  companyId: number
  yandexId: number
  name: string
  address: string
  createdAt: Date
  deletedAt: Date | null
  lastParseAt: Date | null
}
