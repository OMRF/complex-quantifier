<script lang="ts">
    import type { Form as FormType } from './+page.svelte'
    import GroupsEmptyState from './GroupsEmptyState.svelte'
    import { Button } from '$lib/components/ui/button'
    import * as Form from '$lib/components/ui/form'
    import { Input } from '$lib/components/ui/input'
    import * as FormPrimitive from 'formsnap'


    export let form: FormType

    const { form: formData, errors } = form

    $: console.log($errors)

    const addGroup = () => {
        $formData.groups = [...$formData.groups, { name: '', columns: '' }]
    }

    const removeGroup = (i: number) => {
        $formData.groups = $formData.groups.filter((_, j) => j !== i)
    }
</script>

<div class="flex flex-col">
    <div class="flex justify-between items-center">
        <h3 class="font-semibold tracking-tight text-3xl">Sample Groups</h3>
        <Button variant="secondary" on:click={addGroup} type='button'>Add group</Button>
    </div>
    <div class="flex flex-col space-y-2 mt-6">
        {#if $formData.groups.length > 0}
            {#each $formData.groups as group, i}
                <div class="flex flex-wrap relative border shadow-sm rounded-lg">
                    <FormPrimitive.Field {form} name="groups[{i}].name">
                        <Form.Control let:attrs>
                            <input
                                {...attrs}
                                type="text"
                                class="w-full md:w-1/2 px-5 py-2.5 outline-none border-b md:border-b-0 md:border-r rounded-t-lg md:rounded-r-none md:rounded-l-lg"
                                placeholder="Group name"
                                bind:value={group.name}
                            />
                        </Form.Control>
                    </FormPrimitive.Field>

                    <FormPrimitive.Field {form} name="groups[{i}].name">
                        <Form.Control let:attrs>
                            <input
                                {...attrs}
                                type="text"
                                class="w-full md:w-1/2 pl-5 pr-5 md:pr-20 py-2.5 outline-none rounded-b-lg md:rounded-l-none md:rounded-r-lg"
                                placeholder="Column numbers separated by commas"
                                bind:value={group.columns}
                            />
                        </Form.Control>
                    </FormPrimitive.Field>


                    <button
                        type='button'
                        class="absolute text-sm bg-secondary hover:bg-destructive hover:text-white px-3 py-1 right-0 rounded-tr-lg rounded-bl-lg transition"
                        on:click={() => removeGroup(i)}
                    >
                        delete
                    </button>
                </div>
                {#if $errors.groups && $errors.groups[i]}

                    <ul class="flex flex-col list-none">
                        {#if $errors.groups[i].name}
                            {#each $errors.groups[i].name as error}
                                <li class="text-sm font-medium text-destructive">
                                    {error}
                                </li>
                            {/each}
                        {/if}

                        {#if $errors.groups[i].columns}
                            {#each $errors.groups[i].columns as error}
                                <li class="text-sm font-medium text-destructive">
                                    {error}
                                </li>
                            {/each}
                        {/if}
                    </ul>
                {/if}
            {/each}
        {:else}
            <GroupsEmptyState />
        {/if}
    </div>
</div>