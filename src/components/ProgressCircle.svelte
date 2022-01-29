<script>
import ProcessCircle from "svelte-progresscircle";
export let group;
export let rounded;
</script>

{#if !rounded}
    <div class="container" style="--progress-color: {group.color};">
        <ProcessCircle max="100" value={(group.done/group.tasks)*100}>
            <div id="content">{group.title}</div>
        </ProcessCircle>
    </div>
{:else}
    <div class="container" style="--progress-color: {group.color}; border-radius: 100%; background-color: #232229;">
        <ProcessCircle max="100" value={(group.done/group.tasks)*100}>
            <div id="content">{group.title}</div>
        </ProcessCircle>
    </div>
{/if}




<style>
    .container {
        padding: 20px;
        width: 180px;
        height: 180px;
        margin: 10px;
        --progress-trackcolor: #26252C;
    }

    #content {
        display: flex;
        font-size: 22px;
        font-weight: 500;
        justify-content: center;
        padding-top: 85px;
    }
</style>