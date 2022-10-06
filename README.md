# Solid components for [Tweakpane](https://cocopon.github.io/tweakpane/)

`pnpm i -S solid-tweakpane solid-js`

Currently it can be used with mutable.
Example:

```tsx
const settings = createMutable({
    bool: false,
    current: 0.01,
    folder1: {
        bool: true,
        folder11: {
        number: 2,
        color: '#f05',
        },
    },
})
<Tweakpane title="Settings" expanded>
    <TWPBindGroup target={settings}>
        <TWPInput
            params={{
                label: 'test',
            }}
            key="bool"
            onChange={(e) => console.log('changed value test', e.value)}
        />
        <TWPButton title={'Title can be reactive too!'} />
        <TWPSeparator />
        <TWPTab>
            <TWPTabPage title="page1">
                <TWPBindGroup target={settings.folder1}>
                <TWPInput key="bool" />
                </TWPBindGroup>
            </TWPTabPage>
            <TWPTabPage title="page2">
                <TWPBindGroup target={settings.folder1.folder11}>
                <TWPInput key="color" />
                </TWPBindGroup>
            </TWPTabPage>
        </TWPTab>
        <TWPMonitor
            key="current"
            params={{
                view: 'graph',
                min: -1,
                max: +1,
            }}
        />
    </TWPBindGroup>
</Tweakpane>

You need to place all elements into <TWPBindGroup> and provide target.
```

It's possible to automatically build Pane from mutable with `<TWPAutoMutable>`:

```jsx
const settings = createMutable({
    bool: false,
    folder1: {
        bool: true,
        folder11: {
        number: 2,
        color: '#f05',
        },
    },
})
<Tweakpane title="Settings" expanded>
    <TWPAutoMutable target={settings} />
</Tweakpane>
```
