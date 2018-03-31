/**
 * Created by cjl on 2017/7/19.
 */
// console.log(window.innerHeight, window.document.documentElement.clientHeight, window.document.body.clientHeight, window.outerHeight, document.documentElement.offsetHeight);
var FastClick = require("fastclick");
import "styles/main.scss";
import events from "./utils/Monitor.js";
window.Events = new events();
// * window.Events.trigger('ShowIcon', {})
// * window.Events.listen('ShowIcon', () => {})

import WebPlayer from "./player/WebPlayer.js";
import CompatHlsPlayerExcept10 from "./player/CompatHlsPlayerExcept10.js";
import {
    getVideoMIMEType,
    VIDEO_TYPE,
    RENDER_TYPE
} from "./utils/VideoType.js";
import * as userAgent from "./utils/UserAgent.js";
import { formatDuring, GetQueryString } from "./utils/CommonUtils.js";

// var videoUrl = require('../assets/video/golf.mp4');
// var videoUrl = require('../assets/video/golf/golf.m3u8');//测试时需要将ts文件拷贝到m3u8文件夹下
// var videoUrl = "http://cache.utovr.com/eb24820499e6411184950b66c00894a0/L2_ubwy8xi8wuyukwh2.m3u8";
// var image = 'a04bb6a550853df8599931c86adbb425.png';

import videoPause from "assets/img/pause-normal.svg";
import videoPlay from "assets/img/play-normal.svg";
import halfScreen from "assets/img/half-screen.svg";
import fullScreen from "assets/img/fullscreen-normal.svg";

window.addEventListener("load", () => {
    main();
});

