<script lang="ts" context="module">
    import type { SuperForm } from 'sveltekit-superforms'
    import z from 'zod'

    const groupSchema = z.object({
        name: z.string().min(1, { message: 'Name is required' }),
        columns: z.string().min(1, { message: 'Columns are required' }),
    })

    const schema = z.object({
        isBulk: z.boolean(),
        normalizingProtein: z.string().min(1),
        normalizingProteinConc: z.coerce.number().min(0),
        groups: z.array(groupSchema),
    })

    export type Form = SuperForm<z.infer<typeof schema>>
</script>

<script lang="ts">
    import NormalizingProteinInputCard from './NormalizingProteinInputCard.svelte'
    import SuperDebug, { defaults, superForm } from 'sveltekit-superforms'
    import { zod } from 'sveltekit-superforms/adapters'
    import SampleGroups from './SampleGroups.svelte'
    import { Button } from '$lib/components/ui/form'
    import { toast } from 'svelte-sonner'
    import { invoke } from '@tauri-apps/api'
    import FormHeader from './FormHeader.svelte'

    const form = superForm(
        defaults(
            {
                isBulk: false,
                normalizingProtein: 'BSA',
                normalizingProteinConc: 8,
                groups: [],
            },
            zod(schema)
        ),
        {
            dataType: 'json',
            resetForm: false,
            SPA: true,
            validators: zod(schema),
            onUpdate: async ({ form }) => {
                if (!form.valid) return

                try {
                    if (form.data.isBulk) {
                        await invoke('process_data_bulk', {
                            normalizingProtein: form.data.normalizingProtein,
                            normalizingProteinConc: form.data.normalizingProteinConc,
                        })
                    } else {
                        await invoke('process_data', {
                            normalizingProtein: form.data.normalizingProtein,
                            normalizingProteinConc: form.data.normalizingProteinConc,
                            groups: form.data.groups.map(group => ({
                                name: group.name,
                                columns: group.columns.split(','),
                            })),
                        })
                    }

                    toast.success('Data processed successfully')
                } catch (e) {
                    toast.error(e as string)
                }
            },
        }
    )

    const { enhance } = form
</script>

<!--<SuperDebug data={form} />-->
<form method="POST" use:enhance class="flex flex-col space-y-8">
    <FormHeader {form} />
    <NormalizingProteinInputCard {form} />
    <SampleGroups {form} />
</form>
