/**
 * Created by cjl on 2017/7/14.
 */

export default function DeviceOrientationControls(camera) {

    this.deviceOrientation = {};//json形式创建空对象
    this.screenOrientation = 0;
    this.deviceOrientationAngle = 0;

    var onDeviceOrientationChangeEvent = (eventData) => {
        this.deviceOrientation = eventData;
    };

    var getOrientation = () => {
        switch (window.screen.orientation || window.screen.mozOrientation) {
            case 'landscape-primary':
                return 90;
            case 'landscape-secondary':
                return -90;
            case 'portrait-secondary':
                return 180;
            case 'portrait-primary':
                return 0;
        }

        return window.orientation || 0;
    };

    var onScreenOrientationChangeEvent = () => {
        this.screenOrientation = getOrientation();
    };

    var onDeviceMotionChangeEvent = (eventData) => {
        var acceleration = eventData.accelerationIncludingGravity;

        var x = acceleration.x;
        var y = acceleration.y;

        if (Math.abs(y) >= Math.abs(x)) {
            if (y >= 0) {
                this.deviceOrientationAngle = 0;//portrait
            } else {
                this.deviceOrientationAngle = 180;//portrait_upsidedown
            }

        } else {
            if (x >= 0) {
                this.deviceOrientationAngle = 90;//landscape_left
            } else {
                this.deviceOrientationAngle = -90;//landscape_right
            }
        }
    };

    this.registerEvent = () => {

        /**
         * 使用箭头函数的目的：
         * window.addEventListener()时函数的this指向windows，故而在函数内部处理this的变量是不是实例对象的成员变量，
         * 而箭头函数的this指针取决于其在哪里定义，而不是在哪里调用，股此时this指向当前实例对象。
         * */
        window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);//获取方向传感器数据
        window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);//计算屏幕方向
        window.addEventListener('devicemotion', onDeviceMotionChangeEvent, false);//计算手机的绝对姿态
    };


    this.camera = camera;//传入的camera
    this.camera.rotation.reorder('YXZ');

    this.autoAlign = true;//初始化camera起始方向

    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;
    this.orient = 0;

    this.alignQuaternion = new THREE.Quaternion();
    this.orientationQuaternion = new THREE.Quaternion();

    var quaternion = new THREE.Quaternion();
    var quaternionSlerp = new THREE.Quaternion();

    var tempVector3 = new THREE.Vector3();
    var tempMatrix4 = new THREE.Matrix4();
    var tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    var tempQuaternion = new THREE.Quaternion();

    var zee = new THREE.Vector3(0, 0, 1);
    var up = new THREE.Vector3(0, 1, 0);
    var v0 = new THREE.Vector3(0, 0, 0);
    var euler = new THREE.Euler();
    var q0 = new THREE.Quaternion();
    var q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));//四元数够构造函数实际表示为:(x*sin(θ/2), y*sin(θ/2), z*sin(θ/2), cos(θ/2));

    this.update = function(delta) {//定义对象属性方法,注意自执行函数

        this.alpha = this.deviceOrientation.gamma ? THREE.Math.degToRad(this.deviceOrientation.alpha) : 0; // Z
        this.beta = this.deviceOrientation.beta ? THREE.Math.degToRad(this.deviceOrientation.beta) : 0; // X'
        this.gamma = this.deviceOrientation.gamma ? THREE.Math.degToRad(this.deviceOrientation.gamma) : 0; // Y''
        this.orient = this.screenOrientation ? THREE.Math.degToRad(this.screenOrientation) : 0; // O

        euler.set(this.beta, this.alpha, - this.gamma, 'YXZ');

        quaternion.setFromEuler(euler);//从欧拉角转为四元数
        quaternionSlerp.slerp(quaternion, 0.5); //四元数旋转球面插值：这里t=0,则返回quaternionSlerp本身; 当t=1时,则返回目标四元数quaternion;
        //这里t=0.5,则为两者的球面插值的中间值。这样做的目的放慢旋转速度，使旋转更为顺滑。

        if (this.autoAlign)
            this.orientationQuaternion.copy(quaternion);
        else
            this.orientationQuaternion.copy(quaternionSlerp);

        this.orientationQuaternion.multiply(q1);//q1表示为绕(-1,0,0)旋转90度。原本camera看向y轴正方向，现改为z轴负方向;
        this.orientationQuaternion.multiply(q0.setFromAxisAngle(zee, - this.orient));//"轴角法"表示四元数,这里矫正屏幕方向

        this.camera.quaternion.copy(this.alignQuaternion);
        this.camera.quaternion.multiply(this.orientationQuaternion);


        if (this.autoAlign && this.alpha !== 0) {

            this.autoAlign = false;
            this.align();
        }
    };

    //页面初始化时会初始化camera起始方向;注意这里仅调整camera方向，camera位置不变
    this.align = function() {

        tempVector3
            .set(0, 0, 1)//仅调整camera在x-z平面上的方向(这里camera看向原点,即表示看向x轴负方向)
            .applyQuaternion( tempQuaternion.copy(this.orientationQuaternion).inverse(), 'ZXY' );

        tempEuler.setFromQuaternion(tempQuaternion.setFromRotationMatrix(tempMatrix4.lookAt(tempVector3, v0, up)));//视图矩阵

        tempEuler.set(0, tempEuler.y, 0);
        this.alignQuaternion.setFromEuler(tempEuler);

    };

    this.getDeviceOrientation = function () {
        return this.deviceOrientationAngle;
    };

    this.getScreenOrientation = function () {
        return this.screenOrientation;
    };
}
