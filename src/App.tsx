import React from 'react'
import { createContainer, InjectionMode } from 'awilix'
import { Register } from './Pages/Register/register'
import { registerAwilixContainer } from './compostion-root/composition-root'
import { DiInjectProvider } from './DI-Inject-Context/di-inject-context'
import { AppWithRefreshEffect } from './components/app-with-refresh-effect/app-with-refresh-effect'

export const App: React.FC = () => {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC
  })
  registerAwilixContainer(container)
  return (
    <DiInjectProvider container={container}>
      <AppWithRefreshEffect />
      <Register />
    </DiInjectProvider>
  )
}
