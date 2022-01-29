<script>

    import {createEventDispatcher} from 'svelte';

    export let value;
    const dispatch = createEventDispatcher();

    function clicked(event)
    {
        dispatch('clicked');
    }   

</script>



<button on:click={clicked}>{value}</button>



<style>
    
    button {
        border: none;
        border-radius: 16px;
        background-color: #3168E0;
        width: 300px;
        height: 50px;
        cursor: pointer;
        color: white;
        font-size: 25px;
        font-weight: 400;
        line-height: 1.4;
        text-align: center;
        transition: all .1s ease-in-out;
        margin: 10px;
    }

    button:hover {
        transform: scale(1.01);
    }
</style>