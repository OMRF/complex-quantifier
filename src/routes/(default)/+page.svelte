<script>
    import Button from '$lib/components/ui/button/button.svelte'
    import BrowserCompatibilityChecker from './BrowserCompatibilityChecker.svelte'
    import InputSettingsCard from './InputSettingsCard.svelte'
    import OutputSettingsCard from './OutputSettingsCard.svelte'
</script>

<div class="flex justify-end pb-4">
    <Button>Run calculations</Button>
</div>
<div class="grid gap-4 md:grid-cols-4">
    <InputSettingsCard />
    <OutputSettingsCard />
</div>

<BrowserCompatibilityChecker />
