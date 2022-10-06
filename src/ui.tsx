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
import { TWPBaseProps, TWPGroup, useTWPRoot } from './base'
import { FolderApi, FolderParams, TabParams, SeparatorParams } from 'tweakpane'
import { BladeApi, ButtonApi, SeparatorApi, TabApi, TabPageApi, TabPageParams } from '@tweakpane/core'
import { BladeRackApi } from '@tweakpane/core/dist/cjs/blade/common/api/blade-rack'

type AvailableAPI = FolderApi | ButtonApi | TabApi | TabPageApi | SeparatorApi
type TWPUIBaseProps = TWPBaseProps<AvailableAPI>
type TWPUIInitFn<TProps> = (root: BladeRackApi, props: TProps) => [AvailableAPI, JSX.Element?]

function createTWPUI<TInitProps, TProps extends TWPUIBaseProps = TInitProps & TWPUIBaseProps>(
  initFn: TWPUIInitFn<TProps>
) {
  return function (props: TProps) {
    const root = useTWPRoot()
    if (!root) throw new Error('Use tweakpane controls within <Tweakpane>')
    const [comp, element] = initFn(root, props)
    onCleanup(() => {
      if (!comp) return
      if ('dispose' in comp) comp.dispose()
      if (comp instanceof BladeApi) root.remove(comp)
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

export const TWPButton = createTWPUI<VoidProps<FolderParams>>((root, props) => {
  const button = root.addButton(props)
  createEffect(() => {
    button.title = props.title
  })
  return [button]
})

const TabContext = createContext<TabApi>()
const useTab = () => useContext(TabContext)
export const TWPTab = createTWPUI<FlowProps<Omit<TabParams, 'pages'>>>((root, props) => {
  const [compProps, tabProps] = splitProps(props, ['children'])
  const tab = root.addTab({ ...tabProps, pages: [{ title: 'mock' }] })
  onMount(() => tab.removePage(0))
  return [tab, <TabContext.Provider value={tab}>{compProps.children}</TabContext.Provider>]
})

export const TWPTabPage = createTWPUI<ParentProps<TabPageParams>>((_, props) => {
  const root = useTab()
  if (!root) throw new Error('Parent for <TWPTabPage> should be <TWPTab>')
  const [compProps, pageProps] = splitProps(props, ['children'])
  const page = root.addPage(pageProps)
  createEffect(() => (page.title = props.title))
  onCleanup(() => root.removePage(root.pages.indexOf(page)))
  return [page, <TWPGroup root={page}>{compProps.children}</TWPGroup>]
})

export const TWPSeparator = createTWPUI<VoidProps<SeparatorParams>>((root, props) => {
  const separator = root.addSeparator(props)
  return [separator]
})
