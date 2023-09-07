<script>
    import Logo from '$lib/assets/icons/Logo.svelte'
    import ContentContainer from '$lib/components/ContentContainer.svelte'
</script>

<div class='w-full h-2 bg-gradient-to-r from-[#2AF598] to-[#009EFD]' />

<ContentContainer>
    <div class="space-y-1.5 pt-8 lg:pt-12 pb-16">
        <h1 class="font-heading font-semibold text-2xl md:text-5xl lg:text-7xl">Complex Quantifier</h1>
        <p class="text-muted-foreground max-w-2xl">
            A utility for calculating geometric means from a spreadsheet, picking them into separate worksheets, and
            returning the calculations as an Excel workbook.
        </p>
    </div>

    <slot />
</ContentContainer>
