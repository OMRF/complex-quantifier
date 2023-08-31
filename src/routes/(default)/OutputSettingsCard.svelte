<script context="module" lang="ts">
    import { writable } from 'svelte/store'
    import { z } from 'zod'

    export const shouldSaveAutomatically = writable(false)
    export const saveDirectory = writable<FileSystemDirectoryHandle | null>(null)
    export const fileNamePattern = writable('{filename}-{month}{day}{year}-{hours}{minutes}{seconds}')

    export const schema = z.object({
        shouldSaveAutomatically: z.boolean(),
        saveDirectory: z
            .object({
                name: z.string(),
                handle: z.any(),
            })
            .nullable(),
        fileNamePattern: z.string().regex(/^[a-zA-Z0-9\-\_\.\{\}]+$/, {
            message: 'Please use letters, numbers, dashes, underscores, periods, or curly braces',
        }),
    })
</script>

<script lang="ts">
    import Card from '@smui/card'
    import FormField from '@smui/form-field'
    import Switch from '@smui/switch'
    import Button, { Label } from '@smui/button'
    import Chip, { Set, Text } from '@smui/chips'
    import HelperText from '@smui/textfield/helper-text'
    import Textfield from '@smui/textfield'

    const helperText = `Available: {filename}, {year}, {month}, {day}, {hours}, {minutes}, {seconds}`
    $: chipText = $saveDirectory ? $saveDirectory.name : 'No directory selected'

    const promptSaveDirectorySelector = async () => {
        const directory = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'downloads',
        })

        $saveDirectory = directory
    }
</script>

<Card padded class="flex flex-col">
    <h2 class="mdc-typography--headline5">Output Settings</h2>
    <div class="flex flex-col gap-6 mt-5">
        <FormField>
            <Switch bind:checked={$shouldSaveAutomatically} />
            <span slot="label">Save Automatically</span>
        </FormField>

        <div class="flex items-center gap-3">
            <Button variant="outlined" on:click={promptSaveDirectorySelector} disabled={!$shouldSaveAutomatically}>
                <Label>Select Output Directory</Label>
            </Button>
            <Set chips={[chipText]} nonInteractive let:chip><Chip {chip}><Text>{chip}</Text></Chip></Set>
        </div>
        <hr class="border-t" />
        <div>
            <Textfield
                class="w-full max-w-xl"
                label="File Name Pattern"
                variant="outlined"
                bind:value={$fileNamePattern}
                required
            >
                <HelperText slot="helper">{helperText}</HelperText>
            </Textfield>
        </div>
    </div>
</Card>
