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
    import { Icon, DocumentChartBar } from 'svelte-hero-icons'

    let isSelecting = false
    $: filename = $inputFile ? $inputFile.name : 'No file selected'
    $: isFileSelected = $inputFile !== null

    const selectInputData = async () => {
        isSelecting = true
        try {
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
        } catch {}
        isSelecting = false
    }
</script>

<Card.Root class="col-span-1 md:col-span-2">
    <Card.Header>
        <Card.Title>Input settings</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="flex flex-col space-y-8">
            <div class="flex space-x-2">
                <Button class="shrink-0" on:click={selectInputData} disabled={isSelecting}>Select input data</Button>
                <div
                    class="h-10 grow border p-2 rounded-md overflow-hidden transition"
                    class:border-transparent={!isFileSelected}
                >
                    {#key $inputFile}
                        <div
                            class="flex items-center space-x-2 fade-in-right"
                            class:hidden={!isFileSelected}
                        >
                            <Icon src={DocumentChartBar} class="w-6 h-6 shrink-0" solid />
                            <p class="text-sm truncate">{filename}</p>
                        </div>
                    {/key}
                </div>
            </div>
            <div class="flex flex-col space-y-1.5">
                <Label for="name">BSA Concentration</Label>
                <Input bind:value={$BSAConcentration} />
            </div>
        </div>
    </Card.Content>
</Card.Root>

<style>
    :global(.fade-in-right) {
        animation: fadeInRight 0.25s cubic-bezier(0, 0, 0.2, 1);
    }

    @keyframes fadeInRight {
        0% {
            opacity: 0;
            transform: translateX(-20px);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }
</style>
