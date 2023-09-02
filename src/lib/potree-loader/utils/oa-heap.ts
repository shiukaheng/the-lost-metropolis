import { Box2, Box3, Matrix4, Vector2, Vector3 } from "three";
import { BinaryHeap } from "./binary-heap";
import { QueueItem } from "../potree";

export class OcclusionAwareBinaryHeap<N extends number, M extends number> {
    // Create an array of binary heaps with length n * m
    // n is the number of bins in the x direction; 0 is the leftmost bin, n - 1 is the rightmost bin
    // m is the number of bins in the y direction; 0 is the bottommost bin, m - 1 is the topmost bin 
    private heaps: BinaryHeap<QueueItem>[]
    constructor(public n: N, public m: M, scoreFunction: (item: QueueItem) => number) {
        this.heaps = new Array(n * m).fill(0).map(() => new BinaryHeap<QueueItem>(scoreFunction));
    }
    public push(item: QueueItem, frustumMatrix: Matrix4): void {
        const boundingBox: Box2 = projectBox3ToBox2(item.node.boundingBox, frustumMatrix);
        const binIndex: number = this.assignBin(boundingBox);
        this.heaps[binIndex].push(item);
    }
    private assignBin(boundingBox: Box2): number {
        // Transform the bounding box coordinates to heap matrix coordinates
        // Original bounding box coordinates are in the range [-1, 1]
        // Transformed bounding box coordinates are in the range [0, n-1] and [0, m-1] (quantized to integers)
        boundingBox.min.x = Math.min(Math.floor((boundingBox.min.x + 1) / 2 * this.n), this.n - 1);
        boundingBox.min.y = Math.min(Math.floor((boundingBox.min.y + 1) / 2 * this.m), this.m - 1);
        boundingBox.max.x = Math.min(Math.floor((boundingBox.max.x + 1) / 2 * this.n), this.n - 1);
        boundingBox.max.y = Math.min(Math.floor((boundingBox.max.y + 1) / 2 * this.m), this.m - 1);
        // Generate offset coordinates
        const xOffset: number = Math.min(Math.floor(Math.random() * (boundingBox.max.x - boundingBox.min.x) + boundingBox.min.x), this.n - 1);
        const yOffset: number = Math.min(Math.floor(Math.random() * (boundingBox.max.y - boundingBox.min.y) + boundingBox.min.y), this.m - 1);
        // Calculate bin index
        return this.getBinIndex(
            boundingBox.min.x + xOffset,
            boundingBox.min.y + yOffset
        )
    }
    public pop(): QueueItem | undefined {
        // Choose a random bin
        const binIndex: number = Math.floor(Math.random() * this.heaps.length);
        // Pop from the bin
        return this.heaps[binIndex].pop();
    }
    private getBinIndex(x: number, y: number): number {
        return Math.floor(x) + Math.floor(y) * this.m;
    }
}

const frustumBox2: Box2 = new Box2(new Vector2(-1, -1), new Vector2(1, 1));

function projectBox3ToBox2(boundingBox: Box3, frustumMatrix: Matrix4): Box2 {
    // Extract the 8 corners of the bounding box
    const corners: Vector3[] = [
        new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
        new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
        new Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
        new Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
        new Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
        new Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
        new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
        new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
    ];
    // Project the corners onto the frustum
    const projectedCorners: Vector2[] = corners.map((corner: Vector3) => {
        const projectedCorner: Vector3 = corner.applyMatrix4(frustumMatrix);
        return new Vector2(projectedCorner.x, projectedCorner.y)
    });
    // Calculate Box2
    const box2: Box2 = new Box2().setFromPoints(projectedCorners);
    // Intersect with frustumBox2
    return box2.intersect(frustumBox2);
}

