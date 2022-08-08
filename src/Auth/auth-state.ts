import { scan, Subject, switchMap, map, merge, Observable } from 'rxjs'
import { IAuthService } from './auth-service'

export type LoginCredentials = {
  readonly username: string
  readonly password: string
}

export interface IAuthState {
  readonly login: (loginCredentials: LoginCredentials) => void
  readonly logout: () => void
  readonly register: (loginCredentials: LoginCredentials) => void
  readonly refreshToken: () => void
  readonly isAuthenticated$: Observable<boolean>
}

type State = {
  isAuthenticated: boolean
}

type Tokens = {
  access_token: string
  refresh_token: string
}

const initialAuthState: State = {
  isAuthenticated: false
}

enum AuthEvent {
  DidLoginRequestCompleted = 'DidLoginRequestCompleted',
  DidRegisterRequestCompleted = 'DidRegisterRequestCompleted',
  DidLogoutRequestCompleted = 'DidLogoutRequestCompleted',
  DidTokenRefreshRequestCompleted = 'DidTokenRefreshRequestCompleted'
}

const authActions = {
  DidRegisterRequestCompleted: (tokens: Tokens) =>
    ({
      type: AuthEvent.DidRegisterRequestCompleted,
      payload: { tokens }
    } as const),
  DidLoginRequestCompleted: (tokens: Tokens) =>
    ({
      type: AuthEvent.DidLoginRequestCompleted,
      payload: { tokens }
    } as const),
  DidLogoutRequestCompleted: () =>
    ({
      type: AuthEvent.DidLogoutRequestCompleted
    } as const),
  DidTokenRefreshRequestCompleted: (tokens: Tokens) => {
    return {
      type: AuthEvent.DidTokenRefreshRequestCompleted,
      payload: { tokens }
    } as const
  }
}

export class AuthState implements IAuthState {
  private onRegister$: Subject<LoginCredentials>

  private onLogin$: Subject<LoginCredentials>

  private onLogout$: Subject<void>

  private onRefreshToken$: Subject<void>

  private state$: Observable<State>

  private authService: IAuthService

  public isAuthenticated$: Observable<boolean>

  constructor(authService: IAuthService) {
    this.authService = authService
    this.login = this.login.bind(this)
    this.register = this.register.bind(this)
    this.refreshToken = this.refreshToken.bind(this)
    this.logout = this.logout.bind(this)
    this.onRegister$ = new Subject<LoginCredentials>()
    this.onLogin$ = new Subject<LoginCredentials>()
    this.onLogout$ = new Subject<void>()
    this.onRefreshToken$ = new Subject<void>()

    const registerResult$ = this.onRegister$.pipe(
      switchMap(async (creds: LoginCredentials) => this.authService.register(creds))
    )

    const loginResult$ = this.onLogin$.pipe(
      switchMap(async (creds: LoginCredentials) => this.authService.login(creds))
    )

    const logoutResult$ = this.onLogout$.pipe(switchMap(async () => this.authService.logout()))

    const refreshResult$ = this.onRefreshToken$.pipe(
      switchMap(async () => {
        return this.authService.refreshToken()
      })
    )

    this.state$ = merge(
      loginResult$.pipe(map(authActions.DidLoginRequestCompleted)),
      registerResult$.pipe(map(authActions.DidRegisterRequestCompleted)),
      logoutResult$.pipe(map(authActions.DidLogoutRequestCompleted)),
      refreshResult$.pipe(map(authActions.DidTokenRefreshRequestCompleted))
    ).pipe(
      scan((state, event) => {
        switch (event.type) {
          case AuthEvent.DidLoginRequestCompleted: {
            return {
              ...state,
              isAuthenticated: true
            }
          }
          case AuthEvent.DidRegisterRequestCompleted: {
            return {
              ...state,
              isAuthenticated: true
            }
          }
          case AuthEvent.DidTokenRefreshRequestCompleted: {
            const { tokens } = event.payload
            return {
              ...state,
              isAuthenticated: !!tokens?.access_token
            }
          }
          case AuthEvent.DidLogoutRequestCompleted: {
            return {
              ...state,
              isAuthenticated: false
            }
          }
          default: {
            return state
          }
        }
      }, initialAuthState)
    )

    this.isAuthenticated$ = this.state$.pipe(map(({ isAuthenticated }) => isAuthenticated))
  }

  public login(loginCredentials: LoginCredentials) {
    return this.onLogin$.next(loginCredentials)
  }

  public logout() {
    return this.onLogout$.next()
  }

  public register(creds: LoginCredentials) {
    return this.onRegister$.next(creds)
  }

  public refreshToken() {
    return this.onRefreshToken$.next()
  }
}
