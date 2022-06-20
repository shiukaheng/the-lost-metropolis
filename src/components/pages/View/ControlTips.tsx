import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useDeviceType } from "../../../utilities";

export function ControlTips() {
    const deviceType = useDeviceType();
    if (deviceType === "mobile") {
        return null;
    } else if (deviceType === "desktop") {
        return null;
    }
}