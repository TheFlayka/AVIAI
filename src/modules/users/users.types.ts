export interface IUser {
  username: string
  password: string
}

export interface IRegisterUser extends IUser {
  name: string
  surname: string
}
