# Naming hell
I am finding this code terribly hard to read because of all the similar names. Here are some notes regarding the naming conventions used in this codebase.

## Potree
Main class that contains the core logic of the library. It is the entry point for the library.

## PointCloudTree
Object3D with additional root property.

## PointCloudOctree (extends PointCloudTree)
Three.js object with many helpers for easy culling. This is the main object we add to the scene!

## PointCloudOctreeNode (implements IPointCloudTreeNode)
Seemingly an abstraction of a node in the octree. Holds links to:
- PointCloudOctreeGeometryNode
- Points (scene object)
- pcIndex (the index of the point cloud)

## PointCloudOctreeGeometry / OctreeGeometry (new)
- Where the loader resides
## PointCloudOctreeGeometryNode
## OctreeGeometryNode

## IPotree
Implemented by:
- Potree

## IPointCloudTreeNode
Implemented by:
- PointCloudOctreeGeometryNode
- PointCloudOctreeNode
- OctreeGeometryNode