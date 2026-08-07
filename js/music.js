/*
音乐信息

本地歌曲播放列表，歌词文件位于 ./music/*.lrc

原作者: imsyy
主页：https://www.imsyy.top/
GitHub：https://github.com/imsyy/home
版权所有，请勿删除
*/

let audioList = [
    {
        name: "Love Song",
        artist: "方大同",
        url: "./music/Love Song fang.mp3",
        cover: "./img/icon/logo.png",
        lrcFile: "./music/Love Song fang.lrc",
    },
    {
        name: "红尘客栈",
        artist: "周杰伦",
        url: "./music/红尘客栈.mp3",
        cover: "./img/icon/logo.png",
        lrcFile: "./music/红尘客栈.lrc",
    },
    {
        name: "花海",
        artist: "周杰伦",
        url: "./music/花海.mp3",
        cover: "./img/icon/logo.png",
        lrcFile: "./music/花海.lrc",
    },
    {
        name: "三人游",
        artist: "方大同",
        url: "./music/三人游.mp3",
        cover: "./img/icon/logo.png",
        lrcFile: "./music/三人游.lrc",
    },
    {
        name: "讨厌红楼梦",
        artist: "陶喆",
        url: "./music/讨厌红楼梦.mp3",
        cover: "./img/icon/logo.png",
        lrcFile: "./music/讨厌红楼梦.lrc",
    },
    {
        name: "烟花易冷",
        artist: "周杰伦",
        url: "./music/烟花易冷.mp3",
        cover: "./img/icon/logo.png",
        lrcFile: "./music/烟花易冷.lrc",
    },
    {
        name: "发如雪",
        artist: "周杰伦",
        url: "./music/周杰伦-发如雪.flac",
        cover: "./img/icon/logo.png",
        lrcFile: "./music/周杰伦-发如雪.lrc",
    },
];

function loadLyrics(song) {
    return fetch(song.lrcFile)
        .then((response) => response.text())
        .then((lrc) => {
            song.lrc = lrc;
            return song;
        })
        .catch(() => {
            song.lrc = "";
            return song;
        });
}

Promise.all(audioList.map(loadLyrics))
    .then((list) => {
        const ap = new APlayer({
            container: document.getElementById("aplayer"),
            order: "random",
            preload: "auto",
            listMaxHeight: "336px",
            volume: "0.5",
            mutex: true,
            lrcType: 1,
            audio: list,
        });

        /* 底栏歌词 */
        setInterval(function () {
            $("#lrc").html("<span class='lrc-show'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18'><path fill='none' d='M0 0h24v24H0z'/><path d='M12 13.535V3h8v3h-6v11a4 4 0 1 1-2-3.465z' fill='rgba(255,255,255,1)'/></svg>&nbsp;" + $(".aplayer-lrc-current").text() + "&nbsp;<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18'><path fill='none' d='M0 0h24v24H0z'/><path d='M12 13.535V3h8v3h-6v11a4 4 0 1 1-2-3.465z' fill='rgba(255,255,255,1)'/></svg></span>");
        }, 500);

        /* 音乐通知及控制 */
        ap.on("play", function () {
            music = $(".aplayer-title").text() + $(".aplayer-author").text();
            iziToast.info({
                timeout: 4000,
                icon: "fa-solid fa-circle-play",
                displayMode: "replace",
                message: music,
            });
            $("#play").html("<i class='fa-solid fa-pause'>");
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
            if ($(document).width() >= 990) {
                $(".power").css("cssText", "display:none");
                $("#lrc").css("cssText", "display:block !important");
            }
        });

        ap.on("pause", function () {
            $("#play").html("<i class='fa-solid fa-play'>");
            if ($(document).width() >= 990) {
                $("#lrc").css("cssText", "display:none !important");
                $(".power").css("cssText", "display:block");
            }
        });

        $("#music").hover(function () {
            $(".music-text").css("display", "none");
            $(".music-volume").css("display", "flex");
        }, function () {
            $(".music-text").css("display", "block");
            $(".music-volume").css("display", "none");
        });

        /* 一言与音乐切换 */
        $("#open-music").on("click", function () {
            $("#hitokoto").css("display", "none");
            $("#music").css("display", "flex");
        });

        $("#hitokoto").hover(function () {
            $("#open-music").css("display", "flex");
        }, function () {
            $("#open-music").css("display", "none");
        });

        $("#music-close").on("click", function () {
            $("#music").css("display", "none");
            $("#hitokoto").css("display", "flex");
        });

        /* 上下曲 */
        $("#play").on("click", function () {
            ap.toggle();
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
        });

        $("#last").on("click", function () {
            ap.skipBack();
            ap.play();
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
        });

        $("#next").on("click", function () {
            ap.skipForward();
            ap.play();
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
        });

        window.onkeydown = function (e) {
            if (e.keyCode == 32) {
                ap.toggle();
            }
        };

        /* 打开音乐列表 */
        $("#music-open").on("click", function () {
            if ($(document).width() >= 990) {
                $("#box").css("display", "block");
                $("#row").css("display", "none");
                $("#more").css("cssText", "display:none !important");
            }
        });

        //音量调节
        $("#volume").on("input propertychange touchend", function () {
            let x = $("#volume").val();
            ap.volume(x, true);
            if (x == 0) {
                $("#volume-ico").html("<i class='fa-solid fa-volume-xmark'></i>");
            } else if (x > 0 && x <= 0.3) {
                $("#volume-ico").html("<i class='fa-solid fa-volume-off'></i>");
            } else if (x > 0.3 && x <= 0.6) {
                $("#volume-ico").html("<i class='fa-solid fa-volume-low'></i>");
            } else {
                $("#volume-ico").html("<i class='fa-solid fa-volume-high'></i>");
            }
        });
    })
    .catch(function () {
        setTimeout(function () {
            iziToast.info({
                timeout: 8000,
                icon: "fa-solid fa-circle-exclamation",
                displayMode: "replace",
                message: "音乐播放器加载失败",
            });
        }, 3800);
    });
