/**
 * Created by cjl on 2017/7/26.
 */

export default function TouchControls(object, renderer) {

    this.object = object;
    this.renderer = renderer;

    this.registerEvent = () => {
        this.renderer.domElement.addEventListener('mousedown', mouseDownFunc, false);

        this.renderer.domElement.addEventListener('touchstart', touchStartFunc, false);
        this.renderer.domElement.addEventListener('touchmove', touchMoveFunc, false);
        this.renderer.domElement.addEventListener('touchend', touchEndFunc, false);
    };

    /**---------------- 触摸滑动-------------------*/

    var lastTouchX = 0, lastTouchY = 0;
    var touchStartFunc = (evt) => {
        try {
            var touch = evt.touches[0];
            lastTouchX = Number(touch.pageX);
            lastTouchY = Number(touch.pageY);

        } catch (e) {
            alert('touchEndFunc：' + e.message);
        }
    };

    var touchMoveFunc = (evt) => {
        try {
            /**终止触摸事件继续派发*/
            evt.preventDefault();
            evt.stopPropagation();

            var touch = evt.touches[0];
            var x = Number(touch.pageX);
            var y = Number(touch.pageY);

            if (this.object)
                this.object.rotate(x - lastTouchX, y - lastTouchY);//旋转画面

            lastTouchX = x;
            lastTouchY = y;

        } catch (e) {
            alert('touchMoveFunc：' + e.message);
        }
    };

    var lastTouchEnd = 0;
    var touchEndFunc = (evt) => {

        //禁止页面双击事件
        var now = (new Date()).getTime();
        if(now - lastTouchEnd <= 300){
            evt.preventDefault();
        }
        lastTouchEnd = now;
    };

    /**---------------- 鼠标滑动-------------------*/

    var lastMouseX = 0, lastMouseY = 0;
    var mouseDownFunc = (evt) => {

        this.renderer.domElement.addEventListener('mousemove', mouseMoveFunc, false);
        this.renderer.domElement.addEventListener('mouseup', mouseUpFunc, false);
        this.renderer.domElement.addEventListener('mouseout', mouseOutFunc, false);

        try {
            lastMouseX = evt.clientX;
            lastMouseY = evt.clientY;

        } catch (e) {
            alert('mouseMoveFunc：' + e.message);
        }
    };

    var mouseMoveFunc = (evt) => {
        try {
            var x = evt.clientX;
            var y = evt.clientY;

            if (this.object)
                this.object.rotate(x - lastMouseX, y - lastMouseY);//旋转画面

            lastMouseX = x;
            lastMouseY = y;

        } catch (e) {
            alert('mouseMoveFunc：' + e.message);
        }
    };

    var mouseUpFunc = (evt) => {

        this.renderer.domElement.removeEventListener( 'mousemove', mouseMoveFunc, false );
        this.renderer.domElement.removeEventListener( 'mouseup', mouseUpFunc, false );
        this.renderer.domElement.removeEventListener( 'mouseout', mouseOutFunc, false );
    };

    var mouseOutFunc = (evt) => {

        this.renderer.domElement.removeEventListener( 'mousemove', mouseMoveFunc, false );
        this.renderer.domElement.removeEventListener( 'mouseup', mouseUpFunc, false );
        this.renderer.domElement.removeEventListener( 'mouseout', mouseOutFunc, false );
    };
}