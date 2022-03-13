import { Timestamp } from 'firebase/firestore';
import { JSONObject } from '../utility_types';

export type PostDocData = {
    createdAt: Timestamp,
    updatedAt: Timestamp,
    data: JSONObject,
    title: JSONObject,
    description: JSONObject,
    editors: string[],
    owner: string,
    public: boolean,
    viewers: string[],
    assets: JSONObject[],
}