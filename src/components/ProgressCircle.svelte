<script>

import ProcessCircle from "svelte-progresscircle";
export let group;
export let rounded;

</script>



{#if !rounded}
    <div class="container" style="--progress-color: {group.color};">
        <ProcessCircle id="circle" max="100" value={(group.done/group.todos.length)*100}>
            <div id="content">{group.title}</div>
            {#if (group.tasks == 0 || group.done == 0)}
                <div id="progress">0%</div>
            {:else}
                <div id="progress">{Math.round((group.done/group.todos.length)*100)}%</div>
            {/if}
        </ProcessCircle>
    </div>
{:else}
    <div class="container" style="--progress-color: {group.color}; border-radius: 100%; background-color: #232229;">
        <ProcessCircle id="circle" max="100" value={(group.done/group.todos.length)*100}>
            <div id="content">{group.title}</div>
            {#if (group.tasks == 0 || group.done == 0)}
                <div id="progress">0%</div>
            {:else}
                <div id="progress">{Math.round((group.done/group.todos.length)*100)}%</div>
            {/if}
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
        padding-top: 77px;
    }

    #progress {
        font-size: 22px;
        color: #717278;
        position: absolute;
        top: 100px;
        right: 77px;
    }
</style>