import React, { PropsWithChildren, useEffect, useState } from 'react'
import { combineLatest, map, merge, Observable, startWith, Subject, tap } from 'rxjs'
import { AwilixContainer } from 'awilix'
import { useDiInjectContainer } from "../DI-Inject-Context/di-inject-context";

type PropsOutput<VP> = {
  [K in keyof VP]: VP[K] | readonly [observable: Observable<VP[K]>, defaultValue: VP[K]]
}

export type ComposeFunctionOutput<VP extends {}> = {
  readonly props: PropsOutput<VP>
  readonly effects: readonly Observable<unknown>[]
}

export type ComposeFunction<P extends {}, VP extends {}> = (
  props$: Observable<P>
) => ComposeFunctionOutput<VP>

export function connect<
  P extends Partial<PropsWithChildren<{}>>,
  VP extends {},
  TypeDef extends Record<string, ComposeFunction<P, VP>>,
  K extends keyof TypeDef = keyof TypeDef
>(view: React.FC<VP>, controllerName: K): React.FC<P> {
  return (props) => {
    const [props$] = useState(() => new Subject<P>())
    const container = useDiInjectContainer()

    const [composeController] = useState(() =>
      (container as AwilixContainer<TypeDef>).resolve(controllerName)
    )

    const [out] = useState(() => composeController(props$))

    const [viewProps, setViewProps] = useState<VP>(() => {
      const keys = Object.keys(out.props) as (keyof VP)[]

      return keys.reduce<Partial<VP>>((vp, key) => {
        const value = out.props[key]
        const isObservableValue = Array.isArray(value) && value[0] instanceof Observable

        if (!isObservableValue) {
          return {
            ...vp,
            [key]: value
          }
        }

        const [, defaultValue] = value

        return {
          ...vp,
          [key]: defaultValue
        }
      }, {} as Partial<VP>) as VP
    })

    const [outStreams$] = useState(() => {
      const keys = Object.keys(out.props) as (keyof VP)[]
      const outStreams: readonly Observable<[string, unknown]>[] = keys.reduce((vp, key) => {
        const value = out.props[key]
        const isObservableValue = Array.isArray(value) && value[0] instanceof Observable

        if (isObservableValue) {
          return [
            ...vp,
            value[0].pipe(
              map((nextStreamValue) => [key, nextStreamValue]),
              startWith([key, value[1]])
            )
          ]
        }

        return vp
      }, [] as readonly Observable<[string, unknown]>[])

      return combineLatest(outStreams).pipe(
        map((values) =>
          values.reduce(
            (vp, [key, value]) => ({
              ...vp,
              [key]: value
            }),
            {} as Partial<VP>
          )
        ),
        tap((partialProps) => {
          setViewProps({ ...viewProps, ...partialProps })
        })
      )
    })

    useEffect(() => {
      const effectsStreams$ = merge(...Object.values(out.effects))

      const subscription = merge(effectsStreams$, outStreams$).subscribe()

      return () => subscription.unsubscribe()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [outStreams$])

    useEffect(() => {
      props$.next(props)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...Object.values(props)])

    return view({ ...viewProps, children: props.children })
  }
}
