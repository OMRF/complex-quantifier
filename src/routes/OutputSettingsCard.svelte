<script context="module" lang="ts">
    import { writable } from 'svelte/store'
    import { z } from 'zod'

    export const filenamePattern = writable('{filename}-{month}{day}{year}-{hours}{minutes}{seconds}')

    export const schema = z.object({
        saveFolderPath: z.any(),
        filenamePattern: z.string().regex(/^[a-zA-Z0-9\-\_\.\{\}]+$/, {
            message: 'Please use letters, numbers, dashes, underscores, periods, or curly braces',
        }),
    })
</script>

<script lang="ts">
    import { Icon, Folder, Check } from 'svelte-hero-icons'
    import { Button } from '$lib/components/ui/button'
    import { Badge } from '$lib/components/ui/badge'
    import * as Card from '$lib/components/ui/card'
    import { Input } from '$lib/components/ui/input'
    import { Label } from '$lib/components/ui/label'
    import { getContext } from 'svelte'
    import type { Form } from '$lib/utils'
    import { open } from '@tauri-apps/api/dialog';

    const { data, setData }: Form = getContext('form')

    const availablePatterns = ['{filename}', '{year}', '{month}', '{day}', '{hours}', '{minutes}', '{seconds}']

    let isSelecting = false

    $: saveFolderPath = $data.saveFolderPath as string | null
    $: folderName = saveFolderPath ? saveFolderPath.split('\\').slice(-1) : 'No folder selected'
    $: isFolderSelected = saveFolderPath !== null

    const selectSaveFolder = async () => {
        isSelecting = true
        try {
            const directory = await open({
                directory: true,
            })

            setData('saveFolderPath', directory as string | null)
        } catch {}
        isSelecting = false
    }
</script>

<Card.Root class="col-span-1 md:col-span-2">
    <Card.Header>
        <Card.Title>Output settings</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="flex flex-col space-y-8">
            <div class="relative space-y-1.5">
                <div class="flex space-x-2">
                    <Button class="shrink-0" on:click={selectSaveFolder} disabled={isSelecting}>
                        Select save folder
                    </Button>
                    <div
                        class="h-10 grow border p-2 rounded-md overflow-hidden transition"
                        class:border-transparent={!isFolderSelected}
                    >
                        <div class="flex items-center space-x-2 fade-in-right" class:hidden={!isFolderSelected}>
                            <Icon src={Folder} class="w-6 h-6 shrink-0" solid />
                            <p class="text-sm truncate">{folderName}</p>
                        </div>
                    </div>
                </div>
                <div class="overflow-hidden relative">
                    <div
                        class="flex items-center space-x-1 absolute transition duration-500"
                        class:-translate-y-full={!isFolderSelected}
                    >
                        <Icon src={Check} class="w-5 h-5 text-muted-foreground" mini />
                        <p class="text-sm text-muted-foreground">Autosave is enabled</p>
                    </div>
                    <div
                        class="flex items-center space-x-1 relative transition duration-500"
                        class:translate-y-full={isFolderSelected}
                    >
                        <p class="text-sm text-muted-foreground">
                            Autosave is disabled. Select a save folder to enable.
                        </p>
                    </div>
                </div>
            </div>
            <div class="flex flex-col space-y-1.5">
                <Label for="name">Filename Pattern</Label>
                <Input name="filenamePattern" value={`{filename}-{month}{day}{year}-{hours}{minutes}{seconds}`} />
                <div class="flex flex-wrap gap-2">
                    <p class="text-sm text-muted-foreground">Available:</p>
                    {#each availablePatterns as pattern}
                        <Badge variant="secondary">{pattern}</Badge>
                    {/each}
                </div>
            </div>
        </div>
    </Card.Content>
</Card.Root>
