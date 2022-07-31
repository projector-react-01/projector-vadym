import React, { JSXElementConstructor } from 'react'
import { useDiInjectContainer } from '../DI-Inject-Context/di-inject-context'

export function withDiInject<T>(Component: JSXElementConstructor<T>, dependencyName: string) {
  return function DiInjectWrap(injectedProps: any) {
    const container = useDiInjectContainer()
    const props = container.resolve(dependencyName)

    if (!props) {
      throw new Error(`${dependencyName} is not exist in DI container`)
    }

    return <Component {...{ ...props, ...injectedProps }} />
  }
}
