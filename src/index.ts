import { SubMesh } from '@babylonjs/core/Meshes'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Matrix, Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector';
import {StandardMaterial} from '@babylonjs/core/Materials'
import { Texture } from '@babylonjs/core/Materials';
import { MultiMaterial } from '@babylonjs/core/Materials';
import { Scene } from '@babylonjs/core/scene';
import { Tools, UniversalCamera} from '@babylonjs/core';
import { FreeCameraMouseWheelInput } from './camera/FreeCameraMouseWheelInput';
import { FreeCameraKeyboardInput } from './camera/FreeCameraKeyboardInput';
import { RTSCamera } from './camera/RTSCamera';

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
// Associate a Babylon Engine to it.
const engine = new Engine(canvas);
// Create our first scene.
var scene = new Scene(engine);
// This creates and positions a free camera (non-mesh)
var camera = new RTSCamera(canvas, scene);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

const grid = {
    'h' : 20,
    'w' : 20
};

const tiledGround = MeshBuilder.CreateTiledGround("Tiled Ground", {xmin: 0, zmin: 0, xmax: 19, zmax: 19, subdivisions: grid});

const grassMaterial = new StandardMaterial("grass");
grassMaterial.diffuseTexture = new Texture("textures/grass.png");

const waterMaterial = new StandardMaterial("water");
waterMaterial.diffuseTexture = new Texture("textures/water.png");

const multimat = new MultiMaterial("multi", scene);
multimat.subMaterials.push(grassMaterial);
multimat.subMaterials.push(waterMaterial);

tiledGround.material = multimat;

const verticesCount = tiledGround.getTotalVertices();
const tileIndicesLength = tiledGround.getIndices().length / (grid.w * grid.h);
    
// Set subMeshes of the tiled ground
tiledGround.subMeshes = [];
let base = 0;
for (let row = 0; row < grid.h; row++) {
    for (let col = 0; col < grid.w; col++) {
        tiledGround.subMeshes.push(new SubMesh(row%2 ^ col%2, 0, verticesCount, base , tileIndicesLength, tiledGround));
        base += tileIndicesLength;
    }
}

camera.addInputs(new FreeCameraKeyboardInput(camera));
camera.addInputs(new FreeCameraMouseWheelInput(camera));

// Render every frame
engine.runRenderLoop(() => {
  scene.render();
});