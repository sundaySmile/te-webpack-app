precision mediump float;
precision mediump int;
uniform mat4 modelViewMatrix; // optional
uniform mat4 projectionMatrix; // optional
uniform bool is_ios_hls;
uniform bool is_osx_hls;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUV;
void main()	{

    if(is_ios_hls || is_osx_hls){
        vUV = vec2(uv.x, uv.y);
    }else{
        vUV = vec2(uv.x, 1.0 - uv.y);
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
}