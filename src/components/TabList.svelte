<script>
    import Tab from "./Tab.svelte";
    export let groups;
</script>



{#each groups as group}
    <div><Tab on:nameChanged {group}/></div>
{/each}



<style>
    div {
		margin: 10px;
	}
</style>
