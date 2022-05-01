import { useCallback, useState } from "react";
import { boolean } from "yup";
import { Post } from "../../../../api/types/Post";
import { Sponsor, sponsorSchema } from "../../../../api/types/Sponsor";
import { Instance } from "../../../../api/utility_types";
import { createEmptyMultilangString, getSponsorImageURL, Switcher, useMultiLang, useMultiLangObject } from "../../../utilities";
import {ArrowUpIcon, ArrowDownIcon, PencilIcon, EyeIcon, TrashIcon} from '@heroicons/react/outline';
import MagicIcon from "../../utilities/MagicIcon";
import MagicButton from "../../utilities/MagicButton";
import { instance } from "../../../../api/utilities";
import { v4 } from "uuid";
import { Input } from "../../utilities/Input";
import { LanguageLiteral } from "../../../../api/types/LanguageLiteral";
import { cloneDeep } from "lodash";
import { Condition } from "../../../utilities";
import { SingleFileAssetUploader } from "./SingleFileAssetUploader";
import VaporAPI from "../../../api_client/api";

export function SponsorsEditor({buffer, setBuffer, postInstance, activeLanguage}: {
    buffer: Partial<Post>,
    setBuffer: (buffer: Partial<Post>) => void,
    postInstance: Instance<Post>,
    activeLanguage: LanguageLiteral,
}) {
    const sponsors = buffer.sponsors as Instance<Sponsor>[];
    const addSponsorLabel = useMultiLang({
        en: "add sponsor +",
        zh: "添加贊助商 +",
    });
    const createSponsorInstance = useCallback(() => {
        const newSponsor = sponsorSchema.getDefault();
        newSponsor.name = {
            en: "untitled sponsor",
            zh: "未命名贊助商",
        }
        const newSponsorInstance = instance(newSponsor, v4());
        setBuffer({
            ...buffer,
            sponsors: [...sponsors, newSponsorInstance],
        })
        return newSponsorInstance;
    }, [buffer, setBuffer]);
    return (
        <div className="flex flex-col gap-2">
            {
                sponsors.map((sponsorInstance: Instance<Sponsor>) => <SponsorComponent key={sponsorInstance.id} sponsorInstance={sponsorInstance} buffer={buffer} setBuffer={setBuffer} activeLanguage={activeLanguage} postInstance={postInstance}/>)
            }
            <MagicButton solid onClick={createSponsorInstance}>{addSponsorLabel}</MagicButton>
        </div>
    )
}

