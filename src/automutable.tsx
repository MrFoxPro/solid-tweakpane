import { Bindable } from "@tweakpane/core"
import { VoidProps, For, Switch, Match } from "solid-js"
import { TWPFolder } from "./ui"
import { TWPInput } from "./controls"

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
