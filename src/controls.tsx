import { createEffect, on, onCleanup, JSX, VoidProps } from 'solid-js'
import { Tweakpane, TWPBaseProps, TWPBindGroup, useTWPBingGroup, useTWPRoot } from './base'
import type { Bindable } from '@tweakpane/core'
import type { InputBindingApi, MonitorBindingApi, InputParams, MonitorParams } from 'tweakpane'
import type { BladeRackApi } from '@tweakpane/core/dist/cjs/blade/common/api/blade-rack'

type AvailableAPI = InputBindingApi<unknown, any> | MonitorBindingApi<any>
type TWPControlBaseProps = VoidProps &
   TWPBaseProps<AvailableAPI> & {
      target?: Bindable
      key?: string
      initialValue?: any
   }

type TWPControlFactory<TProps> = (
   root: BladeRackApi,
   binding: Bindable,
   props: TProps
) => [AvailableAPI, JSX.Element?]
function createTWPControl<TInitProps, TProps extends TWPControlBaseProps = TInitProps & TWPControlBaseProps>(
   initFn: TWPControlFactory<TProps>
) {
   return function (props: TProps) {
      const root = useTWPRoot()
      if (!root) throw new Error(`Use tweakpane controls within <${nameof(Tweakpane)}>`)
      let binding = props.target ?? useTWPBingGroup()
      if (!binding && props.key) {
         throw new Error(
            `In case of usage <TWPControl> with key, place it within <${nameof(
               TWPBindGroup
            )}> and provide taget`
         )
      }
      if (binding && !Object.hasOwn(binding, props.key)) {
         throw new Error(`There is no key ${props.key} in binding ${binding}`)
      }
      if (!binding && !props.key) {
         if (!props.initialValue) {
            throw new Error(
               `In case of usage <TWPControl> without target and key, provide ${nameof(
                  props.initialValue
               )} prop`
            )
         }
         binding = { value: props.initialValue }
         props.key = 'value'
      }
      const [comp, element] = initFn(root, binding, props)
      createEffect(
         on(
            () => binding[props.key],
            () => comp.refresh(),
            { defer: true }
         )
      )
      onCleanup(() => {
         if (!comp) return
         root.remove(comp)
         comp.dispose()
      })
      props.ref?.(comp)
      if (element) return element
   }
}

type TWPInputInputProps = {
   params?: InputParams
   onChange?: Parameters<InputBindingApi<unknown, string>['on']>[1]
}
export const TWPInput = createTWPControl<TWPInputInputProps>((root, binding, props) => {
   const input = root.addInput(binding, props.key, props.params)
   props.onChange && input.on('change', props.onChange)
   return [input]
})

type TWPMonitorProps = {
   params?: MonitorParams
   onUpdate?: Parameters<MonitorBindingApi<unknown>['on']>[1]
}
export const TWPMonitor = createTWPControl<TWPMonitorProps>((root, binding, props) => {
   const monitor = root.addMonitor(binding, props.key, props.params)
   props.onUpdate && monitor.on('update', props.onUpdate)
   return [monitor]
})
