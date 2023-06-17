<script>
    import {browser} from '$app/environment'
    import {Login, Token, UserInfo} from "../stores.js";

    let usersearch_modal = false;
    let search_username , search_instance ,status_text;
    async function GetNotification(i,instance){
        const res = await fetch("https://"+instance+"/api/i/notifications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({i:i,"limit":50,"includeTypes":["reply"]})})
        const json = await res.json();
        if (res.ok){
            var seen = {};
            function filterDuplicates(item) {
                // ユーザー名とホスト名を結合したキーを作る
                var key = item.user.username + "@" + item.user.host;
                // キーが既に存在する場合はfalseを返す
                if (seen[key]) {
                    return false;
                }
                seen[key] = true;
                return true;
            }
            var filtered = json.filter(filterDuplicates);
            return filtered;
        }else{
            return json
        }
    }
    let promise;
    $: if ($UserInfo.Instance !== undefined && $Token !== undefined){
        promise = GetNotification($Token,$UserInfo.Instance);
    }

    $:{
        if (browser) {
        if (usersearch_modal && document.getElementById("usersearch") != null){
            document.getElementById("usersearch").showModal();
        }else if (document.getElementById("usersearch") != null){

            document.getElementById("usersearch").close();

        }}
    }

    async function Send() {
        console.log(search_username, search_instance);
        const search = await fetch("https://" + $UserInfo.Instance + "/api/users/search-by-username-and-host", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                i: $Token,
                username: search_username,
                host: (search_instance == $UserInfo.Instance) ? null : search_instance
            })
        })
        const search_user = await search.json();
        if (search_user[0] == undefined){
            if (browser) {
                if (document.getElementById("status_modal") != null){
                    document.getElementById("status_modal").showModal();
                }
            return status_text = "ユーザーは見つからない、またはユーザーが観測されていません。"
        }}else{
            await fetch("https://" + $UserInfo.Instance + "/api/notes/create", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    i: $Token,
                    text: "@" + search_username + "@" + search_instance,
                    visibility: "specified",
                    visibleUserIds: [search_user[0].id]
                })
            }).then(res => res.json())
                .then(data => {
                    if (data.ok){
                        if (browser) {
                            if (document.getElementById("status_modal") != null){
                                document.getElementById("status_modal").showModal();
                            }

                        return data.id
                    }
                }

        })
            }}



</script>
<div  class="main-item">
    {#if !$Login}
        まだ未ログインのようです
    {:else}
        <button on:click={() => usersearch_modal = !usersearch_modal}  >
            <span class="material-symbols-outlined">add</span>
        </button>
        <br>
        {#await promise}
            <p>...waiting</p>
        {:then json}

                {#each json || [] as a }
                    {#if a.note.visibility === "specified"}
                        <div style="margin: 8px 0 0 0 ;">
                            <a data-sveltekit-reload href={"@"+a.user.username+"@"}{a.user.host ? a.user.host : $UserInfo.Instance}>
                                <div>
                                    <img src={a.user.avatarUrl } width="48px" height="48px">
                                    {a.user.name ? a.user.name : a.user.username}<br>
                                    {a.note.text}
                                </div></a>
                        </div>
                        {/if}
                {/each}
        {:catch error}
            <p style="color: red">{error.message}</p>
        {/await}
    {/if}
</div>

<dialog class="modal" id="usersearch">
    <h2>会話を追加</h2>
    @<input bind:value={search_username} placeholder="username" style="margin:auto; height: 24px; width: 33%" type="text">
    @<input bind:value={search_instance}  placeholder="instance" style="margin:auto; height: 24px; width: 33%" type="text">
    <button on:click={() => Send()} on:click={() => usersearch_modal = !usersearch_modal} style="margin:auto; height: 32px; width: 15%">送信</button>
    <button  on:click={() => usersearch_modal = !usersearch_modal}>キャンセル</button>
</dialog>

<dialog class="modal" id="status_modal">
    <h1>エラー</h1>
    <p>{status_text}</p>
    <button  on:click={()=>document.getElementById("status_modal").close()}>キャンセル</button>
</dialog>

{#if $Login}
<div class="main-item">
    メッセージを選択するか追加するかをしてください！
</div>
{/if}
