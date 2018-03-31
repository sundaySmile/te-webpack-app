varying vec2 vUV;
uniform bool is_ios_hls;
uniform bool is_osx_hls;
void main() {

    if(is_ios_hls || is_osx_hls){
        vUV = vec2(uv.x, 1.0 - uv.y);
    }else{
        vUV = vec2(uv.x, uv.y);
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}