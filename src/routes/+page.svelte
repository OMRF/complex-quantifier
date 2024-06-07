<script lang="ts" context="module">
    import type { SuperForm } from 'sveltekit-superforms'
    import z from 'zod'

    const groupSchema = z.object({
        name: z.string().min(1, { message: 'Name is required' }),
        columns: z.string().min(1, { message: 'Columns are required' }),
    })

    const schema = z.object({
        normalizingProtein: z.string().min(1),
        normalizingProteinConc: z.coerce.number().min(0),
        groups: z.array(groupSchema),
    })

    export type Form = SuperForm<z.infer<typeof schema>>
</script>

<script lang="ts">
    import NormalizingProteinInputCard from './NormalizingProteinInputCard.svelte'
    import { defaults, superForm } from 'sveltekit-superforms'
    import { zod } from 'sveltekit-superforms/adapters'
    import SampleGroups from './SampleGroups.svelte'
    import { Button } from '$lib/components/ui/form'


    const form = superForm(defaults({
        normalizingProtein: 'BSA',
        normalizingProteinConc: 8,
        groups: [],
    }, zod(schema)), {
        SPA: true,
        validators: zod(schema),
        onUpdate: async ({ form }) => {
            if (!form.valid) return

            try {

            } catch (e) {

            }
        },
    })

    const { form: formData, enhance, submitting } = form


    // const form = createForm({
    //     initialValues: {
    //         inputFile: null as File | null,
    //         BSAConcentration: 8,
    //         saveFolderPath: null as string | null,
    //         groups: [{ name: '', columns: '' }],
    //         filenamePattern: '{filename}-{month}{day}{year}-{hours}{minutes}{seconds}',
    //     },
    //     async onSubmit(values) {
    //         try {
    //             schema.parse(values)
    //
    //             const payload = {
    //                 ...values,
    //                 inputFile: values.inputFile as File,
    //             }
    //
    //             await pipeThroughProcessor(payload)
    //         } catch (e) {
    //             if (e instanceof ZodError) {
    //                 errors = e.errors.map(error => error.message)
    //             }
    //
    //             console.error(e)
    //         }
    //     },
    // })
    //
    // setContext('form', form)
</script>

<form method="POST" use:enhance class="flex flex-col space-y-8">
    <div class="flex justify-end">
        <Button type="submit" loading={$submitting}>Run calculations</Button>
    </div>
    <NormalizingProteinInputCard {form} />
    <SampleGroups {form} />
</form>