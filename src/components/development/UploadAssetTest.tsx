import { useState } from "react";
// import { uploadAsset } from "../../api";
import GenericPage from "../utilities/GenericPage";
import MagicButton from "../utilities/MagicButton";

// Upload form that 
export default function UploadAssetPage(){
    const [file, setFile] = useState(null);
    return (
        <GenericPage className="flex flex-col gap-4">
            {/* <div className="text-5xl font-black">upload asset</div>
            <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>
            <MagicButton onClick={async ()=>{
                const id = await uploadAsset(file, true, (p)=>{console.log(p)})
                console.log("uploaded", id)
            }}>upload</MagicButton> */}
        </GenericPage>
    )
}