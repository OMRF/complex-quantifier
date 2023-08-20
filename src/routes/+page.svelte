<script lang="ts">
	import {handle} from '$lib/pipeline'
	let files: FileList;


	const run = async () => {

		const file = files?.item(0);
		if (!file) return;

		await handle(file)
	}
</script>


<input accept=".csv" bind:files type="file"  />
<button on:click={run} disabled={files === null}>process</button>