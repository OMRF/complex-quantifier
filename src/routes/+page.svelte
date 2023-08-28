<script lang="ts">
    import Button, { Label } from '@smui/button'
    import Card from '@smui/card'
    import Chip, { Text, Set, TrailingAction } from '@smui/chips'
    import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar'
    import { handle } from '$lib/pipeline'
    import IconButton from '@smui/icon-button'
    import ContentContainer from '$lib/components/ContentContainer.svelte'

    let inputFile: File | null = null

    $: val = inputFile ? inputFile.name : 'No file selected'

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
</script>

<TopAppBar variant="standard" dense>
    <Row>
        <Section>
            <IconButton class="material-icons">menu</IconButton>
            <Title>Complex Quantifier</Title>
        </Section>
        <Section align="end" toolbar>
            <IconButton class="material-icons" aria-label="Download">file_download</IconButton>
            <IconButton class="material-icons" aria-label="Print this page">print</IconButton>
            <IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton>
        </Section>
    </Row>
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
            </div></Card
        >
        <Card padded>
            <h2 class="mdc-typography--headline5">Groups</h2>
            <div class="grid grid-cols-2 max-w-3xl mt-6">
                <div>
                    <p class='mdc-typography--body1'>Name</p>
                </div>

                <div>
                    <p class='mdc-typography--body1'>Column Numbers</p>
                </div>

            </div>

            </Card
        >
    </div>
</ContentContainer>