function SponsorComponent({sponsorInstance, buffer, setBuffer, startWithEditMode=false, activeLanguage, postInstance}:{
    sponsorInstance: Instance<Sponsor>,
    buffer: Partial<Post>,
    setBuffer: (buffer: Partial<Post>) => void,
    startWithEditMode: boolean,
    activeLanguage: LanguageLiteral,
    postInstance: Instance<Post>,
}) {
    const [editMode, setEditMode] = useState<boolean>(startWithEditMode);
    const componentTitleLabel = useMultiLang({
        "en": "edit sponsor details",
        "zh": "編輯贊助商資訊",
    })
    const clearAllAssociatedAssets = useCallback(async () => {
        if (sponsorInstance.data.imageAssetID) {
            try {
                await VaporAPI.deleteAsset(postInstance.id, sponsorInstance.data.imageAssetID)
            } catch (e) {
                console.warn("Unable to delete asset", postInstance, sponsorInstance)
            }
        }
    }, [sponsorInstance.data.imageAssetID, postInstance.id])
    // TODO: Use useEffect to clear unreferenced assets
    const componentName = useMultiLang(sponsorInstance.data.name)
    // TODO: Create component given sponsor, buffer and setBuffer, can display, reorder, edit, and delete a sponsor within a post.
    
    return (
        <div className="border border-current rounded-3xl p-4 flex flex-col gap-2">
            {/* Table for editing name, image, link, title, and description, two columns, one for the entry name, and one for the input components, leave input components with placeholders for now */}
            <div className="font-bold">
                <div className="flex flex-row gap-2">
                    <div>{editMode ? componentTitleLabel : componentName}</div>
                    <div className="grow"/>
                    <MagicIcon IconComponent={ArrowUpIcon} clickable onClick={() => {
                        // If there is a sponsor before this one, swap this sponsor with the one before it
                        const index = buffer.sponsors.indexOf(sponsorInstance);
                        if (index > 0) {
                            const newBuffer = cloneDeep(buffer);
                            const temp = newBuffer.sponsors[index];
                            newBuffer.sponsors[index] = newBuffer.sponsors[index - 1];
                            newBuffer.sponsors[index - 1] = temp;
                            setBuffer(newBuffer);
                        }
                    }}/> 
                    <MagicIcon IconComponent={ArrowDownIcon} clickable onClick={() => {
                        // If there is a sponsor after this one, swap this sponsor with the one after it
                        const index = buffer.sponsors.indexOf(sponsorInstance);
                        if (index < buffer.sponsors.length - 1) {
                            const newBuffer = cloneDeep(buffer);
                            const temp = newBuffer.sponsors[index];
                            newBuffer.sponsors[index] = newBuffer.sponsors[index + 1];
                            newBuffer.sponsors[index + 1] = temp;
                            setBuffer(newBuffer);
                        }
                    }}/>
                    <MagicIcon IconComponent={TrashIcon} clickable onClick={async () => {
                        // Remove sponsor from list, and delete the assets associated
                        await clearAllAssociatedAssets();
                        setBuffer({
                            ...buffer,
                            "sponsors": buffer.sponsors?.filter(testSponsor => testSponsor.id !== sponsorInstance.id)
                        })
                    }}/>
                    <MagicIcon IconComponent={editMode ? EyeIcon : PencilIcon} clickable onClick={() => setEditMode(!editMode)}/>
                </div>
            </div>
            <Switcher condition={editMode}
            trueChild={
                <SponsorComponentEdit buffer={buffer} setBuffer={setBuffer} sponsorInstance={sponsorInstance} setEditMode={setEditMode} activeLanguage={activeLanguage} postInstance={postInstance}/>
            }
            falseChild={
                <SponsorComponentView buffer={buffer} setBuffer={setBuffer} sponsorInstance={sponsorInstance} setEditMode={setEditMode} postInstance={postInstance}/>
            }/>
        </div>
    )
}

