import { Camera, Scene, Tools, UniversalCamera, Vector3 } from "@babylonjs/core";

export class RTSCamera {
    public camera: UniversalCamera;

    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        this.camera = new UniversalCamera("camera1", new Vector3(5, 5, -5), scene);
        // This targets the camera to scene origin
        this.camera.setTarget(Vector3.Zero());
        this.camera.mode = Camera.PERSPECTIVE_CAMERA;
        this.camera.speed = 0.4;
        this.camera.fov = 1.0;
        this.camera.metadata = {
            // mouse & keyboard properties
            // Set by camera inputs. Defines, which input moves the camera (mouse or keys)
            movedBy: null,
            // target position, the camera should be moved to
            targetPosition: this.camera.position.clone(),
            // radius, that is used to rotate camera
            // initial value dependent from camera position and camera target
            radius: new Vector3(this.camera.position.x, 0, this.camera.position.z).subtract(new Vector3(this.camera.target.x, 0, this.camera.target.z)).length(),
            // helper variable, to rotate camera
            rotation: Tools.ToRadians(180) + this.camera.rotation.y,
            // speed for rotation
            rotationSpeed: 0.02,
            // boundaries for x and z
            minX: -5,
            maxX: 55,
            minZ: -5,
            maxZ: 55,

            // mousewheel properties
            // similar to targetPosition, targetZoom contains the target value for the zoom
            targetZoom: this.camera.fov,
            // zoom boundaries
            maxZoom: 1.4,
            minZoom: 0.5,
            // speed for zoom
            zoom: 0.005,
            // zoom distance per mouse wheel interaction
            zoomSteps: 0.2,
        }
        this.camera.inputs.clear();

        // This attaches the camera to the canvas
        this.camera.attachControl(canvas, true);
    }

    public addInputs(newInput) {
        this.camera.inputs.add(newInput);
    }
}