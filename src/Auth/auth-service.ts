import { ApiPost, IApi } from '../apiService/api-service'
import { AxiosResponse } from 'axios'

export type LoginCredentials = {
  readonly username: string
  readonly password: string
}

export type UserInfo = {
  readonly id: number
  readonly email: string
  readonly isSubscribed: boolean
  readonly firstName?: string
  readonly lastName?: string
  readonly phone?: string
}

type Tokens = {
  access_token: string
  refresh_token: string
}

export interface IAuthService {
  readonly login: (loginCredentials: LoginCredentials) => Promise<Tokens>
  readonly logout: () => void
  readonly getUser: () => Promise<UserInfo>
  readonly register: (loginCredentials: LoginCredentials) => Promise<Tokens>
  readonly refreshToken: () => Promise<Tokens>
}

export class AuthService implements IAuthService {
  post: ApiPost

  constructor(apiService: IApi) {
    this.post = apiService.post.bind(apiService)
  }

  login({ username, password }: LoginCredentials) {
    return this.post<Tokens, void, LoginCredentials>('auth/login', {
      username,
      password
    }).then((res) => res)
  }

  logout() {
    return this.post('auth/logout', {}).then((res) => res)
  }

  register({ username, password }: LoginCredentials) {
    return this.post<Tokens, void, LoginCredentials>('auth/register', {
      username,
      password
    }).then((res) => res)
  }

  refreshToken() {
    return this.post<AxiosResponse<Tokens>, void, undefined>('auth/refresh', undefined).then(
      (res) => res.data
    )
  }

  getUser() {
    return this.post<UserInfo, void, Record<string, never>>('me', {}).then((res) => res)
  }
}
