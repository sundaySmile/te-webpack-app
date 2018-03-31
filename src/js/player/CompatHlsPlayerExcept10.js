/**
 * Created by cjl on 2017/10/31.
 */

import { RENDER_TYPE } from '../utils/VideoType.js';

import enableInlineVideo from 'iphone-inline-video';

import StereoEffect from './StereoEffect.js';
import TouchControls from './TouchControls.js';
import DeviceOrientationControls from './DeviceOrientationControls.js';

/***
 * 此类用于兼容ios9、ios11下播放hls视频黑屏的bug
 * 因为使用canvas.drawImage(),所以性能会有问题，发热量相对较大
*/
export default function CompatHlsPlayerExcept10 (videoUrl, renderType) {

    var canvas, context;
    
    var video, videoWidth, videoHeight;
    var texture;
    var isPrepared = false;

    var onVideoEventCallback;

    var camera;
    var scene;
    var renderer;
    var renderModel;

    var touchControls;
    var headControls;
    var stereoEffect;
    var isMonocular = true;

    var currentFov = 90, lookAtY = 0,  modelOriginY = - Math.PI / 2, rotateY = 0;

    var renderContainer = document.getElementById('itemContainer');
    var screenWidth = renderContainer.clientWidth, screenHeight = renderContainer.clientHeight;

    var that = this;

    initVideo();
    initRender();
    animate();

    function initVideo() {

        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');

        video = document.createElement('video');
        video.crossOrigin = 'anonymous';//允许video跨域访问资源
        video.src = videoUrl;
        video.preload = 'none';
        video.autoplay = false;
        video.loop = false;
        video.controls = 'none';
        video.setAttribute('playsinline', true);
        video.setAttribute('webkit-playsinline', true);
        enableInlineVideo(video);
        
        video.addEventListener('loadeddata',function(){
            isPrepared = true;
            canvas.width = videoWidth = video.videoWidth;
            canvas.height  = videoHeight = video.videoHeight;
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
    }

    function initRender() {

        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(currentFov, renderContainer.clientWidth / renderContainer.clientHeight, 0.001, 1000);
        camera.position.set(0, 0, 0);
        camera.lookAt(new THREE.Vector3(0, 0, -1));
        scene.add(camera);
    
        renderer = new THREE.WebGLRenderer();
        renderer.antialias = true;
        renderer.setClearColor(0x000000);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(screenWidth, screenHeight);
        renderContainer.appendChild(renderer.domElement);

        stereoEffect = new StereoEffect(renderer);//VR模式
        stereoEffect.setSize(screenWidth, screenHeight);
        headControls = new DeviceOrientationControls(camera, true);
        headControls.registerEvent();
        headControls.update();
        touchControls = new TouchControls(that, renderer);//滑动转向
        touchControls.registerEvent();

        texture = new THREE.VideoTexture(canvas); //注意这里是canvas生成纹理，使用Video会黑屏
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        texture.generateMipmaps = false;

        var geometry = new THREE.SphereGeometry(200, 200, 200);
        var material = new THREE.MeshBasicMaterial();
        material.map = texture;
        renderModel = new THREE.Mesh(geometry, material);
        renderModel.scale.x = -1; //使得球外部贴图渲染在内部
        scene.add(renderModel);
    }
    
    function animate() {
        requestAnimationFrame(animate);

        if(screenWidth != renderContainer.clientWidth || screenHeight != renderContainer.clientHeight) {
            screenWidth = renderContainer.clientWidth;
            screenHeight = renderContainer.clientHeight;

            camera.aspect = screenWidth / screenHeight;
            camera.updateProjectionMatrix();//更新投影矩阵

            renderer.setSize(screenWidth, screenHeight);
            stereoEffect.setSize(screenWidth, screenHeight);
        }

        if(screenWidth >= screenHeight)
            camera.fov = currentFov;
        else
            camera.fov = currentFov + ((screenHeight - screenWidth) / screenWidth) * 30;

        headControls.update();//此类在调用时必定是在ios移动设备上

        if(renderModel)
            renderModel.rotation.y =  renderModel.rotation.y + ((modelOriginY + rotateY) - renderModel.rotation.y) * 0.1;
        
        if(video && !video.paused && !video.ended && isPrepared ){//更新纹理数据
            context.drawImage(video, 0, 0, videoWidth, videoHeight);
            renderModel.material.map.needsUpdate = true;
        }

        if(isMonocular)
            renderer.render(scene, camera);
        else
            stereoEffect.render(scene, camera);
    }

    
    this.setVideoEventCallback = function (callback) {
        onVideoEventCallback = callback;
    };

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

    this.getRenderDom = function () {
        if(renderer)
            return renderer.domElement;
        else
            return null;
    }

    this.align = function () {
        if (headControls) {
            rotateY = 0;
            if(renderModel)
                renderModel.rotation.y =  renderModel.rotation.y % 360;

            headControls.align();
        }
    }

    this.rotate = function (xDeltaValue, yDeltaValue) {

        if(headControls){
            if(headControls.getScreenOrientation() === 0) {//手机浏览器为竖屏时可能为"锁定旋转"状态，这时有四种情况
                switch (headControls.getDeviceOrientation()) {
                    case 0:
                        rotateY += xDeltaValue / 100;
                        break;
                    case 180:
                        rotateY -= xDeltaValue / 100;
                        break;
                    case 90:
                        rotateY += yDeltaValue / 100;
                        break;
                    case -90:
                        rotateY -= yDeltaValue / 100;
                        break;
                }
            }else {//非竖屏则手机肯定属于"非锁定屏幕"状态，故只有一种情况
                rotateY -= xDeltaValue / 100;
            }
        }
    }

    this.setMonocular = function (bool) {
        isMonocular = bool;
    }
    this.getMonocular = function () {
        return isMonocular;
    }
}