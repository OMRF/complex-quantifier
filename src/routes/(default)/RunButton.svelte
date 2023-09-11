<script lang="ts">
    import Button from '$lib/components/ui/button/button.svelte'
    import { getContext } from 'svelte'
    import type { Form } from '$lib/utils'

    const { isSubmitting }: Form = getContext('form')
</script>

<div class="flex justify-end pb-4">
    <Button type="submit" loading={$isSubmitting}>Run calculations</Button>
</div>
