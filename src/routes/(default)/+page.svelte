<script lang="ts">
    import { createForm } from 'felte'
    import BrowserCompatibilityChecker from './BrowserCompatibilityChecker.svelte'
    import GroupsConfigSection, { schema as GroupsSchema } from './GroupsConfigSection.svelte'
    import InputSettingsCard, { schema as InputSettingsSchema } from './InputSettingsCard.svelte'
    import OutputSettingsCard, { schema as OutputSettingsSchema } from './OutputSettingsCard.svelte'
    import RunButton from './RunButton.svelte'
    import { setContext } from 'svelte'
    import pipeThroughProcessor from '$lib/pipeline'
    import { ZodError } from 'zod'
    import ValidationMessagesDialog from './ValidationMessagesDialog.svelte'

    const schema = InputSettingsSchema.merge(OutputSettingsSchema).merge(GroupsSchema)

    let errors: string[] = []

    const form = createForm({
        initialValues: {
            inputFile: null as File | null,
            BSAConcentration: 8,
            saveFolderPath: null as string | null,
            groups: [{ name: '', columns: '' }],
            filenamePattern: '{filename}-{month}{day}{year}-{hours}{minutes}{seconds}',
        },
        async onSubmit(values) {
            try {
                schema.parse(values)

                const payload = {
                    ...values,
                    inputFile: values.inputFile as File,
                }

                await pipeThroughProcessor(payload)
            } catch (e) {
                if (e instanceof ZodError) {
                    errors = e.errors.map(error => error.message)
                }

                console.error(e)
            }
        },
    })

    setContext('form', form)
</script>

<form use:form.form>
    <RunButton />
    <div class="grid gap-4 grid-cols-1 md:grid-cols-4">
        <InputSettingsCard />
        <OutputSettingsCard />
        <GroupsConfigSection />
    </div>
    <RunButton />
</form>

<BrowserCompatibilityChecker />

<ValidationMessagesDialog bind:errors />
