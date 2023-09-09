<script lang="ts">
    import { createForm } from 'felte'
    import BrowserCompatibilityChecker from './BrowserCompatibilityChecker.svelte'
    import GroupsConfigSection from './GroupsConfigSection.svelte'
    import InputSettingsCard from './InputSettingsCard.svelte'
    import OutputSettingsCard from './OutputSettingsCard.svelte'
    import RunButton from './RunButton.svelte'
    import { setContext } from 'svelte'

    const form = createForm({
        initialValues: {
            inputFile: null,
            saveFolder: null,
            groups: [{ name: '', columns: '' }],
        },
        onSubmit(values, context) {
            console.log({ values, context })
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
