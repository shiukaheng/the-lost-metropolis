# The Lost Metropolis

## 🧑🏻‍💻 How to develop
- Make sure you have Node.js, yarn installed
- Run `yarn install` in root folder to install dependencies
- Run `yarn dev` to spin up a Firebase backend emulator locally, and run a development server (have not tested for a year, please check if it actually works)

## 📒 Terminology
- `R3F`: React Three Fibre (Three.js renderer for React)
- `Vapor / VaporAPI`: Codename for the internal 3D management engine

## 🗺️ Overview
The Lost Metropolis's long-term plan is to establish a open-source web platform for creatives and academics to easily share large-scale 3D models of heritage sites through the browser.

At its core, this project faces the technical problem of streaming large scale 3D models through the internet to display on the browser. To make this feasible, it relies on other libraries to provide [spatial acceleration structures](https://www.cg.tuwien.ac.at/sites/default/files/course/4411/attachments/05_spatial_acceleration_0.pdf) to efficiently stream and render 3D models, such that only parts of the model that need to be rendered are loaded.

The core libraries / projects we depend on include:
- [Potree](https://potree.github.io/): A project for storing / displaying point clouds optimized on the web. Our project has a specific fork to use the code more modularly and includes some fixes not done upstream called [potree-loader](https://github.com/shiukaheng/potree-loader).
- [3D Tiles](https://www.ogc.org/standard/3dtiles/): An open specification for tiled meshes on the web, and various loader implementations for Three.js [[1]](https://github.com/NASA-AMMOS/3DTilesRendererJS), [[2]](https://github.com/NASA-AMMOS/3DTilesRendererJS)
- [Nexus](https://vcg.isti.cnr.it/nexus/): A fallback option for rendering / storing large 3D models, not maintained

This platform's main contribution is to:
- Offer a content management system for easily uploading and distributing large scale 3D models
- Glue code to use R3F with Potree, 3D Tiles, and Nexus
- Create an easy to use but extendible 3D management engine for editing 3D archives (moving models around, tweaking settings)
- Additional 3D features for enhancing archive viewing experience (sounds, controls, descriptions and annotations, etc)
- Serializing 3D scenes from the editor and storing it in the backend
- Deserializing 3D scenes for public viewing
- Offer a polished experience for both editors and viewers (a long way to there...)

The general use case of this platform includes:
- Creating an archive, setting the archive name and description, done in the [EditPost](https://github.com/shiukaheng/the-lost-metropolis/blob/main/src/components/admin/EditPost.tsx) component
- Going into 3D mode, uploading assets (WIP, process includes uploading file, doing necessary conversions, and moving it to a GCP bucket with CDN)
- Placing assets into the 3D scene, moving it into place
- Saving the archive, which serializes the scene and stores it onto Firestore
- Viewers can then view the archive using an external link, which retrives the serializes data and renders it using [Viewer](https://github.com/shiukaheng/the-lost-metropolis/blob/main/src/components/viewer/Viewer.tsx) component

Here is a basic overview of the key folders inside this repository and their purposes:
- `api`: Shared Typescript type definitions that specify how content is serialized (common to frontend and backend)
  - `implementation_types`: Types specific to Firebase (seperated for easier migration away from Firebase)
  - `types`: Types specifying content
- `src`: Where all the frontend source code is
  - `api_client`: Code and types used to define an abstraction layer over the actual Firebase API (so that we can switch backends easier in the future)
  - `lib`: Javascript libraries that are not on NPM used for this project
  - `components`: All the React components
    - `3d`: R3F-based react components
    - `admin`: Normally hidden react components for logged in users which are presumably all admins
    - `editor`: The 3D editor component and its internal components, used to edit archives
    - `pages`: Root components for pages
    - `providers`: ContextProvider components, used to pass extra information to child components (most components need to be inside of them)
    - `svgs`: Branding in SVG format, which can be directly imported as React component using Parcel
    - `utilities`: Common UI element utilities
  - `App.tsx`: The website root component

## 🚩 Development status / known issues / TODO
- Buggy 3D components that may need reloading / remounting to display correctly
- Incomplete implementation of asset management system (file upload, conversion)
- Room for improvement in performance (requires tweaking 3D settings automatically, or more heavily modifying the libraries themselves)
- Browser compatibility (Firefox seems to have some issues with UI elements)

## 📑 License
GPL v3.0
