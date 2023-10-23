<script>
    import ContentContainer from '$lib/components/ContentContainer.svelte'
    import Spinner from '$lib/components/Spinner.svelte'
    import { getVersion } from '@tauri-apps/api/app'
</script>

<div class="w-full h-2 bg-gradient-to-r from-[#2AF598] to-[#009EFD]" />

<ContentContainer>
    <div class="space-y-1.5 pb-6 pt-8 lg:pt-12">
        <h1 class="font-heading text-2xl font-semibold md:text-5xl lg:text-7xl">
            Complex Quantifier {#await getVersion()}
                <Spinner class="inline h-4 w-4" />
            {:then version}
                <span class="text-sm font-normal text-slate-500">v{version}</span>
            {/await}
        </h1>
        <p class="text-muted-foreground max-w-2xl">
            A utility for calculating geometric means from a spreadsheet, picking them into separate worksheets, and
            returning the calculations as an Excel workbook. Created by <a
                class="font-medium underline underline-offset-4"
                href="https://github.com/ericwang401"
                target="_blank"
            >
                Eric Wang
            </a>
        </p>
    </div>

    <slot />
</ContentContainer>
