import { asClass, asFunction, AwilixContainer } from 'awilix'
import { createAxiosInstance } from '../apiService/create-axios-instance'
import { AuthService } from '../Auth/auth-service'
import { AuthState } from '../Auth/auth-state'
import { createAuthStream } from '../Pages/Register/register'
import { createRefreshTokenStream } from '../components/app-with-refresh-effect/app-with-refresh-effect'

export enum dependencyNameEnum {
  apiService = 'apiService',
  authService = 'authService',
  authState = 'authState',
  authStream = 'authStream',
  refreshTokenStream = 'refreshTokenStream'
}

export function registerAwilixContainer(container: AwilixContainer) {
  container.register(
    dependencyNameEnum.apiService,
    asFunction(() => createAxiosInstance())
  )

  container.register(dependencyNameEnum.authService, asClass(AuthService))

  container.register(dependencyNameEnum.authState, asClass(AuthState))

  container.register(
    dependencyNameEnum.authStream,
    asFunction((authState) => {
      return createAuthStream(authState)
    })
  )

  container.register(
    dependencyNameEnum.refreshTokenStream,
    asFunction((authState) => {
      return createRefreshTokenStream(authState)
    })
  )
}
