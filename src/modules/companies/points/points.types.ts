export interface IPoint {
  id: number
  companyId: number
  yandexId: number
  name: string
  address: string
  lat: number
  lng: number
  workHours: string
  createdAt: Date
  deletedAt: Date | null
}
