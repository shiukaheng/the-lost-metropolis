import { useEffect, useState } from 'react';
import {
    NumberType, Vector3Type, Vector4Type, Vector2Type, ColorType, QuaternionType, EulerType, Matrix3Type, Matrix4Type, StringType, URLType, MatrixType, VectorType, EditorInputType, BooleanType
} from "../../viewer/ArgumentTypes"
import { range } from "lodash"
import { createElement } from "react";
import { LinearToSRGB, SRGBToLinear } from '../../../utilities';
import MagicDiv from '../../utilities/MagicDiv';
import { Input } from '../../utilities/Input';

type EditorInputProps = {
    propName: string
    typeName: string
    value: any
    setValue: (value: any) => void
    data?: any
}

function EditorInput({propName, typeName, value, setValue, data}:EditorInputProps) {
    return (
        <MagicDiv className="flex flex-row gap-2">
            <div className="editor-input-label">{propName}</div>
            <Input {...{typeName, value, setValue, data}}/>
        </MagicDiv>
    )
}

export default EditorInput;