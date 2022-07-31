import { asClass, asFunction, AwilixContainer } from 'awilix'
import { createAxiosInstance } from '../apiService/create-axios-instance'
import { AuthService } from '../Auth/auth-service'
import { AuthState } from '../Auth/auth-state'

export enum dependencyNameEnum {
  apiService = 'apiService',
  authService = 'authService',
  authState = 'authState'
}

export function registerAwilixContainer(container: AwilixContainer) {
  container.register(
    dependencyNameEnum.apiService,
    asFunction(() => createAxiosInstance())
  )

  container.register(dependencyNameEnum.authService, asClass(AuthService))

  container.register(dependencyNameEnum.authState, asClass(AuthState))
}