function main() {
    FastClick.attach(document.body);

    var isPrepared = false,
        isFullPlayClicked = false;

    var searchObj = GetQueryString();
    if (!searchObj || !searchObj.src) return;

    var webPlayer;
    if (
        userAgent.isIOS11() &&
        getVideoMIMEType(searchObj.src) === VIDEO_TYPE.HLS
    ) {
        // if(userAgent.isIOS11() && getVideoMIMEType(videoUrl) === VIDEO_TYPE.HLS){
        webPlayer = new CompatHlsPlayerExcept10(
            searchObj.src,
            RENDER_TYPE.MODE_SPHERE
        );
        // webPlayer = new CompatHlsPlayerExcept10(videoUrl, RENDER_TYPE.MODE_SPHERE);
    } else {
        webPlayer = new WebPlayer(
            searchObj.src,
            RENDER_TYPE.MODE_SPHERE,
            null,
            null,
            0.0
        );
        // webPlayer = new WebPlayer(videoUrl, RENDER_TYPE.MODE_SPHERE, null, null, 0.0);
    }

    webPlayer.setVideoEventCallback(function(what) {
        onVideoCallbackEvent(what);
    });
    var itemContainer = document.getElementById("itemContainer");
    var poster = document.getElementById("poster");
    var playBtn = document.getElementById("playBtn");
    var fullPlay = document.getElementById("fullPlay");
    var handGuide = document.getElementById("handGuide");
    var videoLoading = document.getElementById("videoLoading");
    var videoControls = document.getElementById("videoControls");
    var fullScreenBtn = document.getElementById("fullScreenBtn");
    var videoCurrentPosition = document.getElementById("videoCurrentPosition");
    var videoDuration = document.getElementById("videoDuration");
    var progressObtain = document.getElementById("progressObtain");
    var progressWrap = document.getElementById("progressWrap");
    var progress = document.getElementById("playProgress");
    var progressDot = document.getElementById("progressDot");
    var videoLoadingFailed = document.getElementById("videoLoadingFailed");

    if (searchObj && searchObj.poster) {
        poster.style.backgroundImage = "url(" + searchObj.poster + ")";
    }

    registerEvent();

    var progressIntervalID;
    var touchPressed = false;
    function registerEvent() {
        fullPlay.addEventListener("click", fullPlayFun, false);
        playBtn.addEventListener("click", playBtnFun, false);
        fullScreenBtn.addEventListener("click", fullScreenChangeFun, false);
        handGuide.addEventListener("click", handGuideFun, false);

        if (searchObj.type !== "live" || !searchObj.type) {
            progressObtain.addEventListener("mouseup", progressUpFun, false);
            progressObtain.addEventListener(
                "touchstart",
                progressStartFun,
                false
            );
            progressObtain.addEventListener(
                "touchmove",
                progressMoveFun,
                false
            );
            progressObtain.addEventListener("touchend", progressEndFun, false);
            setTimeInterval();
        } else {
            progressObtain.style.display = "none";
            videoCurrentPosition.style.display = "none";
            videoDuration.style.display = "none";
        }

        if (searchObj.fullScreen) {
            fullScreenFun();
        }

        if (searchObj.playing) {
            playBtnFun();
        }
    }

    function fullPlayFun() {
        if (webPlayer) {
            webPlayer.play();
        }
        isFullPlayClicked = true;

        fullPlay.style.display = "none";
        poster.style.display = "none";
        videoControls.style.opacity = "1";

        if (isPrepared) {
            handGuide.style.display = "block";
            setTimeout(function() {
                handGuide.style.display = "none";
            }, 3000);
        }

        if (userAgent.isX5PoweredBrowser()) {
            //X5播放时默认全屏，已规避局部播放时页面无法滑动的bug
            fullScreenBtn.parentNode.removeChild(fullScreenBtn);
            fullScreenFun();
        }
    }

    function playBtnFun() {
        if (webPlayer) {
            if (webPlayer.isPaused() || webPlayer.isEnded()) {
                webPlayer.play();
            } else {
                webPlayer.pause();
            }

            if (userAgent.isX5PoweredBrowser()) fullScreenFun();
        }
    }

    function handGuideFun() {
        handGuide.parentNode.removeChild(handGuide);
    }

    function resetFun() {
        if (webPlayer) webPlayer.align();
    }

    function monocularFun() {
        if (webPlayer) {
            if (webPlayer.getMonocular()) webPlayer.setMonocular(false);
            else webPlayer.setMonocular(true);
        }
    }

    function progressStartFun(e) {
        touchPressed = true;

        var touch = e.touches[0];
        var touchWidth = touch.pageX - progressWrap.offsetLeft;
        if (
            webPlayer &&
            touchWidth >= 0 &&
            touchWidth <= progressWrap.offsetWidth
        ) {
            videoCurrentPosition.innerHTML = formatDuring(
                (
                    touchWidth /
                    progressObtain.offsetWidth *
                    webPlayer.getDuration() *
                    1000
                ).toFixed(0)
            );
            progress.style.width = touchWidth + "px";
        }
    }

    function progressMoveFun(e) {
        e.preventDefault();
        e.stopPropagation();

        var touch = e.touches[0];
        var touchWidth = touch.pageX - progressWrap.offsetLeft;
        if (
            webPlayer &&
            touchWidth >= 0 &&
            touchWidth <= progressWrap.offsetWidth
        ) {
            videoCurrentPosition.innerHTML = formatDuring(
                (
                    touchWidth /
                    progressObtain.offsetWidth *
                    webPlayer.getDuration() *
                    1000
                ).toFixed(0)
            );
            progress.style.width = touchWidth + "px";
        }
    }

    function progressEndFun(e) {
        touchPressed = false;

        var touch = e.changedTouches[0];
        var touchWidth = touch.pageX - progressWrap.offsetLeft;
        if (
            webPlayer &&
            touchWidth >= 0 &&
            touchWidth <= progressWrap.offsetWidth
        ) {
            if (isPrepared || webPlayer.isPaused() || webPlayer.isEnded())
                webPlayer.play();

            if (userAgent.isX5PoweredBrowser()) fullScreenFun();

            var percent = touchWidth / progressWrap.offsetWidth;
            webPlayer.seekTo(percent * webPlayer.getDuration());
        }
    }

    function progressUpFun(e) {
        e.stopPropagation();

        if (!userAgent.isMobilePhone()) {
            var touchWidth = e.offsetX;
            if (
                webPlayer &&
                touchWidth >= 0 &&
                touchWidth <= progressWrap.offsetWidth
            ) {
                if (isPrepared || webPlayer.isPaused() || webPlayer.isEnded())
                    webPlayer.play();

                progress.style.width = touchWidth + "px";

                var percent = touchWidth / progressWrap.offsetWidth;
                webPlayer.seekTo(percent * webPlayer.getDuration());
            }
        }
    }

    function setTimeInterval() {
        clearInterval(progressIntervalID);
        progressIntervalID = setInterval(getProgress, 1000);
    }

    function getProgress() {
        if (webPlayer && isPrepared && !touchPressed) {
            if (
                webPlayer.getCurrentPosition() &&
                webPlayer.getCurrentPosition() !== Infinity &&
                webPlayer.getCurrentPosition() <= webPlayer.getDuration()
            ) {
                videoCurrentPosition.innerHTML = formatDuring(
                    (webPlayer.getCurrentPosition() * 1000).toFixed(0)
                );
                var percent =
                    webPlayer.getCurrentPosition() / webPlayer.getDuration();
                progress.style.width =
                    percent * progressWrap.offsetWidth + "px";
            }

            if (webPlayer.getDuration() && webPlayer.getDuration() !== Infinity)
                videoDuration.innerHTML = formatDuring(
                    (webPlayer.getDuration() * 1000).toFixed(0)
                );
        }
    }

    function fullScreenFun() {
        if (itemContainer) {
            if (!/fullScreen/.test(itemContainer.className)) {
                itemContainer.className += " fullScreen";
                itemContainer.style.height = "100vh";
                fullScreenBtn.style.backgroundImage = "url(" + halfScreen + ")";
                window.parent.postMessage({ isFullScreen: true }, "*");
            }
        }
    }
    function smallScreenFun() {
        if (itemContainer) {
            if (/fullScreen/.test(itemContainer.className)) {
                itemContainer.className = itemContainer.className.replace(
                    /fullScreen/,
                    ""
                );
                itemContainer.style.height = "56.25vw";
                fullScreenBtn.style.backgroundImage = "url(" + fullScreen + ")";
                window.parent.postMessage({ isFullScreen: false }, "*");
            }
        }
    }

    function requestfullscreen() {
        itemContainer.className += " fullScreen";
    }
    function exitfullscreen() {
        itemContainer.className = itemContainer.className.replace(
            /fullScreen/,
            ""
        );
    }

    function fullScreenChangeFun() {
        if (itemContainer) {
            if (/fullScreen/.test(itemContainer.className)) {
                itemContainer.className = itemContainer.className.replace(
                    /fullScreen/,
                    ""
                );
                window.parent.postMessage({ isFullScreen: false }, "*");
                itemContainer.style.height = "56.25vw";
                fullScreenBtn.style.backgroundImage = "url(" + fullScreen + ")";
            } else {
                itemContainer.className += " fullScreen";
                window.parent.postMessage({ isFullScreen: true }, "*");
                let containerHeight = Math.min(
                    window.outerHeight,
                    document.body.clientHeight
                );
                if (window.outerHeight == 0) {
                    window.Events.trigger("fullScreen", {});
                    containerHeight = Math.min(
                        window.innerHeight,
                        document.documentElement.clientHeight
                    );
                    if (userAgent.isSafari()) {
                        containerHeight =
                            Math.min(
                                window.innerHeight,
                                document.documentElement.clientHeight
                            ) -
                            69 / 628 * window.innerHeight;
                    }
                    // if (userAgent.isWechat() || userAgent.isQQ() || userAgent.isWeibo()) {
                    //     containerHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
                    // } else {
                    //     containerHeight = Math.min(window.innerHeight, document.documentElement.clientHeight) - (69/628) * window.innerHeight;
                    // }
                }

                itemContainer.style.height = containerHeight + "px";
                fullScreenBtn.style.backgroundImage = "url(" + halfScreen + ")";
            }
        }
    }

    function onVideoCallbackEvent(what) {
        console.log(what);

        switch (what) {
            case "enterfullscreen":
                break;

            case "exitfullscreen":
                smallScreenFun();
                break;

            case "loadeddata":
                isPrepared = true;

                if (isFullPlayClicked) {
                    handGuide.style.display = "block";
                    setTimeout(function() {
                        handGuide.parentNode.removeChild(handGuide);
                    }, 3000);
                }
                break;

            case "playing":
                videoLoading.style.display = "none";
                videoLoadingFailed.style.display = "none";
                playBtn.style.backgroundImage = "url(" + videoPause + ")";
                break;

            case "pause":
                playBtn.style.backgroundImage = "url(" + videoPlay + ")";
                break;

            case "waiting":
                //兼容ios10的微信不起播bug
                if (userAgent.isIOS10() && userAgent.isWechat()) {
                    setTimeout(function() {
                        webPlayer.pause();

                        setTimeout(function() {
                            webPlayer.play();
                        }, 10);
                    }, 10);
                }

                videoLoading.style.display = "flex";
                videoLoadingFailed.style.display = "none";
                break;

            case "error":
                videoLoadingFailed.style.display = "flex";
                videoLoading.style.display = "none";
                break;

            default:
                break;
        }
    }
}
