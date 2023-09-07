<script context="module" lang="ts">
    import { writable } from 'svelte/store'
    import { z } from 'zod'

    export type Group = {
        name: string
        columns: string
    }

    export const groups = writable<Group[]>([{ name: '', columns: '' }])

    export const schema = z.object({
        groups: z.array(
            z.object({
                name: z.string().nonempty({ message: 'Group name is required' }),
                columns: z
                    .string()
                    .refine(value => value !== '', { message: 'Columns are required' })
                    .refine(
                        value => {
                            const numbers = value.split(',').map(v => parseInt(v))
                            return numbers.every(n => !isNaN(n))
                        },
                        { message: 'Columns must be numbers' }
                    ),
            })
        ),
    })
</script>

<script lang="ts">
    import { Button } from '$lib/components/ui/button'

    $: if ($groups.length === 0) $groups = [{ name: '', columns: '' }]

    const addGroup = () => {
        $groups = [...$groups, { name: '', columns: '' }]
    }

    const removeGroup = (i: number) => {
        $groups = $groups.filter((_, j) => j !== i)
    }
</script>

<div class="col-span-1 md:col-span-4">
    <h3 class="font-semibold tracking-tight text-3xl">Groups</h3>
    <div class="flex flex-col space-y-2 pt-6 pb-3">
        {#each $groups as group, i}
            <div class="flex flex-wrap relative border shadow-sm rounded-lg">
                <input
                    type="text"
                    class="w-full md:w-1/2 px-5 py-2.5 outline-none border-b md:border-b-0 md:border-r rounded-t-lg md:rounded-r-none md:rounded-l-lg"
                    placeholder="Group name"
                    bind:value={group.name}
                />
                <input
                    type="text"
                    class="w-full md:w-1/2 pl-5 pr-5 md:pr-20 py-2.5 outline-none rounded-b-lg md:rounded-l-none md:rounded-r-lg"
                    placeholder="Column numbers—separated with commas"
                    bind:value={group.columns}
                />
                {#if i !== 0 || group.columns !== '' || group.name !== '' || $groups.length > 1}
                    <button
                        class="absolute text-sm bg-secondary hover:bg-destructive hover:text-white px-3 py-1 right-0 rounded-tr-lg rounded-bl-lg transition"
                        on:click={() => removeGroup(i)}
                    >
                        delete
                    </button>
                {/if}
            </div>
        {/each}
    </div>
    <div class="flex justify-center pb-3">
        <Button class="mx-auto" variant="secondary" on:click={addGroup}>Add group</Button>
    </div>
</div>
