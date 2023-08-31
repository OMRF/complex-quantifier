<script context="module" lang="ts">
    import { writable } from 'svelte/store'
    import z from 'zod'

    export const inputFile = writable<File | null>(null)
    export const BSAConcentration = writable(8)

    export const schema = z.object({
        inputFile: z.any().refine(value => value !== null, { message: 'Input data is required' }),
        // parse string to number
        BSAConcentration: z.preprocess(
            Number,
            z.number().refine(value => value > 0, { message: 'BSA concentration must be greater than 0' }),
            { errorMap: () => ({ message: 'The BSA Concentration must be a number' }) }
        ),
    })
</script>

<script lang="ts">
    import Button, { Label } from '@smui/button'
    import Card from '@smui/card'
    import Chip, { Set, Text } from '@smui/chips'
    import Textfield from '@smui/textfield'

    $: chipText = $inputFile ? $inputFile.name : 'No file selected'

    const promptToSelectInputData = async () => {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [
                {
                    description: 'Input Data',
                    accept: {
                        'text/csv': ['.csv'],
                    },
                },
            ],
        })

        $inputFile = await fileHandle.getFile()
    }
</script>

<Card padded>
    <h2 class="mdc-typography--headline5">Input Data</h2>
    <div class="flex gap-3 items-center mt-6">
        <Button variant="outlined" on:click={promptToSelectInputData}>
            <Label>Select Input Data</Label>
        </Button>
        <Set chips={[chipText]} nonInteractive let:chip><Chip {chip}><Text>{chip}</Text></Chip></Set>
    </div>
    <hr class="border-t my-6" />
    <Textfield class="max-w-xl" label="BSA Concentration" variant="outlined" bind:value={$BSAConcentration} required />
</Card>
