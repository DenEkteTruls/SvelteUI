<script>
    import { createEventDispatcher} from 'svelte';
    export let todo;
    export let selectedGroup;

    let dispatch = createEventDispatcher();

    function clicked(event) {
        dispatch("checked", {
            id: todo.id,
            groupId: selectedGroup.id
        });
    }
</script>

{#if todo.checked}
    <div class="container checked">
        <h1>{todo.todo}</h1>
    </div>
{:else}
    <div class="container" on:click={clicked}>
        <h1>{todo.todo}</h1>
    </div>
{/if}



<style>
    .container {
        display: flex;
        border-radius: 30px;
        background-color: #3D3E49;
        padding: 5px 15px;
        width: fit-content;
        flex-direction: column;
        flex-wrap: wrap;
        height: 60px;
        justify-content: center;
        align-items: center;
        margin: 10px;
        user-select: none;
    }

    .container:hover {
        cursor: pointer;
    }

    .checked {
        background-color: #3fbe6f;
        user-select: none;
    }

    .container > h1 {
        font-weight: 400;
        font-size: 30px;
        color: white;
    }
</style>