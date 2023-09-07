<script lang="ts">
    import ContentContainer from '$lib/components/ContentContainer.svelte'
    import IconButton from '@smui/icon-button'
    import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
</script>

<TopAppBar variant="standard" dense>
    <ContentContainer class="w-full">
        <Row>
            <Section>
                <IconButton class="material-icons">menu</IconButton>
                <Title>Complex Quantifier</Title>
            </Section>
            <Section align="end" toolbar>
                <IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton>
            </Section>
        </Row>
    </ContentContainer>
</TopAppBar>

<slot />