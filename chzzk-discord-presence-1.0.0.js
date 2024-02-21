const ClientID = '1209477059622080564'
const DiscordRPC = require('discord-rpc');
const RPC = new DiscordRPC.Client({ transport: 'ipc'});
const env = require('dotenv');
env.config()

DiscordRPC.register(ClientID)

async function activity(url, channel_id) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.content) {
                const { status, liveTitle, liveCategoryValue, concurrentUserCount, channel } = data.content;
                const category = liveCategoryValue || '기타';
                const user_count = concurrentUserCount || 'None';
                const channel_name = channel ? channel.channelName || 'None' : 'None';
                const channel_image = channel ? (channel.channelImageUrl || "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png?type=f120_120_na") : "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png?type=f120_120_na";
                const preview_image = (data.content.liveImageUrl || '').replace('{type}', '1080');
                const user_count_2 = user_count.toLocaleString();
                if (RPC) {
                    RPC.setActivity({
                        details: liveTitle,
                        state: `${category} 하는 중`,
                        largeImageKey: preview_image,
                        largeImageText: `${channel_name}`,
                        smallImageKey: 'https://ssl.pstatic.net/static/nng/glive/icon/favicon.png',
                        buttons: [
                            {
                                label: '보기',
                                url: `https://chzzk.naver.com/live/${channel_id}`
                            }
                        ]
                    });
                }
            }
        } else {
            console.error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await new Promise(resolve => setTimeout(resolve, process.env.TIME));
        activity(url, channel_id);
    }
}


RPC.on('ready', async () => {
    console.log("치지직 활동상태 ON")
    
    const channel_id = process.env.CHANNEL_ID
    const url = `https://api.chzzk.naver.com/service/v2/channels/${channel_id}/live-detail`

    activity(url, channel_id);

    setInterval(() => {
        activity(url, channel_id);               
    }, process.env.TIME);
})

RPC.login({ clientId: ClientID });