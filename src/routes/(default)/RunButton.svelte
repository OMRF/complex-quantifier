<script lang="ts">
    import Button, { Label } from '@smui/button'
    import { schema as InputSettingsSchema, inputFile, BSAConcentration } from './InputCard.svelte'
    import { schema as GroupsSchema, groups } from './GroupsCard.svelte'
    import { schema as OutputSettingsSchema, shouldSaveAutomatically, saveDirectory, fileNamePattern } from './OutputSettingsCard.svelte'

    const schema = InputSettingsSchema.merge(GroupsSchema).merge(OutputSettingsSchema)

    const handle = async () => {
        schema.parse({
            inputFile: $inputFile,
            BSAConcentration: $BSAConcentration,
            groups: $groups,
            shouldSaveAutomatically: $shouldSaveAutomatically,
            saveDirectory: $saveDirectory,
            fileNamePattern: $fileNamePattern,
        })
    }
</script>

<Button variant="unelevated" on:click={handle}>
    <Label>Run</Label>
</Button>
