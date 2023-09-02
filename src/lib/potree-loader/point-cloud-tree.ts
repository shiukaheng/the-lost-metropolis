import { Object3D } from 'three';
import { IPointCloudTreeNode } from './types';

/**
 * PointCloudTree is the base class for all point cloud types, an Object3D with an additional root property.
 */
export class PointCloudTree extends Object3D {
  root: IPointCloudTreeNode | null = null;

  /**
   * Checks whether the root node is defined
   */
  initialized() {
    return this.root !== null;
  }
}
