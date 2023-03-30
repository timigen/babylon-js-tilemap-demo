import { Matrix, Tools, Vector3 } from "@babylonjs/core";
import { ECameraMovement } from "./ECameraMovement";

export class FreeCameraKeyboardInput {
    public _keys = [];
    public keysUp = [38, 87]; // arrowUp, w
    public keysDown = [40, 83]; // arrowDown, s
    public keysLeft = [37, 65]; // arrowLeft, a
    public keysRight = [39, 68]; // arrowRight, d
    public rotateKeysLeft = [81]; // q
    public rotateKeysRight = [69]; // e
    public _onKeyDown;
    public _onKeyUp;
    public camera;

    constructor(camera) {
        this.camera = camera;
    }


    public attachControl (noPreventDefault) {
        var engine = this.camera.getEngine();
        var element = engine.getInputElement();
        if (!this._onKeyDown) {
            element.tabIndex = 1;
    
            this._onKeyDown = (evt) => {                 
                if ((this.keysUp.indexOf(evt.keyCode) !== -1 ||
                    this.keysDown.indexOf(evt.keyCode) !== -1 ||
                    this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                    this.rotateKeysLeft.indexOf(evt.keyCode) !== -1 ||
                    this.rotateKeysRight.indexOf(evt.keyCode) !== -1 ||
                    this.keysRight.indexOf(evt.keyCode) !== -1)) {
                    var index = this._keys.indexOf(evt.keyCode);
                    if (index === -1) {
                        this._keys.push(evt.keyCode);
                    }
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                    if (this.camera.metadata.movedBy === null) {
                        this.camera.metadata.movedBy = ECameraMovement.KEYS;
                    }
                }
            };
            this._onKeyUp = (evt) => {
                if (this.keysUp.indexOf(evt.keyCode) !== -1 ||
                    this.keysDown.indexOf(evt.keyCode) !== -1 ||
                    this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                    this.rotateKeysLeft.indexOf(evt.keyCode) !== -1 ||
                    this.rotateKeysRight.indexOf(evt.keyCode) !== -1 ||
                    this.keysRight.indexOf(evt.keyCode) !== -1) {
                    var index = this._keys.indexOf(evt.keyCode);
                    if (index >= 0) {
                        this._keys.splice(index, 1);
                    }
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
            };
            element.addEventListener("keydown", this._onKeyDown, false);
            element.addEventListener("keyup", this._onKeyUp, false);
        }
    }

    public detachControl() {
        var engine = this.camera.getEngine();
        var element = engine.getInputElement();
        if (this._onKeyDown) {
            element.removeEventListener("keydown", this._onKeyDown);
            element.removeEventListener("keyup", this._onKeyUp);
            Tools.UnregisterTopRootEvents( window, [{ name: "blur", handler: this._onLostFocus }]);
            this._keys = [];
            this._onKeyDown = null;
            this._onKeyUp = null;
        }
    }

    public checkInputs() {
        if (this._onKeyDown) {
            var camera = this.camera;
            var speed = camera.speed;               
            var mdata = camera.metadata;
            // move camera for all pressed keys
            for (var index = 0; index < this._keys.length; index++) {
                var keyCode = this._keys[index];
                // move target camera position depending of pressed key
                if (this.keysLeft.indexOf(keyCode) !== -1) {
                    mdata.targetPosition.addInPlace(Vector3.TransformCoordinates(new Vector3(-speed, 0, 0), Matrix.RotationY(camera.rotation.y)));
                }
                else if (this.keysUp.indexOf(keyCode) !== -1) {
                    mdata.targetPosition.addInPlace(Vector3.TransformCoordinates(new Vector3(0, 0, speed), Matrix.RotationY(camera.rotation.y)));
                }
                else if (this.keysRight.indexOf(keyCode) !== -1) {
                    mdata.targetPosition.addInPlace(Vector3.TransformCoordinates(new Vector3(speed, 0, 0), Matrix.RotationY(camera.rotation.y)));
                }
                else if (this.keysDown.indexOf(keyCode) !== -1) {
                    mdata.targetPosition.addInPlace(Vector3.TransformCoordinates(new Vector3(0, 0, -speed), Matrix.RotationY(camera.rotation.y)));
                } 
                // rotating is bit different. While moving the camera is done by lerp, 
                // rotating calculates the new position, set the target and sets the target camera position
                // to the actual camera position. Camera rotation is done by setTarget.
                else if (this.rotateKeysLeft.indexOf(keyCode) !== -1) {
                    mdata.rotation += mdata.rotationSpeed;
                    const tx = camera.target.x;
                    const tz = camera.target.z; 
                    const x = tx + mdata.radius * Math.sin(mdata.rotation);
                    const z = tz + mdata.radius * Math.cos(mdata.rotation);
                    camera.position = new Vector3(x, camera.position.y, z);
                    camera.setTarget(new Vector3(tx, 0, tz));
                    mdata.targetPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z);
                }
                else if (this.rotateKeysRight.indexOf(keyCode) !== -1) {
                    mdata.rotation -= mdata.rotationSpeed;
                    const tx = camera.target.x;
                    const tz = camera.target.z; 
                    const x = tx + mdata.radius * Math.sin(mdata.rotation);
                    const z = tz + mdata.radius * Math.cos(mdata.rotation);
                    camera.position = new Vector3(x, camera.position.y, z);
                    camera.setTarget(new Vector3(tx, 0, tz));
                    mdata.targetPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z);
                }
            }
    
            // x/z limit check
            if (mdata.targetPosition.x < mdata.minX) mdata.targetPosition.x = mdata.minX;
            if (mdata.targetPosition.x > mdata.maxX) mdata.targetPosition.x = mdata.maxX;
            if (mdata.targetPosition.z < mdata.minZ) mdata.targetPosition.z = mdata.minZ;
            if (mdata.targetPosition.z > mdata.maxZ) mdata.targetPosition.z = mdata.maxZ;
    
            // distance check
            var lengthDiff = (mdata.targetPosition.subtract(camera.position)).length();
    
            // moving
            if (lengthDiff > 0 && mdata.movedBy === ECameraMovement.KEYS) {
                var t = lengthDiff < 0.01 ? 1.0 : 0.02;
                camera.position = Vector3.Lerp(camera.position, mdata.targetPosition, t);
                if (t === 1.0) {
                    mdata.movedBy = null;
                }
            } 
        }
    }

    public _onLostFocus(e) {
        this._keys = [];
        // disableEdgeScroll();
    }

    //Add the two required functions for the control Name
    public getClassName() {
        return "FreeCameraKeyboardWalkInput";
    };

    public getSimpleName() {
        return "keyboard";
    };
}