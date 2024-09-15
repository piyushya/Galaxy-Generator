import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({
    title: "Galaxy Controller",
})
gui.close()

const galaxyParams = {
    starSize: 0.01,
    radius: 5,
    starsCount: 100000,
    galaxyColor: "#1f44ff",
    branches : 3,
    spin: 1.017,
    randomness: 1.287,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#3b38ff',
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// download image button
const download = document.querySelector(".download-btn")
download.addEventListener("click", () => {
    renderer.render(scene, camera)
    // Convert canvas to data URL
    const imageDataURL = canvas.toDataURL('image/png');
    // Create an anchor element to download the image
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = 'threejs-snapshot.png';
    link.click();
})

// play sound button
const soundBtn = document.querySelector(".audio-btn")
const audio = document.querySelector("audio")
soundBtn.addEventListener("click", () => {
    if (audio.paused) {
        console.log("playing")
        audio.play();
    } else {
        console.log("paused")
        audio.pause();
    }
    soundBtn.classList.toggle("audio-on")
});

// Scene
const scene = new THREE.Scene()

/*
 * Galaxy
 */

let galaxyGeometry = null
let galaxyMaterial = null
let galaxy = null

function generateGalaxy(){

    // remove previous galaxy before creating new galaxy
    if(galaxy != null){
        galaxy.geometry.dispose()
        galaxy.material.dispose()
        scene.remove(galaxy)
    }

    // Create geometry for the galaxy
    galaxyGeometry = new THREE.BufferGeometry()

    // Create material for galaxy
    galaxyMaterial = new THREE.PointsMaterial({
        size: galaxyParams.starSize,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    // 1D arrray to store position of each star
    const starsPosition = new Float32Array(galaxyParams.starsCount * 3)

    // 1D arrray to store color of each star
    const colors = new Float32Array(galaxyParams.starsCount * 3)

    // fill the position array with random values
    for(let i = 0; i < galaxyParams.starsCount - 2; ++i){
        const i3 = i * 3

        const radius = galaxyParams.radius * Math.random()
        const spinAngle = radius * galaxyParams.spin
        const branchAngle = (i % galaxyParams.branches) / galaxyParams.branches * Math.PI * 2

        const randomX = (Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)) * galaxyParams.randomness  * radius
        const randomY = (Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)) * galaxyParams.randomness * radius
        const randomZ = (Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)) * galaxyParams.randomness * radius

        starsPosition[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        starsPosition[i3 + 1] = 0 + randomY
        starsPosition[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        const colorInside = new THREE.Color(galaxyParams.insideColor)
        const colorOutside = new THREE.Color(galaxyParams.outsideColor)

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / galaxyParams.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // assign random RGB color to each star
        // starsColor[i3] = Math.random()
        // starsColor[i3 + 1] = Math.random()
        // starsColor[i3 + 2] = Math.random()
    }

    galaxyGeometry.setAttribute(
        "position", new THREE.BufferAttribute(starsPosition, 3)
    )
    galaxyGeometry.setAttribute(
        "color", new THREE.BufferAttribute(colors, 3)
    )
    galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
    scene.add(galaxy)
}

generateGalaxy()

gui.add(galaxyParams, "radius").min(0.01).max(20).step(0.01).name("Galaxy Radius")
.onFinishChange(() => {
    generateGalaxy()
})

gui.add(galaxyParams, "starSize").min(0.001).max(0.1).step(0.001).name("Star Size")
.onFinishChange(() => {
    generateGalaxy()
})

gui.add(galaxyParams, "starsCount").min(100).max(100000).step(100).name("Stars Count")
.onFinishChange(() => {
    generateGalaxy()
})

gui.add(galaxyParams, "branches").min(2).max(20).step(1).name("Galaxy Branches")
.onFinishChange(() => {
    generateGalaxy()
})

gui.add(galaxyParams, "spin").min(-5).max(5).step(0.001).name("Galaxy Spin")
.onFinishChange(() => {
    generateGalaxy()
})

gui.add(galaxyParams, "randomness").min(0).max(2).step(0.001).name("Scattering")
.onFinishChange(() => {
    generateGalaxy()
})

gui.add(galaxyParams, "randomnessPower").min(1).max(10).step(0.001).name("Curve Trail")
.onFinishChange(() => {
    generateGalaxy()
})

gui.addColor(galaxyParams, 'insideColor').onFinishChange(generateGalaxy).name("Inside Color")
gui.addColor(galaxyParams, 'outsideColor').onFinishChange(generateGalaxy).name("Outside Color")

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // rotate galaxy
    galaxy.rotation.y = elapsedTime * 0.01

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()