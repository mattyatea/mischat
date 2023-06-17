<script>
    import {Login, Token, UserInfo} from "../stores.js";
    import {onMount} from "svelte";

    onMount(async () => {
        localStorage.getItem("Token") ? Token.set(localStorage.getItem("Token")) : "";
        localStorage.getItem("Token") ? Login.set(true) : Login.set(false);
        if (localStorage.getItem("Token")){
            await fetch("https://"+ localStorage.getItem("Instance") + "/api/i",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    i: $Token
                })
            })
                .then(res => res.json())
                .then(res => {
                    UserInfo.set({"name":res.name,"username":res.username,"avaterUrl":res.avatarUrl,"Instance":localStorage.getItem("Instance"),"userId":res.id})

                })
        }
    });
</script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" rel="stylesheet" />
<link href="/main.css" rel="stylesheet">
    <div class="header">
        <div class="header-item">

            <a href="/"><span class="material-symbols-outlined">Home</span><p>Home</p></a>
            <a href="/about"><span class="material-symbols-outlined">help</span><p>About</p></a>
            <a href="/contact"><span class="material-symbols-outlined">contact_support</span><p>Contact</p></a>
            {#if !$Login}
            <a href="/login"><span class="material-symbols-outlined">login</span><p>Login</p></a>
                {:else}
            <a href="/logout"><span class="material-symbols-outlined">logout</span><p>Logout</p></a>
            {/if}
        </div>
        {#if $Login}
        <div class="header-item-btm">
            <img src={$UserInfo.avaterUrl} style="object-fit: cover;" alt="avater" width="64" height="64"/>
            <p>@{$UserInfo.username}</p>
            <p>@{$UserInfo.Instance}</p>
        </div>
        {/if}
    </div>

<slot />
