import { AwilixContainer } from 'awilix'
import React, { createContext, FC, ReactNode, useContext } from 'react'

export const DiInjectContext = createContext<AwilixContainer | undefined>(undefined)

type Props = {
  children: ReactNode
  container: AwilixContainer
}

export const DiInjectProvider: FC<Props> = ({ children, container }) => (
  <DiInjectContext.Provider value={container}>{children}</DiInjectContext.Provider>
)

export const useDiInjectContainer = () => {
  const value = useContext(DiInjectContext)

  if (!value) {
    throw new Error('Provice correct Inject Container')
  }

  return value
}
