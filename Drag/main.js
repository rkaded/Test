import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';


//canvas
const canvas = document.querySelector('canvas.webgl');
//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#c7d6c7'); // Set background color

//object
const geometry = new THREE.RingGeometry(0.15, 0.20,  );
const material = new THREE.MeshStandardMaterial({ color: '#0ff000', wireframe: false })
const mesh = new THREE.Mesh(geometry, material)
mesh.position.set(-1, 0, 0);
mesh.scale.set(0.5, 0.5, 0.5)
scene.add(mesh)

//loading a GLTF model
const GLTFloader = new GLTFLoader();

let model
GLTFloader.load(
  './Box/Box.glb',
  (gltf) => {
    model = gltf.scene;
    model.position.set(0, 0, 0); // Set position of the imported mesh
    model.scale.set(0.1, 0.1, 0.1); // Set scale of the imported mesh
    model.rotateY(Math.PI)
    scene.add(gltf.scene)},
  undefined,
  (error) => {
    console.error(error);
  }
);

//Light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 2);
scene.add(directionalLight);

//handling resizing
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
})

//axis
const axes = new THREE.AxesHelper(5)
scene.add(axes)

//camera and control
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 2);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//Renderer and VR Support
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

document.body.appendChild(ARButton.createButton(renderer));
renderer.xr.enabled = true;
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
}
);

//Mouse movement
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

//Box on model click
window.addEventListener('click', () => {
    if (currentIntersects) {
        console.log('clicked', currentIntersects.object)
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
        const material = new THREE.MeshPhongMaterial({color: 0xffffff * Math.random()})
        const meshgen = new THREE.Mesh(geometry, material)
        meshgen.position.set(Math.random(), -1, 0)
        scene.add(meshgen)
        
        mesh.material.color.set('blue')
    }
})

const controller = renderer.xr.getController(0) //0 means first available input option, on phone = touch
controller.addEventListener('select', onSelect)
scene.add(controller)

//Touch implementation
function onSelect() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshPhongMaterial({color: 'red'})
    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld)
    mesh.quaternion.setFromRotationMatrix(controller.matrixWorld)

    scene.add(mesh)
}

let currentIntersects
//animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Model click
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    if (model) {
        const intersects = raycaster.intersectObject(model)
        if (intersects.length) {
            mesh.material.color.set('red')
            currentIntersects = intersects[0]
        }
        else {
            mesh.material.color.set('#0ff000')
            currentIntersects = null
        } 

    }
    

    /* //Model control
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    if (model) {
      const modelIntersects = raycaster.intersectObject(model)
      if (modelIntersects.length) {
      mesh.material.color.set('red')
    }
    else {
      mesh.material.color.set('#01de00')
    }} */
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()