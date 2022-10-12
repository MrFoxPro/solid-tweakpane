import {
  ParentProps,
  splitProps,
  onCleanup,
  VoidProps,
  JSX,
  FlowProps,
  createEffect,
  createContext,
  useContext,
  onMount,
} from 'solid-js'
import { Tweakpane, TWPBaseProps, TWPGroup, useTWPRoot } from './base'
import { FolderApi, FolderParams, TabParams, SeparatorParams } from 'tweakpane'
import type { ButtonApi, SeparatorApi, TabApi, TabPageParams } from '@tweakpane/core'
import type { BladeRackApi } from '@tweakpane/core/dist/cjs/blade/common/api/blade-rack'

type AvailableAPI = FolderApi | ButtonApi | TabApi | SeparatorApi
type TWPUIBaseProps = TWPBaseProps<AvailableAPI>
type TWPUIInitFn<TProps> = (root: BladeRackApi, props: TProps) => [AvailableAPI, JSX.Element?]

function createTWPUI<TInitProps, TProps extends TWPUIBaseProps = TInitProps & TWPUIBaseProps>(
  initFn: TWPUIInitFn<TProps>
) {
  return function (props: TProps) {
    const root = useTWPRoot()
    if (!root) throw new Error(`Use tweakpane controls within <${nameof(Tweakpane)}>`)
    const [comp, element] = initFn(root, props)
    onCleanup(() => {
      if (!comp) return
      comp.dispose()
      root.remove(comp)
    })
    props.ref?.(comp)
    if (element) return element
  }
}
export const TWPFolder = createTWPUI<ParentProps<FolderParams>>((root, props) => {
  const [compProps, folderProps] = splitProps(props, ['children'])
  const folder = root.addFolder(folderProps)
  return [folder, <TWPGroup root={folder}>{compProps.children}</TWPGroup>]
})

type TWPButtonProps = {
  onClick?: Parameters<ButtonApi['on']>[1]
} & FolderParams
export const TWPButton = createTWPUI<TWPButtonProps>((root, props) => {
  const button = root.addButton(props)
  props.onClick && button.on('click', props.onClick)
  createEffect(() => {
    button.title = props.title
  })
  return [button]
})

export const TWPSeparator = createTWPUI<VoidProps<SeparatorParams>>((root, props) => {
  const separator = root.addSeparator(props)
  return [separator]
})

const TabContext = createContext<TabApi>()
const useTab = () => useContext(TabContext)
export const TWPTab = createTWPUI<FlowProps<Omit<TabParams, 'pages'>>>((root, props) => {
  const [compProps, tabProps] = splitProps(props, ['children'])
  const tab = root.addTab({ ...tabProps, pages: [{ title: 'mock' }] })
  onMount(() => tab.removePage(0))
  return [tab, <TabContext.Provider value={tab}>{compProps.children}</TabContext.Provider>]
})

export function TWPTabPage(props: ParentProps<TabPageParams>) {
  const root = useTab()
  if (!root) throw new Error(`Parent for <${nameof(TWPTabPage)}> should be <${nameof(TWPTab)}>`)
  const [compProps, pageProps] = splitProps(props, ['children'])
  const page = root.addPage(pageProps)
  createEffect(() => (page.title = props.title))
  onCleanup(() => {
    root.removePage(root.pages.indexOf(page))
  })
  return <TWPGroup root={page}>{compProps.children}</TWPGroup>
}
