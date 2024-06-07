<script lang="ts">
    import * as Card from '$lib/components/ui/card'
    import type { Form as FormType } from './+page.svelte'
    import * as Form from '$lib/components/ui/form'
    import { Input } from '$lib/components/ui/input'

    export let form: FormType

    const { form: formData } = form
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Normalizing Protein</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="grid grid-cols-2 gap-4">
            <Form.Field {form} name="normalizingProtein">
                <Form.Control let:attrs>
                    <Form.Label>Protein</Form.Label>
                    <Input {...attrs} bind:value={$formData.normalizingProtein} />
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
            <Form.Field {form} name="normalizingProteinConc">
                <Form.Control let:attrs>
                    <Form.Label>Concentration</Form.Label>
                    <Input {...attrs} bind:value={$formData.normalizingProteinConc} />
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
        </div>
    </Card.Content>
</Card.Root>