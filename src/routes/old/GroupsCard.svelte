<script context="module" lang="ts">
    import { writable } from 'svelte/store'
    import { z } from 'zod'

    export const groups = writable<
        {
            name: string
            columns: string
        }[]
    >([{ name: '', columns: '' }])

    export const schema = z.object({
        groups: z.array(
            z.object({
                name: z.string().nonempty({ message: 'Group name is required' }),
                columns: z
                    .string()
                    .refine((value) => value !== '', { message: 'Columns are required' })
                    .refine((value) => {
                        const numbers = value.split(',').map((v) => parseInt(v))
                        return numbers.every((n) => !isNaN(n))
                    }, { message: 'Columns must be numbers' }),
            })
        ),
    })
</script>

<script lang="ts">
    import Button, { Label } from '@smui/button'
    import Card from '@smui/card'
    import IconButton from '@smui/icon-button'
    import Textfield from '@smui/textfield'
    import Tooltip, { Wrapper } from '@smui/tooltip'

    $: if ($groups.length === 0) $groups = [{ name: '', columns: '' }]

    const addGroup = () => {
        $groups = [...$groups, { name: '', columns: '' }]
    }

    const removeGroup = (i: number) => {
        $groups = $groups.filter((_, j) => j !== i)
    }
</script>

<Card padded class="flex flex-col">
    <h2 class="mdc-typography--headline5">Groups</h2>
    <Button class="mt-6" on:click={addGroup}><Label>Add group</Label></Button>
    <hr class="border-t my-6" />
    <table class="table-fixed border-collapse">
        <tr>
            <th class="mdc-typography--body2 w-1/2 py-2 pr-2 text-left">Name</th>
            <th class="mdc-typography--body2 w-1/2 py-2 pl-2 text-left">
                Column Numbers <Wrapper>
                    <span class="material-icons align-middle text-md" tabindex="0" role="button">info</span>
                    <Tooltip xPos="center" unbounded>
                        Include numbers only and separate multiple column numbers with commas
                    </Tooltip>
                </Wrapper>
            </th>
            <th aria-label="actions"></th>
        </tr>
        {#each $groups as group, i}
            <tr>
                <td class="w-1/2 py-1 pr-2">
                    <Textfield class="block" variant="outlined" bind:value={group.name} required />
                </td>
                <td class="w-1/2 py-1 pl-2">
                    <Textfield class="block" variant="outlined" bind:value={group.columns} required />
                </td>
                <td class="p-2">
                    <IconButton class="material-icons-round" on:click={() => removeGroup(i)}>delete</IconButton>
                </td>
            </tr>
        {/each}
    </table>
</Card>
