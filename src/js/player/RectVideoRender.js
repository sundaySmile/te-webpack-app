/**
 * Created by cjl on 2017/8/28.
 */

import vertexShader from '../../assets/shader/vertex.glsl';
import fragmentShader from '../../assets/shader/fragment.glsl';

import * as userAgent from '../utils/UserAgent.js';
import { getVideoMIMEType, VIDEO_TYPE, RENDER_TYPE } from '../utils/VideoType.js';

import StereoEffect from './StereoEffect.js';

export default function RectVideoRender(video, renderType) {

    var scene;
    var camera;
    var renderer;

    var isMonocular = true;

    var renderContainer = document.getElementById('itemContainer');
    var screenWidth = renderContainer.clientWidth, screenHeight = renderContainer.clientHeight;

    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10); //设置成0.5的目的就是使得正交投影的画面宽高固定在1单位，便于后期Plane模型的宽高设置
    camera.position.set(0, 0, 0);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.antialias = true;
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(screenWidth, screenHeight);
    renderContainer.appendChild(renderer.domElement);

    /**Video纹理*/
    var texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBAFormat;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    var renderModel;
    if(renderType === RENDER_TYPE.MODE_RECTANGLE){
        /**平面模型*/
        var rectangleMaterial;
        if (userAgent.isIOS() && getVideoMIMEType(video.src) === VIDEO_TYPE.HLS) {
            texture.flipY = false; //这样设置是为了解决ios设备浏览器播放hls黑屏的bug
            rectangleMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: true},
                    is_osx_hls: {value: false}
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            });
        } else if (userAgent.isSafari() && getVideoMIMEType(video.src) === VIDEO_TYPE.HLS) {
            texture.flipY = false;
            rectangleMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: false},
                    is_osx_hls: {value: true}
                },
                vertexShader,
                fragmentShader
            });
        } else {
            rectangleMaterial = new THREE.MeshBasicMaterial({
                map: texture
            });
        }
        var rectangleGeometry = new THREE.PlaneGeometry(1, 1);

        renderModel = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
        renderModel.position.set(0, 0, -5);
        scene.add(renderModel);
    }

    function animate() {
        requestAnimationFrame(animate);

        if(screenWidth != renderContainer.clientWidth || screenHeight != renderContainer.clientHeight) {
            screenWidth = renderContainer.clientWidth;
            screenHeight = renderContainer.clientHeight;

            renderer.setSize(screenWidth, screenHeight);
        }

        var videoWidth =  video.videoWidth;
        var videoHeight =  video.videoHeight;

        var screenRatio = screenWidth/screenHeight;
        var videoRatio = videoWidth/videoHeight;

        if(screenRatio >= videoRatio) {
            renderModel.scale.x = videoRatio / screenRatio;
            renderModel.scale.y = 1;
        } else {
            renderModel.scale.x = 1;
            renderModel.scale.y = screenRatio / videoRatio;
        }

        renderer.render(scene, camera);
    }

    animate();

    this.getRenderDom = function () {
        if(renderer)
            return renderer.domElement;
        else
            return null;
    }

    this.align = function () {
    }

    this.rotate = function (xDeltaValue, yDeltaValue) {
    }

    this.setMonocular = function (bool) {
        isMonocular = bool;
    }
    this.getMonocular = function () {
        return isMonocular;
    }
}