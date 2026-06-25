export interface IReview {
  id: number
  companyPointId: number
  reviewerName: string
  content: string
  rating: number
  createdAt: Date
  aiAnswer: string
}
