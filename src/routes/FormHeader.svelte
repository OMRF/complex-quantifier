<script lang="ts">
    import * as Card from '$lib/components/ui/card'
    import type { Form as FormType } from './+page.svelte'
    import * as Form from '$lib/components/ui/form'
    import { Input } from '$lib/components/ui/input'
    import { Button } from '$lib/components/ui/form'
    import { Switch } from '$lib/components/ui/switch'

    export let form: FormType

    const { form: formData, submitting } = form
</script>

<div class="flex justify-between items-center">
    <Form.Field {form} name="isBulk" class="flex items-center space-x-2 space-y-0">
        <Form.Control let:attrs>
            <Switch {...attrs} aria-readonly bind:checked={$formData.isBulk} />
            <Form.Label>Bulk Processing</Form.Label>
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Button type="submit" loading={$submitting}>Run calculations</Button>
</div>