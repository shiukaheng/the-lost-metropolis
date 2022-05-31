export function ArenaSynchronizer({id}) {
    // Synchronizes poses and (some) object props on individual clients

    // id prop will be used to identify the client and other clients, 
    // as well as the synchronization server which will use computer vision
    // to determine the pose of the client.

    // Pose synchronization will be trivial, perhaps there could be some optimization put in to
    // make changes in transformation less nauseating.

    // However, state synchronization will be more complicated, because we probably should limit
    // prop / state updates that change per frame (e.g. other user's pose), perhaps we should get rid of
    // using props and states altogether and imperatively update the object position.

    // We should probably implement a useSharedObject hook that allows us to synchronize object
    // pose without having to use props and states.

    // Moreoever, a lot of the synchronization does not need to be done on every frame, for example,
    // video playback synchronization can be done just once, or at a slow period to prevent drift.
}