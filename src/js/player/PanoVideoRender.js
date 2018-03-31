/**
 * Created by cjl on 2017/7/14.
 */

import vertexShader from '../../assets/shader/vertex.glsl';
import fragmentShader from '../../assets/shader/fragment.glsl';
import rawVertexShader from '../../assets/shader/raw_vertex.glsl';
import rawFragmentShader from '../../assets/shader/raw_fragment.glsl';

import * as userAgent from '../utils/UserAgent.js';
import { getVideoMIMEType, VIDEO_TYPE, RENDER_TYPE } from '../utils/VideoType.js';

import StereoEffect from './StereoEffect.js';
import TouchControls from './TouchControls.js';
import DeviceOrientationControls from './DeviceOrientationControls.js';

export default function PanoVideoRender(video, renderType, backImgSrc, bottomImgSrc, bottomImgScale) {

    var scene;//仅方法内使用的变量可直接用var定义，实例化对象调用的属性则使用this。
    var camera;
    var renderer;

    var touchControls;
    var headControls;
    var stereoEffect;
    var isMonocular = true;

    var currentFov = 90, lookAtY = 0, modelOriginY = 0, rotateY = 0;

    var renderContainer = document.getElementById('itemContainer');
    var screenWidth = renderContainer.clientWidth, screenHeight = renderContainer.clientHeight;

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
    if(userAgent.isMobilePhone()){//移动设备
        headControls = new DeviceOrientationControls(camera, true);
        headControls.registerEvent();
        headControls.update();
    }
    touchControls = new TouchControls(this, renderer);//滑动转向
    touchControls.registerEvent();

    /**Video纹理*/
    var texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBAFormat;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    // var texture = ImageUtils.loadTexture('65d3d2c9aaee2ff35e1f30714d71d2c7.jpg');

    var renderModel;
    if(renderType === RENDER_TYPE.MODE_SPHERE) {
        /**球模型*/
        var sphereMaterial;
        if (userAgent.isIOS() && getVideoMIMEType(video.src) === VIDEO_TYPE.HLS) {
            texture.flipY = false; //这样设置是为了解决ios设备浏览器播放hls黑屏的bug
            sphereMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: true},
                    is_osx_hls: {value: false}
                },
                vertexShader,
                fragmentShader
            });
        } else if (userAgent.isSafari() && getVideoMIMEType(video.src) === VIDEO_TYPE.HLS) {
            texture.flipY = false;
            sphereMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: false},
                    is_osx_hls: {value: true}
                },
                vertexShader,
                fragmentShader
            });
        } else {
            sphereMaterial = new THREE.MeshBasicMaterial({
                map: texture
            });
        }
        var sphereGeometry = new THREE.SphereGeometry(1, 60, 30);

        renderModel = new THREE.Mesh(sphereGeometry, sphereMaterial);
        renderModel.scale.x = -1;//现在是在内部看向球外,所以将sphere的scale翻转-1,使得球的外表面变成里表面。

        modelOriginY = - Math.PI / 2;
        renderModel.rotation.y = modelOriginY;
        renderModel.position.set(0, 0, 0);
        scene.add(renderModel);

    } else if(renderType === RENDER_TYPE.MODE_OCTAHEDRON) {
        /**八面体模型*/
        var GEN2 = 1.414214;
        var offset_short = 0.0016;//三角形画面缩小偏移值
        var offset_long = 0.0024;//y=0.5时的画面偏移值
        var offset_m = offset_short+offset_long/2.0;
        var offset_n = 2.0*offset_short;

        var vertexArray = new Array(
            0, GEN2, -0,//5
            0, -0.0, 1.0,//8
            -1.0, -0.0, 1.0,//4

            -1.0, 0.0, -1.0,//1
            -1.0, 0.0, 1.0, //4
            0, -GEN2, 0,//6

            0, GEN2, 0,//5
            -1.0, -0.0, -1.0,//1
            1.0, -0.0, -1.0,//2

            1.0, 0.0, 1.0, //3
            1.0, 0.0, -1.0,//2
            -0, -GEN2, 0,//6

            0, GEN2, -0,//5
            1.0, -0.0, 1.0, //3
            0, -0.0, 1.0, //8

            -1.0, 0.0, 1.0,//4
            0, 0.0, 1.0,//8
            0, -GEN2, -0, //6

            0, GEN2, 0,//5
            -1.0, -0.0, 1.0, //4
            -1.0, -0.0, -1.0,//1

            1.0, 0.0, -1.0,//2
            -1.0, 0.0, -1.0, //1
            0, -GEN2, 0, //6

            -0, GEN2,  0,//5
            1.0, -0.0, -1.0, //2
            1.0, -0.0, 1.0,//3

            0, 0.0,  1.0,//8
            1.0, 0.0, 1.0, //3
            0, -GEN2, -0//6
        );

        var textureArray = new Array(
            0.0,           0.0+offset_n, //5
            0.0,           0.5-offset_long,//8
            0.25-offset_m, 0.5-offset_long,//4

            0.5-offset_m,  0.0+offset_long,//1
            0.0+offset_m,  0.0+offset_long, //4
            0.25,          0.5-offset_n, //6

            0.5,           0.0+offset_n,//5
            0.25+offset_m, 0.5-offset_long,//1
            0.75-offset_m, 0.5-offset_long, //2

            1.0-offset_m,  0.0+offset_long,//3
            0.5+offset_m,  0.0+offset_long,//2
            0.75,          0.5-offset_n,//6

            1.0,           0.0+offset_n, //5
            0.75+offset_m, 0.5-offset_long,//3
            1.0,           0.5-offset_long, //8

            0.25-offset_m, 0.5+offset_long,//4
            0.0,           0.5+offset_long,//8
            0,              1.0-offset_n,//6

            0.25,          0.5+offset_n,//5
            0.0+offset_m,  1.0-offset_long,//4
            0.5-offset_m,  1.0-offset_long,//1

            0.75-offset_m, 0.5+offset_long, //2
            0.25+offset_m, 0.5+offset_long,//1
            0.5,           1.0-offset_n,//6

            0.75,          0.5+offset_n,//5
            0.5+offset_m,  1.0-offset_long, //2
            1.0-offset_m,  1.0-offset_long,//3

            1.0,           0.5+offset_long,//8
            0.75+offset_m, 0.5+offset_long, //3
            1.0,           1.0-offset_n//6
        );

        var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array(vertexArray);
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        var textureCoords = new Float32Array(textureArray);
        geometry.addAttribute('uv', new THREE.BufferAttribute(textureCoords, 2, true));

        var material;
        if (userAgent.isIOS() && getVideoMIMEType(video.src) === VIDEO_TYPE.HLS) {
            texture.flipY = false; //这样设置是为了解决ios设备浏览器播放hls黑屏的bug
            material = new THREE.RawShaderMaterial({//注意这里使用RawShaderMaterial
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: true},
                    is_osx_hls: {value: false}
                },
                vertexShader: rawVertexShader,
                fragmentShader: rawFragmentShader
            });
        } else if (userAgent.isSafari() && getVideoMIMEType(video.src) === VIDEO_TYPE.HLS) {
            texture.flipY = false;
            material = new THREE.RawShaderMaterial({
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: false},
                    is_osx_hls: {value: true}
                },
                vertexShader: rawVertexShader,
                fragmentShader: rawFragmentShader
            });
        } else {
            material = new THREE.RawShaderMaterial({
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: false},
                    is_osx_hls: {value: false}

                },
                vertexShader: rawVertexShader,
                fragmentShader: rawFragmentShader
            });
        }

        renderModel = new THREE.Mesh(geometry, material);
        modelOriginY = 0;
        renderModel.rotation.y = modelOriginY;
        scene.add(renderModel);

    } else if(renderType === RENDER_TYPE.MODE_HALF_SPHERE) {
        /**半球模型*/
        var sphereMaterial;
        if (userAgent.isIOS() && getVideoMIMEType(video.src) === VIDEO_TYPE.HLS) {
            texture.flipY = false;
            sphereMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: true},
                    is_osx_hls: {value: false}
                },
                vertexShader,
                fragmentShader
            });
        } else if (userAgent.isSafari() && getVideoMIMEType(video.src) === VIDEO_TYPE.HLS) {
            texture.flipY = false;
            sphereMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    texture: {value: texture},
                    is_ios_hls: {value: false},
                    is_osx_hls: {value: true}
                },
                vertexShader,
                fragmentShader
            });
        } else {
            sphereMaterial = new THREE.MeshBasicMaterial({
                map: texture
            });
        }
        var sphereGeometry = new THREE.SphereGeometry(1, 30, 30, 0, Math.PI);

        renderModel = new THREE.Mesh(sphereGeometry, sphereMaterial);
        renderModel.scale.x = -1;//现在是在内部看向球外,所以将sphere的scale翻转-1,使得球的外表面变成里表面。

        modelOriginY = - Math.PI;
        renderModel.rotation.y = modelOriginY;
        renderModel.position.set(0, 0, 0);
        scene.add(renderModel);
    }

    var backModel;
    if(backImgSrc) {
        /**180背景图*/
        var backGeometry = new THREE.SphereGeometry(1, 30, 30, 0, Math.PI);
        var backTexture = ImageUtils.loadTexture(backImgSrc);
        var backMaterial = new THREE.MeshBasicMaterial({
            map: backTexture
        });
        backModel = new THREE.Mesh(backGeometry, backMaterial);
        backModel.scale.x = -1;
        backModel.position.set(0, 0, 0);
        scene.add(backModel);
    }

    var bottomModel;
    if(bottomImgSrc) {
        /**中心底图*/
        var panelScale = Math.sqrt(1 - Math.pow(bottomImgScale, 2)) * 2;
        var bottomGeometry = new THREE.PlaneGeometry(panelScale, panelScale);
        var bottomTexture = ImageUtils.loadTexture(bottomImgSrc);
        var bottomMaterial = new THREE.MeshBasicMaterial({
            map: bottomTexture,
            depthTest: false, //关闭深度缓存
            transparent: true //允许png透明纹理
        });
        bottomModel = new Mesh(bottomGeometry, bottomMaterial);
        bottomModel.rotation.x = -Math.PI / 2;
        bottomModel.position.set(0, -bottomImgScale, 0);
        scene.add(bottomModel);
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

        if(userAgent.isMobilePhone())
            headControls.update();
        if(renderModel)
            renderModel.rotation.y =  renderModel.rotation.y + ((modelOriginY + rotateY) - renderModel.rotation.y) * 0.1;

        if(backModel)
            backModel.rotation.y = backModel.rotation.y + (rotateY - backModel.rotation.y) * 0.1;
        if(bottomModel)
            bottomModel.rotation.z = backModel.rotation.y + (rotateY - backModel.rotation.y) * 0.1;

        if(isMonocular)
            renderer.render(scene, camera);
        else
            stereoEffect.render(scene, camera);
    }

    animate();

    this.getRenderDom = function () {
        if(renderer)
            return renderer.domElement;
        else
            return null;
    }

    this.align = function () {
        if(userAgent.isMobilePhone()) {
            if (headControls) {
                rotateY = 0;
                if(renderModel)
                    renderModel.rotation.y =  renderModel.rotation.y % 360;

                headControls.align();
            }
        }else {
            rotateY = 0;
            if(renderModel)
                renderModel.rotation.y =  renderModel.rotation.y % 360;

            lookAtY = 0;
            camera.lookAt(new THREE.Vector3(0, 0, -1));
        }
    }

    this.rotate = function (xDeltaValue, yDeltaValue) {

        if (userAgent.isMobilePhone()) {
            if(headControls){

                if(headControls.getScreenOrientation() === 0) {//手机浏览器为竖屏时可能为"锁定旋转"状态，这时有四种情况
                    switch (headControls.getDeviceOrientation()) {
                        case 0:
                            if(userAgent.isAndroid()) {
                                rotateY -= xDeltaValue / 100;
                            } else {
                                rotateY += xDeltaValue / 100;
                            }
                            break;
                        case 180:
                            if(userAgent.isAndroid()) {
                                rotateY += xDeltaValue / 100;
                            } else {
                                rotateY -= xDeltaValue / 100;
                            }
                            break;
                        case 90:
                            if(userAgent.isAndroid()) {
                                rotateY -= yDeltaValue / 100;
                            } else {
                                rotateY += yDeltaValue / 100;
                            }
                            break;
                        case -90:
                            if(userAgent.isAndroid()) {
                                rotateY += yDeltaValue / 100;
                            } else {
                                rotateY -= yDeltaValue / 100;
                            }
                            break;
                    }
                }else {//非竖屏则手机肯定属于"非锁定屏幕"状态，故只有一种情况
                    if(userAgent.isAndroid()) {
                        rotateY -= xDeltaValue / 100;
                    } else {
                        rotateY -= xDeltaValue / 100;
                    }
                }
            }
        } else {
            /**
             * pc浏览器滑动
             * 旋转球模型调整左右视角滑动
             * 通过LookAt矩阵调整上下视角滑动
             * */
            rotateY -= xDeltaValue / 500;

            lookAtY += yDeltaValue / 500;
            if(lookAtY > Math.PI/2) {
                lookAtY = Math.PI / 2;
            }
            if(lookAtY < -Math.PI/2) {
                lookAtY = -Math.PI / 2;
            }
            camera.lookAt(new THREE.Vector3(0, Math.tan(lookAtY), -1));
        }
    }

    this.setMonocular = function (bool) {
        isMonocular = bool;
    }
    this.getMonocular = function () {
        return isMonocular;
    }
}