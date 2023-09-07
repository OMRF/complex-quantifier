<script>
    import Button from '$lib/components/ui/button/button.svelte'
    import BrowserCompatibilityChecker from './BrowserCompatibilityChecker.svelte'
    import GroupsConfigSection from './GroupsConfigSection.svelte'
    import InputSettingsCard from './InputSettingsCard.svelte'
    import OutputSettingsCard from './OutputSettingsCard.svelte'
    import RunButton from './RunButton.svelte'
</script>

<RunButton />
<div class="grid gap-4 grid-cols-1 md:grid-cols-4">
    <InputSettingsCard />
    <OutputSettingsCard />
    <GroupsConfigSection />
</div>
<RunButton />

<BrowserCompatibilityChecker />
