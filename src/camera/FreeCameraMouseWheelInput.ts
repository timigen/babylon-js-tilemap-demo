import { PointerEventTypes, Tools } from "@babylonjs/core";

export class FreeCameraMouseWheelInput {
    public _wheelDeltaY = 0;
    public _observer;
    public _wheel;
    public camera;

    constructor(camera) {
        this.camera = camera;
    }

    public attachControl(noPreventDefault) {
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);
        this._wheel = (pointer) => {
            // sanity check - this should be a PointerWheel event.
            if (pointer.type !== PointerEventTypes.POINTERWHEEL) {
                return;
            }
            var event = pointer.event;
            if (event.deltaY !== undefined) {
                this._wheelDeltaY -= event.deltaY;
            }
            if (event.preventDefault) {
                if (!noPreventDefault) {
                    event.preventDefault();
                }
            }
        };
        this._observer = this.camera.getScene().onPointerObservable.add(this._wheel, PointerEventTypes.POINTERWHEEL);
    }

    public detachControl() {
        if (this._observer) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            this._observer = null;
            this._wheel = null;
        }
    };
    
    public checkInputs() {
        if (this._wheel) {
            const mdata = this.camera.metadata;
            // if mouse wheel was used, set target zoom
            if (this._wheelDeltaY < 0) {
                mdata.targetZoom += mdata.zoomSteps;
            } 
            else if(this._wheelDeltaY > 0) {
                mdata.targetZoom -= mdata.zoomSteps;
            }
            this._wheelDeltaY = 0;
    
            // check max/min zoom
            if (mdata.targetZoom > mdata.maxZoom) mdata.targetZoom = mdata.maxZoom;
            if (mdata.targetZoom < mdata.minZoom) mdata.targetZoom = mdata.minZoom;
    
            const diff = this.camera.fov - mdata.targetZoom;
            if (Math.abs(diff) < mdata.zoom) this.camera.fov = mdata.targetZoom;
    
            // add/subtract value from camera fov, until targetZoom is reached
            if (this.camera.fov < mdata.targetZoom) {
                this.camera.fov += mdata.zoom;
            } 
            else if (this.camera.fov > mdata.targetZoom) {
                this.camera.fov -= mdata.zoom;
            }
        }
    }

    public getClassName() {
        return "FreeCameraMouseWheelInput";
    }

    public getSimpleName = function () {
        return "mouseWheel";
    }
}