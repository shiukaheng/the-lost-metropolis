import { useDeviceType, useMultiLangObject } from "../../../utilities";
import MagicIcon from "../../utilities/MagicIcon";
import { ReactComponent as Arrows } from './ControlTips/arrow.svg';
import { ReactComponent as Click } from './ControlTips/click.svg';

export function ControlTipsInner() {
    const deviceType = useDeviceType();
    const tips = useMultiLangObject({
        "mobile": {
            "en": "drag to look around, double-tap the floor to walk",
            "zh": "拖動畫面觀望，雙擊地面前行"
        },
        "desktop": {
            "en": "click screen to use the mouse to look around, arrow keys or WASD to move, space to fly up, shift to fly down",
            "zh": "點擊畫面, 使用滑鼠觀望，方向鍵或WASD移動，空白鍵向上飛，shift向下飛"
        }
    })
    if (deviceType === "mobile") {
        return (
            <div>
                <MagicIcon IconComponent={Click}/>
                <div className="font-bold">{tips["mobile"]}</div>
            </div>
        )
    } else if (deviceType === "desktop") {
        return (
            <div>
                <MagicIcon IconComponent={Arrows}/>
                <div className="font-bold">{tips["desktop"]}</div>
            </div>
        )
    }
}