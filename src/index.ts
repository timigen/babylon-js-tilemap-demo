import { SubMesh } from '@babylonjs/core/Meshes'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector';
import {StandardMaterial} from '@babylonjs/core/Materials'
import { Texture } from '@babylonjs/core/Materials';
import { MultiMaterial } from '@babylonjs/core/Materials';
import { Scene } from '@babylonjs/core/scene';
import { FreeCameraMouseWheelInput } from './camera/FreeCameraMouseWheelInput';
import { FreeCameraKeyboardInput } from './camera/FreeCameraKeyboardInput';
import { RTSCamera } from './camera/RTSCamera';
import { Array2d } from 'utils';

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
// Associate a Babylon Engine to it.
const engine = new Engine(canvas);
// Create our first scene.
var scene = new Scene(engine);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

const size = { xmin: 0, zmin: 0, xmax: 50, zmax: 50 };

const grid = {
    'h' : size.zmax,
    'w' : size.xmax
};

// This creates and positions a free camera (non-mesh)
var camera = new RTSCamera(canvas, scene, size);

const world = Array2d.getRandomlySeeded2d(grid.h, grid.w, 0, 4);

const tiledGround = MeshBuilder.CreateTiledGround("Tiled Ground", { xmin: size.xmin, zmin: size.zmin, xmax: size.xmax, zmax: size.zmax, subdivisions: grid });

const treeMaterial = new StandardMaterial("trees");
treeMaterial.diffuseTexture = new Texture("textures/trees.png");

const grassMaterial = new StandardMaterial("grass");
grassMaterial.diffuseTexture = new Texture("textures/grass.png");

const sandMaterial = new StandardMaterial("sand");
sandMaterial.diffuseTexture = new Texture("textures/sand.png");

const dirtMaterial = new StandardMaterial("dirt");
dirtMaterial.diffuseTexture = new Texture("textures/dirt.png");

const waterMaterial = new StandardMaterial("water");
waterMaterial.diffuseTexture = new Texture("textures/water.png");

const multimat = new MultiMaterial("multi", scene);
multimat.subMaterials.push(waterMaterial);
multimat.subMaterials.push(grassMaterial);
multimat.subMaterials.push(sandMaterial);
multimat.subMaterials.push(dirtMaterial);
multimat.subMaterials.push(treeMaterial);

tiledGround.material = multimat;

const verticesCount = tiledGround.getTotalVertices();
const tileIndicesLength = tiledGround.getIndices().length / (grid.w * grid.h);
    
// Set subMeshes of the tiled ground
tiledGround.subMeshes = [];
let base = 0;
for (let row = 0; row < grid.h; row++) {
    for (let col = 0; col < grid.w; col++) {
        let tile = world[row][col];
        tiledGround.subMeshes.push(new SubMesh(tile, 0, verticesCount, base , tileIndicesLength, tiledGround));
        base += tileIndicesLength;
    }
}

camera.addInputs(new FreeCameraKeyboardInput(camera));
camera.addInputs(new FreeCameraMouseWheelInput(camera));

// Render every frame
engine.runRenderLoop(() => {
  scene.render();
});