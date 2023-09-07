<script>
    import { Button } from '$lib/components/ui/button'

    import * as Card from '$lib/components/ui/card'
    import { Input } from '$lib/components/ui/input'
    import { Label } from '$lib/components/ui/label'
</script>

<Card.Root class="col-span-2">
    <Card.Header>
        <Card.Title>Output settings</Card.Title>
    </Card.Header>
    <Card.Content>
        <form>
            <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                    <Label for="name">Name</Label>
                    <Input id="name" placeholder="Name of your project" />
                </div>
            </div>
        </form>
    </Card.Content>
    <Card.Footer class="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
    </Card.Footer>
</Card.Root>
