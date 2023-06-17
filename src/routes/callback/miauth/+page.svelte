<script>
    import {onMount} from 'svelte';

    let Now = "認証中...";

    onMount(() => {
        const referrer = document.referrer;
        const urlParams = new URLSearchParams(window.location.search);
        fetch(referrer + "api/miauth/" + urlParams.get('session') + "/check", {method: 'POST', mode: 'cors'})
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.ok) {
                    const url = new URL(referrer);
                    const instance = url.hostname;
                    localStorage.setItem('Token', data.token);
                    localStorage.setItem('Instance', instance);
                    Now = "認証に成功しました";
                    window.location.href="/"
                } else {
                    Now = "認証に失敗しました";

                }
            })
})

</script>
<div class="main-item">
    {Now}
</div>

<style>
    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>