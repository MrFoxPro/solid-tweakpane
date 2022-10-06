import { createContext, FlowProps, onCleanup, splitProps, useContext } from 'solid-js'
import { Pane } from 'tweakpane'
import type { PaneConfig } from 'tweakpane/dist/types/pane/pane-config'
import type { Bindable, BladeApi } from '@tweakpane/core'
import { BladeRackApi } from '@tweakpane/core/dist/cjs/blade/common/api/blade-rack'

export type TWPBaseProps<T extends BladeApi<any> | BladeRackApi> = {
  ref?: (e: T) => void
}
const TWPRootContext = createContext<BladeRackApi>()
export const useTWPRoot = () => useContext(TWPRootContext)
export function TWPGroup(props: FlowProps<{ root: BladeRackApi }>) {
  return <TWPRootContext.Provider value={props.root}>{props.children}</TWPRootContext.Provider>
}

export function Tweakpane(props: FlowProps<PaneConfig>) {
  const [compProps, paneProps] = splitProps(props, ['children'])
  const pane = new Pane(paneProps)
  onCleanup(() => pane.dispose())
  return <TWPGroup root={pane}>{compProps.children}</TWPGroup>
}

const TWPBindGroupContext = createContext<Bindable>()
export const useTWPBingGroup = () => useContext(TWPBindGroupContext)
export function TWPBindGroup(props: FlowProps<{ target: Bindable }>) {
  return <TWPBindGroupContext.Provider value={props.target}>{props.children}</TWPBindGroupContext.Provider>
}
