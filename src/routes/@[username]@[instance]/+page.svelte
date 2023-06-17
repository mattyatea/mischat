<script>
    import {Token, UserInfo} from "../../stores.js";
    import {onMount} from "svelte";

    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let message_text_repl;
    let usersearch_modal = false;
    let search_username , search_instance ,status_text;
    let message_text = [];
    let dm , dm_latest;
    const channelid = Math.floor(Math.random()*65535) ;
    export let data;

    onMount(async () => {
        await _sleep(500);
        if ($UserInfo.Instance !== "undefined" && $UserInfo.Instance !== undefined && $Token !== undefined && $UserInfo.userId !== undefined) {

            let socket = new WebSocket("wss://" + $UserInfo.Instance + "/api/streaming/?i=" + $Token);
            socket.onopen = function (e) {
                console.log("[open] Connection established");
                socket.send(JSON.stringify(
                    {
                        "type": "connect",
                        "body": {
                            "channel": "main",
                            "id": channelid
                        }
                    }
                ));
            }

            socket.onmessage = function (event) {
                let json = JSON.parse(event.data);
                if (json.body.type === "mention") {
                    if ($UserInfo.Instance === data.instance){
                        data.instance = null;
                    }
                    console.log(json.body.body);
                    if ( json.body.body.user.username == data.username && json.body.body.user.host == data.instance) {

                        message_text.push(json.body.body);
                        console.log(message_text);
                        message_text = message_text
                    }

                }
            };
        }

    })
    async function GetDm(i,instance) {
       const res =  await fetch("https://" + instance + "/api/notes/mentions ", {
            method: "POST",
            body: JSON.stringify({"visibility":"specified","limit":10,"i":i}),
           headers:{"Content-Type":"application/json"}
        })
        let json = await res.json();
        if ($UserInfo.Instance === data.instance){
            data.instance = null;
        }
       var result = json.filter(function(item) {
            return item.user.username === data.username &&
                item.user.host === data.instance &&
                item.visibility === "specified";
        });
        localStorage.setItem("@"+data.username+"@"+data.instance,JSON.stringify(result));
        const rev = await result.reverse();
        return await rev;
    }
    async function GetLatest(i,instance) {
        const res =  await fetch("https://" + instance + "/api/notes/mentions ", {
            method: "POST",
            body: JSON.stringify({"visibility":"specified","limit":1,"i":i}),
            headers:{"Content-Type":"application/json"}
        })
        let res1_json = await res.json();
        const res2 = await fetch("https://"+instance+"/api/notes/replies",{
            method:"POST",
            body:JSON.stringify({"i":i,"noteId":res1_json[0].id}),
            headers:{"Content-Type":"application/json"}
        })
        const res2_json = await res2.json();

        var result = res2_json.filter(function(item) {
            return item.user.username === $UserInfo.username &&
                item.user.host === null &&
                item.visibility === "specified";
        });

        return await result;
    }

    function SendDm(i,instance,message_text) {
        let mention_instance;
        if (data.instance === $UserInfo.Instance){
            data.instance = null;
            const mention_instance = "";
        }
        else {
            const mention_instance = "@"+data.instance;
        }
        const text = "@"+data.username+mention_instance+" "+message_text_repl;
        const res = fetch("https://"+$UserInfo.Instance+"/api/notes/create",{
            method:"POST",
            body:JSON.stringify({"i":$Token,"text":text,"visibility":"specified","visibleUserIds":[data.userId]}),
            headers:{"Content-Type":"application/json"}
        })
        message_text_repl = "";
        return res.json;
    }
    $: if ($UserInfo.Instance !== undefined && $Token !== undefined){
        dm = GetDm($Token,$UserInfo.Instance);
        dm_latest = GetLatest($Token,$UserInfo.Instance);
    }





</script>

<div  class="main-item">
</div>
<div class="main-item" id="1" style="padding: 0;">
<div style="margin: 0 8px">

    {#await dm}
    {:then value}

        {#each value || [] as dm}
            {#if dm.reply !== undefined}
            {#if dm.reply !== null && dm.reply.userId == $UserInfo.userId }
                <div style="text-align: right ;background-color: #2b2b2b; margin: 16px 0 auto auto; padding:4px 8px; width: fit-content;  border-radius: 0.3em; ">
                    {dm.reply.text.replace(`@`+data.username,``).replace(`@`+data.instance,``)}
                    <img src={dm.reply.user.avatarUrl} width="32px" height="32px"><br>
                    <small><small>{dm.reply.createdAt}</small></small>
                </div>
            {/if}
                {/if}
            <div style="background-color: #2b2b2b; margin: 16px 0 0 0; border-radius: 0.3em; width: fit-content; padding:4px 8px">
            <img src={dm.user.avatarUrl} width="32px" height="32px">
                {dm.text.replace(`@`+$UserInfo.username,``).replace(`@`+$UserInfo.Instance,"")}<br>
                <small><small>{dm.createdAt}</small></small>
            </div>
        {/each}
    {/await}

    {#await dm_latest}
        {:then value}

        {#each value || [] as value}
            {#if value.userId == $UserInfo.userId}
            <div style="text-align: right ;background-color: #2b2b2b; margin: 16px 0 auto auto; padding:4px 8px; width: fit-content;  border-radius: 0.3em; ">
                {value.text.replace(`@`+data.username,``).replace(`@`+data.instance,"")}
                <img src={value.user.avatarUrl} width="32px" height="32px"><br>
                <small><small>{value.createdAt}</small></small>
            </div>
                {/if}
            {/each}
        {/await}

    {#each message_text || [] as dm}

        <div style="background-color: #2b2b2b; margin: 16px 0 0 0; border-radius: 0.3em; width: fit-content; padding:4px 8px">
            <img src={dm.user.avatarUrl} width="32px" height="32px">
            {dm.text.replace(`@`+$UserInfo.username,``).replace(`@`+$UserInfo.Instance,"")}<br>
            <small><small>{dm.createdAt}</small></small>
        </div>
        {/each}
    <div>
    <textarea bind:value={message_text_repl} style="margin: 16px 0 0 0 ;"></textarea>
    <button on:click style="margin: 8px 0 8px 0; text-align: center" ><span class="material-symbols-outlined">send</span></button>
    </div>
</div>
</div>