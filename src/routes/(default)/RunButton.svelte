<script lang="ts">
    import Button, { Label } from '@smui/button'
    import { schema as InputSettingsSchema, inputFile, BSAConcentration } from './InputCard.svelte'
    import { schema as GroupsSchema, groups } from './GroupsCard.svelte'
    import {
        schema as OutputSettingsSchema,
        shouldSaveAutomatically,
        saveDirectory,
        fileNamePattern,
    } from './OutputSettingsCard.svelte'
    import Dialog, { Title, Content, Actions } from '@smui/dialog'
    import { ZodError } from 'zod'
    import pipeThroughProcessor from '$lib/pipeline'
    import LinearProgress from '@smui/linear-progress'

    const schema = InputSettingsSchema.merge(GroupsSchema).merge(OutputSettingsSchema)

    let errors: string[] = []
    $: open = errors.length > 0

    let loading = false
    const handle = async () => {
        loading = true

        const payload = {
            inputFile: $inputFile as File,
            BSAConcentration: $BSAConcentration,
            groups: $groups,
            shouldSaveAutomatically: $shouldSaveAutomatically,
            saveDirectory: $saveDirectory,
            fileNamePattern: $fileNamePattern,
        }

        try {
            const parsed = schema.parse(payload)
        } catch (e) {
            if (e instanceof ZodError) {
                errors = e.errors.map(error => error.message)
            }

            loading = false
            return
        }

        await pipeThroughProcessor(payload)

        loading = false
    }
</script>

<Dialog
    {open}
    on:SMUIDialog:closed={() => (errors = [])}
    aria-labelledby="dialog-title"
    aria-describedby="dialog-content"
>
    <Title id="dialog-title">Validation Errors</Title>
    <Content id="dialog-content">
        <p class="mdc-typography--body1">Please verify the information that you inputted to resolve these errors.</p>
        <ol class="list-disc px-5 mt-3">
            {#each errors as error}
                <li class="mdc-typography--body1">{error}</li>
            {/each}
        </ol>
    </Content>
    <Actions>
        <Button>
            <Label>Ok</Label>
        </Button>
    </Actions>
</Dialog>

<Button variant="unelevated" on:click={handle} disabled={loading}>
    <Label>Run</Label>
</Button>

{#if loading}
    <LinearProgress class='mt-3' indeterminate />
{/if}
