import {
  createContext,
  createEffect,
  FlowProps,
  For,
  Match,
  on,
  onCleanup,
  ParentProps,
  splitProps,
  Switch,
  useContext,
  VoidProps,
} from 'solid-js'
import { Pane } from 'tweakpane'
import type {
  TabParams,
  SeparatorParams,
  InputParams,
  MonitorParams,
  ButtonParams,
  FolderParams,
  FolderApi,
  InputBindingApi,
  MonitorBindingApi,
} from 'tweakpane'
import type { PaneConfig } from 'tweakpane/dist/types/pane/pane-config'

const TWPRootContext = createContext<FolderApi>()
const useTWPRoot = () => useContext(TWPRootContext)
export function TWPGroup(props: FlowProps<{ root: FolderApi }>) {
  return <TWPRootContext.Provider value={props.root}>{props.children}</TWPRootContext.Provider>
}
export function Tweakpane(props: FlowProps<PaneConfig>) {
  const [compProps, paneProps] = splitProps(props, ['children'])
  const pane = new Pane(paneProps)
  onCleanup(() => pane.dispose())
  return <TWPGroup root={pane}>{compProps.children}</TWPGroup>
}
type Bindable = Record<string, any>
const TWPBindGroupContext = createContext<Bindable>()
const useTWPBingGroup = () => useContext(TWPBindGroupContext)
export function TWPBindGroup(props: FlowProps<{ target: Bindable }>) {
  return <TWPBindGroupContext.Provider value={props.target}>{props.children}</TWPBindGroupContext.Provider>
}

export function TWPFolder(props: ParentProps<FolderParams>) {
  const [compProps, folderProps] = splitProps(props, ['children'])
  const root = useTWPRoot()
  const folder = root.addFolder(folderProps)
  onCleanup(() => folder?.dispose())
  return <TWPGroup root={folder}>{compProps.children}</TWPGroup>
}

export function TWPButton(props: VoidProps<ButtonParams>) {
  const root = useTWPRoot()
  const button = root.addButton(props)
  onCleanup(() => button?.dispose())
}
export function TWPTab(props: VoidProps<TabParams>) {
  const root = useTWPRoot()
  const tab = root.addTab(props)
  onCleanup(() => tab?.dispose())
}
export function TWPSeparator(props: VoidProps<SeparatorParams>) {
  const root = useTWPRoot()
  const tab = root.addSeparator(props)
  onCleanup(() => tab?.dispose())
}

type TWPBaseProps = {
  ref?: (e: InputBindingApi<unknown, any> | MonitorBindingApi<unknown>) => void
  target?: Bindable
  key: string
}

type TwCompInitFn<TInitProps> = (
  root: FolderApi,
  binding: Bindable,
  props: TInitProps & TWPBaseProps
) => InputBindingApi<unknown, any> | MonitorBindingApi<unknown>
function createTWPControl<TInitProps>(initFn: TwCompInitFn<TInitProps>) {
  return function (props: ParentProps<TInitProps & TWPBaseProps>) {
    const pane = useTWPRoot()
    if (!pane) throw new Error('Use tweakpane controls within <Tweakpane>')
    const binding = props.target ?? useTWPBingGroup()
    if (!binding) throw new Error('Use tweakpane controls within <TweakpaneBindGroup>')
    if (!Object.hasOwn(binding, props.key)) {
      throw new Error(`There is no key ${props.key} in binding ${binding}`)
    }
    const comp = initFn(pane, binding, props)
    createEffect(
      on(
        () => binding[props.key],
        () => comp.refresh(),
        { defer: true }
      )
    )
    onCleanup(() => comp?.dispose())
    props.ref?.(comp)
    return props.children
  }
}

type TWPInputInputProps = {
  params?: InputParams
  onChange?: Parameters<InputBindingApi<unknown, string>['on']>[1]
}
export const TWPInput = createTWPControl<TWPInputInputProps>((root, binding, props) => {
  const input = root.addInput(binding, props.key, props.params)
  props.onChange && input.on('change', props.onChange)
  return input
})

type TWPMonitorProps = {
  params?: MonitorParams
  onUpdate?: Parameters<MonitorBindingApi<unknown>['on']>[1]
}
export const TWPMonitor = createTWPControl<TWPMonitorProps>((root, binding, props) => {
  const monitor = root.addMonitor(binding, props.key, props.params)
  props.onUpdate && monitor.on('update', props.onUpdate)
  return monitor
})

export function TWPAutoMutable(props: VoidProps<{ target: Bindable }>) {
  return (
    <For each={Object.keys(props.target)}>
      {(key) => (
        <Switch fallback={<TWPInput key={key} target={props.target} />}>
          <Match when={props.target[key].constructor === Object}>
            <TWPFolder title={key}>
              <TWPAutoMutable target={props.target[key]} />
            </TWPFolder>
          </Match>
        </Switch>
      )}
    </For>
  )
}
