import React, { useEffect } from 'react'
import { ComposeFunction, connect } from '../../connector/rx-js-connector'

type Props = {}

type ViewProps = {
  refreshToken: () => void
  isAuth: boolean
}

type ViewModelProps = {
  refreshToken: () => void
}

export const createRefreshTokenStream = ({
  refreshToken
}: ViewModelProps): ComposeFunction<Props, ViewModelProps> => {
  return () => {
    return {
      props: {
        refreshToken: refreshToken
      },
      effects: []
    }
  }
}

export const AppWithRefreshEffectView = ({ refreshToken }: ViewProps) => {
  useEffect(() => {
    refreshToken()
  }, [])
  return <></>
}

export const AppWithRefreshEffect = ({}: Props) => {
  const ConnectedComponent = connect(AppWithRefreshEffectView, 'refreshTokenStream')
  return <ConnectedComponent />
}
