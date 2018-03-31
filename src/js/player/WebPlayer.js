/**
 * Created by cjl on 2017/7/14.
 */

import PanoVideoRender from './PanoVideoRender.js';
import RectVideoRender from './RectVideoRender.js';
import * as userAgent from '../utils/UserAgent.js';
import { getVideoMIMEType, VIDEO_TYPE, RENDER_TYPE} from '../utils/VideoType.js';
import enableInlineVideo from 'iphone-inline-video';


export default function WebPlayer(videoUrl, renderType, backImgSrc, bottomImgSrc, bottomImgScale) {

    var video = document.createElement('video');
    video.crossOrigin = 'anonymous';//允许video跨域访问资源
    video.src = videoUrl;
    video.preload = 'none';
    video.autoplay = false;
    video.loop = false;
    video.controls = 'none';
    video.setAttribute('playsinline', true);
    video.setAttribute('webkit-playsinline', true);
    enableInlineVideo(video);

    if(userAgent.isX5PoweredBrowser()) {//兼容android端X5内核浏览器的video标签自动跳转自己播放器的情况
        video.setAttribute('preload', 'auto');
        video.setAttribute('x-webkit-airplay', 'allow');
        video.setAttribute('x5-video-player-type', 'h5');
        video.setAttribute('x5-video-player-fullscreen', true);
    }

    if (getVideoMIMEType(videoUrl) === VIDEO_TYPE.HLS && Hls.isSupported() && !userAgent.isSafari() && !userAgent.isIOS() ){//ios的设备浏览器无需加载hls插件
        var hls = new Hls();
        hls.loadSource(video.src);
        hls.attachMedia(video);
    }

    var videoRender;
    if(renderType === RENDER_TYPE.MODE_RECTANGLE || renderType === RENDER_TYPE.MODE_RECTANGLE_STEREO || renderType === RENDER_TYPE.MODE_RECTANGLE_STEREO_TD){
        videoRender = new RectVideoRender(video, renderType);
    } else {
        videoRender = new PanoVideoRender(video, renderType, backImgSrc, bottomImgSrc, bottomImgScale);
    }

    var onVideoEventCallback;

    this.setVideoEventCallback = function (callback) {
        onVideoEventCallback = callback;
    };

    video.addEventListener('x5videoenterfullscreen', function(){
        onVideoEventCallback('enterfullscreen');
    });

    video.addEventListener('x5videoexitfullscreen', function(){
        onVideoEventCallback('exitfullscreen');
    });

    video.addEventListener('loadeddata',function(){
        onVideoEventCallback('loadeddata');
    },false);

    video.addEventListener('playing',function(){
        onVideoEventCallback('playing');
    },false);

    video.addEventListener('pause',function(){
        onVideoEventCallback('pause');
    },false);

    video.addEventListener('waiting',function(){
        onVideoEventCallback('waiting');
    },false);

    video.addEventListener('error',function(){
        onVideoEventCallback('error');
    },false);

    this.getRenderDom = function () {

        if(videoRender)
            return videoRender.getRenderDom();
        else
            return null;
    }

    this.isPaused = function () {
        if(video)
            return video.paused;
        else
            return true;
    }

    this.isEnded = function () {
        if(video)
            return video.ended;
        else
            return true;
    }

    this.getCurrentPosition = function () {
        if(video)
            return video.currentTime;
        else
            return 0;
    }

    this.getDuration = function () {
        if(video)
            return video.duration;
        else
            return 0;
    }

    this.seekTo = function (time) {
        if(video)
            video.currentTime = time;
    }

    this.play = function () {
        if(video)
            video.play();
    }

    this.pause = function () {
        if(video)
            video.pause();
    }

    this.align = function () {
        if(videoRender)
            videoRender.align();
    }

    this.rotate = function (xDeltaValue, yDeltaValue) {
        if(videoRender)
            videoRender.rotate(xDeltaValue, yDeltaValue);
    }

    this.setMonocular = function (bool) {
        if(videoRender)
            videoRender.setMonocular(bool);
    }

    this.getMonocular = function () {
        if(videoRender)
            return videoRender.getMonocular();
        else
            return true;
    }
}


