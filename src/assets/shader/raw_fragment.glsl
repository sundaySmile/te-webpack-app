precision mediump float;
precision mediump int;
uniform sampler2D texture;
varying vec2 vUV;
uniform bool is_ios_hls;
uniform bool is_osx_hls;
void main()	{

    if(is_ios_hls){
        gl_FragColor = texture2D(texture, vUV).bgra;
    }else{
        gl_FragColor = texture2D(texture, vUV).rgba;
    }
}