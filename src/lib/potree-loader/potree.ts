import { OctreeGeometry } from './loading2/OctreeGeometry';
import { loadOctree } from './loading2/load-octree';
import {
  Box3,
  Camera,
  Frustum,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  Ray,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  DEFAULT_POINT_BUDGET,
  MAX_LOADS_TO_GPU,
  MAX_NUM_NODES_LOADING,
  PERSPECTIVE_CAMERA,
} from './constants';
import { FEATURES } from './features';
import { GetUrlFn, loadPOC } from './loading';
import { ClipMode } from './materials';
import { PointCloudOctree } from './point-cloud-octree';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { PickParams, PointCloudOctreePicker } from './point-cloud-octree-picker';
import { isGeometryNode, isTreeNode } from './type-predicates';
import { IPointCloudTreeNode, IPotree, IVisibilityUpdateResult, PickPoint } from './types';
import { BinaryHeap } from './utils/binary-heap';
import { Box3Helper } from './utils/box3-helper';
import { LRU } from './utils/lru';
import dist from 'vite-plugin-glsl';


export class QueueItem {
  constructor(
    public pointCloudIndex: number,
    public weight: number,
    public node: IPointCloudTreeNode,
    public parent?: IPointCloudTreeNode | null,
  ) { }
}

export class Potree implements IPotree {
  private static picker: PointCloudOctreePicker | undefined;
  private _pointBudget: number = DEFAULT_POINT_BUDGET;
  private _rendererSize: Vector2 = new Vector2();
  private frustumMatrix = new Matrix4();
  private inverseWorldMatrix = new Matrix4();
  private cameraMatrix = new Matrix4();

  maxNumNodesLoading: number = MAX_NUM_NODES_LOADING;
  features = FEATURES;
  lru = new LRU(this._pointBudget);

  /**
   * A versatile point cloud loader and renderer that could be integrated easily into any 3D web application.
   * @param url The relative path to the point cloud file (e.g. cloud.js, metadata.json)
   * @param getUrl A function to get the absolute path to the point cloud file (e.g. https://test.com/scan_1/cloud.js)
   * @param xhrRequest A function to make a request to the server (e.g. fetch)
   * @returns A promise that resolves to a PointCloudOctree
   */
  async loadPointCloud(
    url: string,
    getUrl: GetUrlFn,
    xhrRequest = (input: RequestInfo, init?: RequestInit) => fetch(input, init),
  ): Promise<PointCloudOctree> {
    if (url === "cloud.js") {
      return await loadPOC(url, getUrl, xhrRequest).then(geometry => new PointCloudOctree(this, geometry));
    } else if (url === "metadata.json") {
      // throw new Error("Not implemented")
      return await loadOctree(url, getUrl, xhrRequest).then((geometry: OctreeGeometry) => new PointCloudOctree(this, geometry));
    }
    throw new Error("Unsupported file type");
  }

  /**
   * Function to update the visibility of the point clouds and load/unload geometry nodes.
   * @param pointClouds A list of point clouds to update 
   * @param camera Camera in which we are viewing the point clouds
   * @param renderer The renderer used to render the point clouds 
   * @returns An object containing the visible nodes, number of visible points, and a list of promises for the nodes that are loading 
   */
  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult {
    const result = this.updateVisibility(pointClouds, camera, renderer); // This is the actual step for calculating visibility

    for (let i = 0; i < pointClouds.length; i++) {
      const pointCloud = pointClouds[i];
      if (pointCloud.disposed) {
        continue;
      } // Basically, we only update a point cloud if it is not disposed

      pointCloud.material.updateMaterial(pointCloud, pointCloud.visibleNodes, camera, renderer);
      pointCloud.updateVisibleBounds();
      pointCloud.updateBoundingBoxes();
    }

    this.lru.freeMemory();

    return result;
  }

  static pick(
    pointClouds: PointCloudOctree[],
    renderer: WebGLRenderer,
    camera: Camera,
    ray: Ray,
    params: Partial<PickParams> = {},
  ): PickPoint | null {
    Potree.picker = Potree.picker || new PointCloudOctreePicker();
    return Potree.picker.pick(renderer, camera, ray, pointClouds, params);
  }

