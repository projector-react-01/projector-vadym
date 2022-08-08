import React, { FC } from 'react'
import { LoginCredentials } from '../../Auth/auth-state'
import { ComposeFunction, connect } from '../../connector/rx-js-connector'
import { Observable } from 'rxjs'

type ViewProps = {
  login: (creds: LoginCredentials) => void
  logout: () => void
  isAuth: boolean
}

type ViewModelProps = {
  isAuthenticated$: Observable<boolean>
  logout: () => void
  login: (creds: LoginCredentials) => void
}

type Props = {}

export function createAuthStream({
  isAuthenticated$,
  logout,
  login
}: ViewModelProps): ComposeFunction<Props, ViewProps> {
  return () => {
    return {
      props: {
        isAuth: [isAuthenticated$, false],
        login: login,
        logout: logout
      },
      effects: []
    }
  }
}

export const RegisterView: FC<ViewProps> = (props) => {
  const { isAuth, login, logout } = props
  return (
    <>
      <button
        onClick={() => {
          login({ username: 'test', password: 'test' })
        }}
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <h1>{isAuth ? 'Auth' : ' Not auth'}</h1>
      <h1>Tst</h1>
    </>
  )
}

export const Register: FC = ({}: Props) => {
  const Component = connect(RegisterView, 'authStream')
  return <Component />
}
