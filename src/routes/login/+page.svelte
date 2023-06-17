<script>
    let chk,instance_name, value = "https://";

    function Misskey_login(InstanceURI, R_data,CallbackBase) {
        const uuid = crypto.randomUUID();//UUID作成
        window.location.href = InstanceURI + "/miauth/" + uuid + "?name=Misskey dm Client&callback=" + CallbackBase + "miauth&permission=write:account,write:notes,read:notifications,write:drive,read:drive,read:account";//飛ばす
    }
    function LoginButton(value){
        chk = value.match(/^https?:\/\/[^\s/$.?#]+\.[^\s]*$/i); //URLの正規表現
        // ここでインスタンスを確認しているのかも
        if (chk) {
            fetch("https://actv-pub-soft-chk.mattya.workers.dev/?url=" + value)
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
                        (data.name == "undefined") ? instance_name = value : instance_name = data.name;
                        if (data.software == "misskey" || data.software == "meisskey" || data.software == "calckey") {
                            Misskey_login(value,data.version,"http://127.0.0.1:5173/callback/")
                        } else {
                            alert(data.software + "はサポートしていません。");
                        }
                    }})}else{
        }
    }

</script>
<div class="main-item">
    <input bind:value={value} />
    <button on:click={LoginButton(value)}>ログイン</button>
</div>
<style>
    .main-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

</style>