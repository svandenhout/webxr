# Spatial computing for the web (WebXR demystified)
 
Several coding examples used explain how WebXR features and showing what they are good for.
All these features are possible on a low end android phone

(a high end device will give better results though ;)

## environment collision [environment-collision.ts](./src/environment-collision.ts)

Use the layout of your environment as a boundary

A cylinder is rendered in the location where the device is pointing to, it will not move through a wall or other object. 

## hit test [hit-test.ts](./src/hit-test.ts)

Touch the screen to place dots in the environment ;)

## light estimation [light-estimation.ts](./light-estimation.html)

The scene estimates light and maps it on the mesh, making it blend into the environment like a real object

## oclusion [oclusion.ts](./src/oclusion.ts)

Renders a sphere that will be occluded (hidden) when it's behind a (real) object in the users environment.

## depth estimation [depth-estimation.ts](./src/depth-estimation.ts)

Display the depth map as a geometry plane, see what a device sees when requesting depth information
