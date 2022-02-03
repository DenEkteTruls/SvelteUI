<script>
    import Todo from "./Todo.svelte";
    export let selectedGroup;
</script>


<div class="container">
    {#each selectedGroup.todos as todo}
        <Todo {todo} {selectedGroup} on:checked/>
    {/each}
</div>



<style>
    .container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        max-width: calc(240px*3);
        min-height: 200px;
        padding: 10px;
        margin: 10px;
        background-color: rgb(35, 34, 41);
        border-radius: 18px;
    }
</style>