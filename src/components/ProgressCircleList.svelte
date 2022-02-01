<script>
    import ProgressCircle from "./ProgressCircle.svelte";
    export let groups;
    let rounded = false;
</script>



{#if !rounded}
    <div class="container" style="border-radius: 16px; background-color: #232229;">
        {#each groups as group}
            <div><ProgressCircle {group} {rounded}/></div>
        {/each}
    </div>
 {:else}
    <div class="container">
        {#each groups as group}
            <div><ProgressCircle {group} {rounded}/></div>
        {/each}
    </div>
{/if}


<style>

    .container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        max-width: calc(240px*3);
        padding: 10px;
        margin: 10px;
    }

    div {
        display: flex;
        flex-direction: row;
    }

    @media (max-width: 760px) {
        .container {
            flex-direction: column;
            padding: 28px;
        }
    }
</style>