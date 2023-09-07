<script>
    import * as AlertDialog from '$lib/components/ui/alert-dialog'

    const features = [
        {
            name: 'window.showSaveFilePicker',
            supported: 'showSaveFilePicker' in window,
        },
        {
            name: 'window.showOpenFilePicker',
            supported: 'showOpenFilePicker' in window,
        },
        {
            name: 'window.showDirectoryPicker',
            supported: 'showDirectoryPicker' in window,
        },
    ]
    $: unsupportedFeatures = features.filter(feature => !feature.supported)
</script>

<AlertDialog.Root open={unsupportedFeatures.length > 0}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Browser unsupported</AlertDialog.Title>
            <AlertDialog.Description>
                Your browser lacks support for the modern File System API. These features were not found in your browser:
            </AlertDialog.Description>
            <ul class='list-disc px-3 py-3'>
                {#each unsupportedFeatures as feature}
                    <li class='text-sm text-muted-foreground'>{feature.name}</li>
                {/each}
            </ul>

            <p class='text-sm text-muted-foreground'>Protip: try using Chrome if you do not know an alternative.</p>
        </AlertDialog.Header>
    </AlertDialog.Content>
</AlertDialog.Root>
