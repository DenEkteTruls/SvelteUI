<script>
    import EditableEntry from "./EditableEntry.svelte";
    import { createEventDispatcher } from 'svelte';

    export let group;

    let dispatch = createEventDispatcher();

    function submit(field) {
        return ({detail: newValue}) =>  {
            dispatch('nameChanged', {
                newName: newValue,
                id: group.id
            });
        }
    }
</script>

<div class="container">
    <div class="left">
        <div id="color" style="background-color: {group.color};"></div>
    </div>
    <div class="right">
        <h1 id="title"><EditableEntry bind:value={group.title} on:submit={submit('title')}/></h1>
        <p id="tasks">{group.tasks} tasks</p>
    </div>
</div>

<style>
    .container {
        background-color: #232229;
        max-width: 300px;
        height: 80px;
        border-radius: 16px;
        display: flex;
        flex-direction: row;
        cursor: pointer;
    }

    .left {
        margin-top: 10px;
        margin-left: 2px;
        width: 35px;
    }

    .left > #color {
        background-color: #3069DF;
        width: 7px;
        height: 60px;
        border-radius: 20px;
        margin-left: 13px;
    }

    .right {
        max-width: calc(100% - 35px);
        height: 80px;
    }

    .right > #title {
        position: absolute;
        margin: 10px 0 0 0;
        font-weight: 500;
    }

    .right > #tasks {
        position: absolute;
        font-size: 22px;
        color: #717278;
        margin-top: 40px;
    }
</style>