function SponsorComponentEdit({sponsorInstance, buffer, setBuffer, setEditMode, activeLanguage, postInstance}: {
    sponsorInstance: Instance<Sponsor>,
    buffer: Partial<Post>,
    setBuffer: (buffer: Partial<Post>) => void,
    setEditMode: (editMode: boolean) => void,
    activeLanguage: LanguageLiteral,
    postInstance: Instance<Post>,
}) { // TODO: Finish!
    const labels = useMultiLangObject({ // name, image, link, title, and description
        "nameLabel": {
            "en": "sponsor name",
            "zh": "贊助商名稱",
        },
        "imageLabel": {
            "en": "sponsor image",
            "zh": "贊助商圖片",
        },
        "linkLabel": {
            "en": "sponsor link",
            "zh": "贊助商連結",
        },
        "titleLabel": {
            "en": "sponsorship title",
            "zh": "贊助標題",
        },
        "descriptionLabel": {
            "en": "sponsorship description",
            "zh": "贊助描述",
        },
        "removeSponsorImageLabel": {
            "en": "remove sponsor image",
            "zh": "移除贊助商圖片",
        }
    })
    const sponsor = sponsorInstance.data;
    const updateSponsor = useCallback((modifier) => {
        var newSponsor = cloneDeep(sponsor);
        modifier(newSponsor); // Mutates the reference
        setBuffer({
            ...buffer,
            sponsors: buffer.sponsors.map((i_sponsorInstance: Instance<Sponsor>) => {
                if (i_sponsorInstance.id === sponsorInstance.id) {
                    return instance(newSponsor, i_sponsorInstance.id);
                } else {
                    return i_sponsorInstance;
                }
            })
        })
    }, [sponsorInstance, buffer, setBuffer]);

    return (
        // Do asset upload for image within this component, and if the sponsor gets deleted, delete the asset too. Tag image asset with sponsor-<id>.
        <table className="sponsor-table">
            <tbody>
                <tr>
                    <td>{labels.nameLabel}</td>
                    <td>
                        <Input typeName="string" value={sponsor.name[activeLanguage]} setValue={(newValue)=>{
                            updateSponsor((sponsor) => {
                                sponsor.name[activeLanguage] = newValue;
                            })
                        }}/>
                    </td>
                </tr>
                <tr>
                    <td>{labels.imageLabel}</td>
                    <td>
                        <Switcher condition={sponsor.imageAssetID === null}
                        trueChild={
                            <SingleFileAssetUploader extensions={["jpg", "jpeg", "png", "webp"]} postID={postInstance.id} tags={["sponsor-image", "2d-editor"]}
                            metadata={(file: File) => {
                                return {
                                    sourceAssetType: "Image",
                                    targetAssetType: "Image",
                                    name: file.name.split(".")[0],
                                    assetData: {
                                        fileName: file.name,
                                    }
                                }
                            }} onUploaded={(assetID)=>{
                                updateSponsor((sponsor) => {
                                    sponsor.imageAssetID = assetID;
                                })
                            }}/>
                        }
                        falseChild={
                            <MagicButton onClick={()=>{
                                console.log("clicked", sponsor)
                                if (sponsor.imageAssetID) {
                                    const oldID = sponsor.imageAssetID
                                    updateSponsor((newSponsor) => {
                                        newSponsor.imageAssetID = null;
                                    })
                                    VaporAPI.deleteAsset(postInstance.id, oldID)
                                }
                            }}>{labels["removeSponsorImageLabel"]}</MagicButton>
                        }/>
                    </td>
                </tr>
                <tr>
                    <td>{labels.linkLabel}</td>
                    <td className="flex flex-row gap-2">
                        <Input className="grow-0" typeName="boolean" value={sponsor.link!==null} setValue={(newValue)=>{
                            if (newValue) {
                                updateSponsor((sponsor) => {
                                    sponsor.link = "";    
                                })
                            } else {
                                updateSponsor((sponsor) => {
                                    sponsor.link = null;
                                }
                            )}
                        }}/>
                        <Condition condition={sponsor.link !== null}>
                            <Input typeName="string" value={sponsor.link} setValue={(newValue)=>{
                                updateSponsor((sponsor) => {
                                    sponsor.link = newValue;
                                })
                            }}/>
                        </Condition>
                    </td>
                </tr>
                <tr>
                    <td>{labels.titleLabel}</td>
                    <td>
                        <Input typeName="string" value={sponsor.title[activeLanguage]} setValue={(newValue)=>{
                            updateSponsor((sponsor) => {
                                sponsor.title[activeLanguage] = newValue;
                            })
                        }}/>
                    </td>
                </tr>
                <tr>
                    <td>{labels.descriptionLabel}</td>
                    <td>
                        <div className="flex flex-row gap-2">
                            <Input className="grow-0" typeName="boolean" value={sponsor.description!==null} setValue={(newValue)=>{
                                if (newValue) {
                                    updateSponsor((sponsor) => {
                                        sponsor.description = createEmptyMultilangString();    
                                    })
                                } else {
                                    updateSponsor((sponsor) => {
                                        sponsor.description = null;
                                    }
                                )}
                            }}/>
                            {
                                // TODO: Investigate! Somehow using the Conditional component doesn't work here properly.
                                (sponsor.description !== null) ?
                                <Input typeName="string" value={sponsor.description[activeLanguage]} setValue={(newValue)=>{
                                    updateSponsor((sponsor) => {
                                        sponsor.description[activeLanguage] = newValue;
                                    })
                                }}/> :
                                null
                            }
                                
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

function SponsorComponentView({sponsorInstance, buffer, setBuffer, setEditMode, postInstance}: {
    sponsorInstance: Instance<Sponsor>,
    buffer: Buffer,
    setBuffer: (newBuffer: Buffer) => void,
    setEditMode: (newEditMode: boolean) => void,
    postInstance: Instance<Post>
}) {
    if (sponsorInstance.data.imageAssetID !== null) {
        return (
            <div>
                <img className="h-12 min-w-fit" src={getSponsorImageURL(postInstance, sponsorInstance) as string}/>
            </div>
        )
    } else {
        return null
    }
}