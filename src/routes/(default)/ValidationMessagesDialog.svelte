<script lang="ts">
    import * as AlertDialog from '$lib/components/ui/alert-dialog'

    export let errors: string[]
</script>

<AlertDialog.Root open={errors.length > 0}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Validation Error</AlertDialog.Title>
            <AlertDialog.Description>
                Your input contains validation errors. Please fix them before continuing.
            </AlertDialog.Description>
            <ul class="list-disc px-3 py-3">
                {#each errors as error}
                    <li class="text-sm text-muted-foreground">{error}</li>
                {/each}
            </ul>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Action on:click={() => errors = []}>Ok</AlertDialog.Action>
          </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
