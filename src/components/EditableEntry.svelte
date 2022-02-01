<script>
    import { createEventDispatcher, onMount} from 'svelte';

    export let value, required = true;
    let editing = false, original;

    const dispatch = createEventDispatcher();

    onMount(() => {
        original = value;
    });

    function edit() {
        editing = true;
    }

    function submit() {
        if(value != original) {
            dispatch('submit', value);
        }
        editing = false;
    }

    function keydown(event) {
        if(event.key == 'Escape') {
            event.preventDefault();
            value = original;
            editing = false;
        }
    }

    function focus(element) {
        element.focus();
    }

    if(value == undefined) {
        editing = true;
    }
</script>

{#if editing}
    <form on:submit|preventDefault={submit} on:keydown={keydown}>
        <input type="text" bind:value on:blur={submit} {required} use:focus/>
    </form>
{:else}
    <div on:click={edit}>
        {value}
    </div>
{/if}


<style>
    input {
        max-width: calc(100% - 35px);
        height: 0;
        border: none;
        background: none;
        font-size: inherit;
        color: inherit;
        font-weight: inherit;
        text-align: inherit;
        box-shadow: none;
    }
</style>