  get pointBudget(): number {
    return this._pointBudget;
  }

  set pointBudget(value: number) {
    if (value !== this._pointBudget) {
      this._pointBudget = value;
      this.lru.pointBudget = value;
      this.lru.freeMemory();
    }
  }

  private updateVisibility(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult {
    let numVisiblePoints = 0; // We initialize the number of visible points to 0

    const visibleNodes: PointCloudOctreeNode[] = []; // We initialize the list of visible nodes to an empty list
    const unloadedGeometry: PointCloudOctreeGeometryNode[] = []; // We initialize the list of unloaded geometry to an empty list

    // calculate object space frustum and cam pos and setup priority queue
    const { frustums, cameraPositions, priorityQueue } = this.updateVisibilityStructures(
      pointClouds,
      camera,
    );

    let loadedToGPUThisFrame = 0;
    let exceededMaxLoadsToGPU = false;
    let nodeLoadFailed = false;
    let queueItem: QueueItem | undefined;

    while ((queueItem = priorityQueue.pop()) !== undefined) { // Get the next item in the priority queue and continue if it exists
      let node = queueItem.node; // Get the node from the queue item (starts from the root nodes)

      // If we will end up with too many points, we stop right away.
      if (numVisiblePoints + node.numPoints > this.pointBudget) {
        break;
      }

      const pointCloudIndex = queueItem.pointCloudIndex; // Get the point cloud index (which point cloud) from the queue item (which may contain multiple nodes from the same point cloud)
      const pointCloud = pointClouds[pointCloudIndex]; // Get the point cloud

      const maxLevel = pointCloud.maxLevel !== undefined ? pointCloud.maxLevel : Infinity; // Get the maximum level of the point cloud, Infinity if not defined

      if (
        node.level > maxLevel || // We are at a level that is higher than the maximum level of the point cloud
        !frustums[pointCloudIndex].intersectsBox(node.boundingBox) || // The frustum does not intersect the bounding box of the node
        this.shouldClip(pointCloud, node.boundingBox) // The node should be clipped
        // TODO: Probably implement here for look-away fade effect
      ) {
        continue; // We skip this node
      }

      // Now we assume we will load this node

      numVisiblePoints += node.numPoints; // We add in this node's visible points (not counting descendants) to the total points count
      pointCloud.numVisiblePoints += node.numPoints; // And point cloud point count

      const parentNode = queueItem.parent; // Get the parent

      // If the node is a geometry node AND the parent is a tree node, or has no parent
      // I assume geometry nodes mean its not loaded to GPU
      if (isGeometryNode(node) && (!parentNode || isTreeNode(parentNode))) {
        // If the node is loaded to memory and we have not exceeded the maximum loads to GPU
        if (node.loaded && loadedToGPUThisFrame < MAX_LOADS_TO_GPU) { 
          /*
           * We convert the geometry node to a tree node, which:
           * - Creates a Points object for the geometry node (scene node)
           * - Adds the scene to parent's scene node
           * - Sets up disposers
           */
          node = pointCloud.toTreeNode(node, parentNode); 
          loadedToGPUThisFrame++;
        } else if (!node.failed) {  // I assume node.failed means it failed to load (from the URL), and so it means its failed to load to GPU?
          if (node.loaded && loadedToGPUThisFrame >= MAX_LOADS_TO_GPU) {
            exceededMaxLoadsToGPU = true;
          }
          unloadedGeometry.push(node); // We add the node to the list of unloaded geometry
          pointCloud.visibleGeometry.push(node); // We add the node to the list of visible geometry
        } else {
          nodeLoadFailed = true; // We set the node load failed flag to true
          continue;
        }
      }

      if (isTreeNode(node)) {
        this.updateTreeNodeVisibility(pointCloud, node, visibleNodes);
        pointCloud.visibleGeometry.push(node.geometryNode);
      }

      const halfHeight =
        0.5 * renderer.getSize(this._rendererSize).height * renderer.getPixelRatio();

      this.updateChildVisibility(
        queueItem,
        priorityQueue,
        pointCloud,
        node,
        cameraPositions[pointCloudIndex],
        camera,
        halfHeight,
      );
    } // end priority queue loop

    const numNodesToLoad = Math.min(this.maxNumNodesLoading, unloadedGeometry.length);
    const nodeLoadPromises: Promise<void>[] = [];
    for (let i = 0; i < numNodesToLoad; i++) {
      nodeLoadPromises.push(unloadedGeometry[i].load());
    }

    return {
      visibleNodes: visibleNodes,
      numVisiblePoints: numVisiblePoints,
      exceededMaxLoadsToGPU: exceededMaxLoadsToGPU,
      nodeLoadFailed: nodeLoadFailed,
      nodeLoadPromises: nodeLoadPromises,
    };
  }

  private updateTreeNodeVisibility(
    pointCloud: PointCloudOctree,
    node: PointCloudOctreeNode,
    visibleNodes: IPointCloudTreeNode[],
  ): void {
    this.lru.touch(node.geometryNode);

    const sceneNode = node.sceneNode;
    sceneNode.visible = true;
    sceneNode.material = pointCloud.material;
    sceneNode.updateMatrix();
    sceneNode.matrixWorld.multiplyMatrices(pointCloud.matrixWorld, sceneNode.matrix);

    visibleNodes.push(node);
    pointCloud.visibleNodes.push(node);

    this.updateBoundingBoxVisibility(pointCloud, node);
  }

  private updateChildVisibility(
    queueItem: QueueItem,
    priorityQueue: BinaryHeap<QueueItem>,
    pointCloud: PointCloudOctree,
    node: IPointCloudTreeNode,
    cameraPosition: Vector3,
    camera: Camera,
    halfHeight: number,
  ): void {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child === null) {
        continue;
      }

      const sphere = child.boundingSphere;
      const distance = sphere.center.distanceTo(cameraPosition);
      const radius = sphere.radius;

      let projectionFactor = 0.0;

      if (camera.type === PERSPECTIVE_CAMERA) {
        const perspective = camera as PerspectiveCamera;
        const fov = (perspective.fov * Math.PI) / 180.0;
        const slope = Math.tan(fov / 2.0);
        projectionFactor = halfHeight / (slope * distance);
      } else {
        const orthographic = camera as OrthographicCamera;
        projectionFactor = (2 * halfHeight) / (orthographic.top - orthographic.bottom);
      }

      const screenPixelRadius = radius * projectionFactor;

      // Don't add the node if it'll be too small on the screen.
      if (screenPixelRadius < pointCloud.minNodePixelSize) {
        continue;
      }

      // Nodes which are larger will have priority in loading/displaying.
      let weight = distance < radius ? Number.MAX_VALUE : screenPixelRadius * 0.5 + 1 / distance;
      // let weight = distance < radius ? Number.MAX_VALUE :
      (distance < 10 && child.level < 7) ? 1 / distance * 10 :
      (distance < 15 && child.level < 5) ? 1 / distance * 7.5 :
      (distance < 30 && child.level < 2) ? 1 / distance * 5 :
      1 / distance;


      if ((child as PointCloudOctreeNode)?.sceneNode?.material?.transitionAlpha) {
        weight *= 1 - Math.abs((child as PointCloudOctreeNode).sceneNode.material.transitionAlpha);
      }
      priorityQueue.push(new QueueItem(queueItem.pointCloudIndex, weight, child, node));
    }
  }

  private updateBoundingBoxVisibility(
    pointCloud: PointCloudOctree,
    node: PointCloudOctreeNode,
  ): void {
    if (pointCloud.showBoundingBox && !node.boundingBoxNode) {
      const boxHelper = new Box3Helper(node.boundingBox);
      boxHelper.matrixAutoUpdate = false;
      pointCloud.boundingBoxNodes.push(boxHelper);
      node.boundingBoxNode = boxHelper;
      node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
    } else if (pointCloud.showBoundingBox && node.boundingBoxNode) {
      node.boundingBoxNode.visible = true;
      node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
    } else if (!pointCloud.showBoundingBox && node.boundingBoxNode) {
      node.boundingBoxNode.visible = false;
    }
  }

  private shouldClip(pointCloud: PointCloudOctree, boundingBox: Box3): boolean {
    const material = pointCloud.material;

    if (material.numClipBoxes === 0 || material.clipMode !== ClipMode.CLIP_OUTSIDE) {
      return false;
    }

    const box2 = boundingBox.clone();
    pointCloud.updateMatrixWorld(true);
    box2.applyMatrix4(pointCloud.matrixWorld);

    const clipBoxes = material.clipBoxes;
    for (let i = 0; i < clipBoxes.length; i++) {
      const clipMatrixWorld = clipBoxes[i].matrix;
      const clipBoxWorld = new Box3(
        new Vector3(-0.5, -0.5, -0.5),
        new Vector3(0.5, 0.5, 0.5),
      ).applyMatrix4(clipMatrixWorld);
      if (box2.intersectsBox(clipBoxWorld)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Method to get the frustums, camera positions, and priority queue needed to calculate visibility
   * @param pointClouds An array of point clouds needing visibility calculated
   * @param camera The camera in which we are viewing the point clouds
   * @returns An object containing the frustums, camera positions, and priority queue
   */
  private updateVisibilityStructures(
    pointClouds: PointCloudOctree[],
    camera: Camera,
  ): {
    frustums: Frustum[]; // Array of frustums that can be used to test if a point (in local point cloud space) is visible
    cameraPositions: Vector3[]; // Array of camera positions in local point cloud space
    priorityQueue: BinaryHeap<QueueItem>; // An array of root nodes from each point cloud with a defaulted maximum priority
  } {
    const frustums: Frustum[] = []; // TODO: How do the frustums and cameraPositions arrays get matched up with the point clouds? Since the index may not match up with the point cloud index...
    const cameraPositions: Vector3[] = [];
    const priorityQueue = new BinaryHeap<QueueItem>(x => 1 / x.weight);

    for (let i = 0; i < pointClouds.length; i++) { // For each point cloud
      const pointCloud = pointClouds[i];

      if (!pointCloud.initialized()) { // Skips if root node is not defined
        continue;
      }

      pointCloud.numVisiblePoints = 0; // Resets the number of visible points to 0
      pointCloud.visibleNodes = []; // Resets the list of visible nodes to an empty list
      pointCloud.visibleGeometry = []; // Resets the list of visible geometry to an empty list

      camera.updateMatrixWorld(false); // Turns off matrix auto update

      // Frustum in object space.
      const inverseViewMatrix = camera.matrixWorldInverse; // Transforms points from world space to object (camera) space / view space
      const worldMatrix = pointCloud.matrixWorld; // Transforms points from object (point cloud) space to world space
      this.frustumMatrix
        .identity()
        .multiply(camera.projectionMatrix)
        .multiply(inverseViewMatrix)
        .multiply(worldMatrix);
      /**
       * - First, we transform from point cloud local space to world space
       * - Then, we transform from world space to camera space
       * - Finally, we transform from camera space to clip space
       */
      frustums.push(new Frustum().setFromProjectionMatrix(this.frustumMatrix));

      // Camera position in object space
      this.inverseWorldMatrix.copy(worldMatrix).invert(); // Transforms from world space to object space
      this.cameraMatrix
        .identity()
        .multiply(this.inverseWorldMatrix)
        .multiply(camera.matrixWorld);
      cameraPositions.push(new Vector3().setFromMatrixPosition(this.cameraMatrix));

      if (pointCloud.visible && pointCloud.root !== null) { // If the point cloud is visible and the root node is defined
        const weight = Number.MAX_VALUE; // The weight is set to the maximum value, since we equally prioritize all root nodes
        priorityQueue.push(new QueueItem(i, weight, pointCloud.root)); // We add the root node to the priority queue
      }

      // Hide any previously visible nodes. We will later show only the needed ones.
      if (isTreeNode(pointCloud.root)) {
        pointCloud.hideDescendants(pointCloud?.root?.sceneNode);
      }

      for (const boundingBoxNode of pointCloud.boundingBoxNodes) {
        boundingBoxNode.visible = false;
      }
    }

    return { frustums, cameraPositions, priorityQueue };
  }

}
