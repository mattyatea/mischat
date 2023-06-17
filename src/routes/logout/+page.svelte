<script>
    import {onMount} from "svelte";

    onMount(() => {
        localStorage.removeItem("Token")
        localStorage.removeItem("Instance")
        location.href = "/"
    });
</script>