<script lang="ts">
    import ContentContainer from '$lib/components/ContentContainer.svelte'
    import GroupsCard from './GroupsCard.svelte'
    import InputCard from './InputCard.svelte'
    import OutputSettingsCard from './OutputSettingsCard.svelte'
    import RunButton from './RunButton.svelte'
</script>

<ContentContainer class="py-16">
    <div class="flex flex-col gap-6">
        <InputCard />
        <GroupsCard />
        <OutputSettingsCard />
        <RunButton />
    </div>
</ContentContainer>
