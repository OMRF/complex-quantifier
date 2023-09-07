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
    import { Button } from '$lib/components/ui/button'
    import * as Card from '$lib/components/ui/card'
    import { Input } from '$lib/components/ui/input'
    import { Label } from '$lib/components/ui/label'

    $: filename = $inputFile ? $inputFile.name : 'No file selected'

    const selectInputData = async () => {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [
                {
                    description: 'Input data',
                    accept: {
                        'text/csv': ['.csv'],
                    },
                },
            ],
        })

        $inputFile = await fileHandle.getFile()
    }
</script>

<Card.Root class="col-span-2">
    <Card.Header>
        <Card.Title>Input settings</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="flex flex-col space-y-4">
            <div class="flex space-x-4">
                <Button on:click={selectInputData}>Select input data</Button>
                <p class="h-10 grow bg-slate-100 rounded-md px-4 py-2 truncate">{filename}</p>
            </div>
            <div class="flex flex-col space-y-1.5">
                <Label for="name">BSA Concentration</Label>
                <Input bind:value={$BSAConcentration} />
            </div>
        </div>
    </Card.Content>
</Card.Root>
