<script lang="ts">
    import Button, { Label } from '@smui/button'
    import Card from '@smui/card'
    import Chip, { Text, Set, TrailingAction } from '@smui/chips'
    import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar'
    import Tooltip, { Wrapper } from '@smui/tooltip'
    import Textfield from '@smui/textfield'
    import { handle } from '$lib/pipeline'
    import IconButton from '@smui/icon-button'
    import ContentContainer from '$lib/components/ContentContainer.svelte'
    import Switch from '@smui/switch'
    import FormField from '@smui/form-field'

    let inputFile: File | null = null
    let BSAConcentration = 8
    let shouldSaveAutomatically = false
    $: val = inputFile ? inputFile.name : 'No file selected'

    let groups: {
        name: string
        columns: string
    }[] = []

    const selectFolder = async () => {
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

        inputFile = await fileHandle.getFile()
    }

    const addGroup = () => {
        groups = [...groups, { name: '', columns: '' }]
    }

    const removeGroup = (i: number) => {
        groups = groups.filter((_, j) => j !== i)
    }
</script>

<TopAppBar variant="standard" dense>
    <ContentContainer class="w-full">
        <Row>
            <Section>
                <IconButton class="material-icons">menu</IconButton>
                <Title>Complex Quantifier</Title>
            </Section>
            <Section align="end" toolbar>
                <IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton>
            </Section>
        </Row>
    </ContentContainer>
</TopAppBar>

<ContentContainer class="pt-16">
    <div class="flex flex-col gap-6">
        <Card padded>
            <h2 class="mdc-typography--headline5">Input Data</h2>
            <div class="flex gap-3 items-center mt-6">
                <Button variant="outlined" on:click={selectFolder}>
                    <Label>Select Input Data</Label>
                </Button>
                <Set chips={[val]} nonInteractive let:chip><Chip {chip}><Text>{chip}</Text></Chip></Set>
            </div>
            <hr class="border-t my-6" />
            <Textfield
                label="BSA Concentration"
                variant="outlined"
                bind:value={BSAConcentration}
                type="number"
                required
            />
        </Card>
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
                {#each groups as group, i}
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

        <Card padded class="flex flex-col">
            <h2 class="mdc-typography--headline5 mb-5">Output Settings</h2>
            <FormField>
                <Switch bind:checked={shouldSaveAutomatically} />
                <span slot="label">Save Automatically</span>
            </FormField>
        </Card>
    </div>
</ContentContainer>
