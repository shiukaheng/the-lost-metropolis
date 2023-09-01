import { useDeviceType, useMultiLangObject } from "../../../utilities";
import MagicDiv from "../../utilities/MagicDiv";
import MagicIcon from "../../utilities/MagicIcon";
import { NewLineParser } from "../../utilities/NewLineParser";
import { ReactComponent as Arrows } from './ControlTips/arrows.svg';
import { ReactComponent as Click } from './ControlTips/click.svg';

export function ControlTipsInner() {
    const deviceType = useDeviceType();
    const tips = useMultiLangObject({
        "mobile": {
            "en": "drag to look around, double-tap the floor to walk",
            "zh": "拖動畫面觀望，\n雙擊地面前行"
        },
        "desktop": {
            "en": "click screen to use the mouse to look around, arrow keys or WASD to move, space to fly up, shift to fly down",
            "zh": "點擊畫面, 使用滑鼠觀望，方向鍵或WASD移動，空白鍵向上飛，shift向下飛"
        }
    })
    if (deviceType === "mobile") {
        return (
            <div className="flex flex-row gap-4">
                <div className="shrink-0">
                    <MagicIcon fillCurrent className="w-12 h-12 translate-y-[-2]" IconComponent={Click}/>
                </div>
                <div className="font-bold">
                    <NewLineParser text={tips["mobile"]}/>
                </div>
            </div>
        )
    } else if (deviceType === "desktop") {
        return (
            <div className="flex flex-row gap-4">
                <div className="shrink-0">
                    <MagicIcon fillCurrent className="w-6 h-6 md:w-12 md:h-12 translate-y-[-2]" IconComponent={Arrows}/>
                </div>
                <div className="font-bold">{tips["desktop"]}</div>
            </div>
        )
    }
    return null;
}

export function ControlTips({className=""}) {
    return (
        <MagicDiv mergeTransitions className={className}>
            <ControlTipsInner/>
        </MagicDiv>
    )
}