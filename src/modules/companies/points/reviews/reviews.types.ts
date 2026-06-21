export interface IReview {
  id: number
  companyPointId: number
  usernameOfReviewer: string
  text: string
  rating: number
  createdAt: Date
  aiAnswer: string
}
