export interface IBaseUser {
  username: string
  password: string
}

export interface IRegisterUser extends IBaseUser {
  name: string
  surname: string
}

export interface IUser extends IBaseUser {
  id: number
  name: string
  surname: string
  deletedAt: Date | null
  createdAt: Date
  passwordChangedAt: Date
  refreshToken: string | null
  cafes?: Array<{}> // TODO: add cafe type
}
