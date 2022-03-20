import { useContext, useEffect, useState } from 'react';
import {
    NumberType, Vector3Type, Vector4Type, Vector2Type, ColorType, QuaternionType, EulerType, Matrix3Type, Matrix4Type, StringType, URLType, MatrixType, VectorType, EditorInputType, BooleanType
} from "../viewer/ArgumentTypes"
import { range } from "lodash"
import { createElement } from "react";
import MagicDiv from '../utilities/MagicDiv';
import { LinearToSRGB, SRGBToLinear, useLazyEffect } from '../../utilities';
import { targetAssetLiteralSchema } from '../../../api/types/AssetLiteral';
import { EditorContext } from '../editor/EditorContext';
import { ClientAsset } from '../../api_client/types/ClientAsset';
import Select from 'react-select';
import { createSelectStyles } from '../editor/utilities';
import { ThemedSelect } from './ThemedSelect';

// Props for input elements:
// value is the current value of the property, used to display the current value of the property in the editor
// setValue is the function to update the state of the parent component, only call when user input is checked to be valid using type's typeCheck function

// Component for inputting numbers
function NumberInput({value, setValue}) {
    const [valid, setValid] = useState(true);
    const [inputBuffer, setInputBuffer] = useState(value);
    useEffect(()=>{
        if (NumberType.typeCheck(value)) {
            setValid(true);
        } else {
            setValid(false);
        }
        setInputBuffer(value);
    }, [value]);
    return (
        <input className={`number-input-field ${valid ? "" : "invalid"}`} type="number" placeholder={value} value={valid ? value : inputBuffer} onChange={(e) => {
            if (e.target.value === "") {
                setInputBuffer("")
                setValid(false)
            } else {
                const newValue = parseFloat(e.target.value);
                if (NumberType.typeCheck(newValue)) {
                    setValue(newValue);
                    setValid(true);
                } else {
                    setInputBuffer(newValue);
                    setValid(false);
                }
            }
        }}/>
    );
}

// Component for inputting boolean
function BooleanInput({value, setValue}) {
    return (
        <input className="boolean-input-field" type="checkbox" checked={value} onChange={(e) => setValue(e.target.checked)}/>
    );
}

// Component for inputting strings
function StringInput({value, setValue}) {
    const [valid, setValid] = useState(true);
    return (
        <input className={`string-input-cell ${valid ? "" : "invalid"}`} type="text" placeholder={value} value={value} onChange={(e) => {
            const newValue = e.target.value;
            if (StringType.typeCheck(newValue)) {
                setValue(newValue);
                setValid(true);
            } else {
                setValid(false);
            }
        }}/>
    );
}

// Component for inputting a URL, has red boundary on input when invalid, checked with URLType.typeCheck and only call onValueChange when input is valid
function URLInput({value, setValue}) {
    const [valid, setValid] = useState(true);
    const [inputBuffer, setInputBuffer] = useState(value);
    return (
        <input className={`string-input-cell ${valid ? "" : "invalid"}`} type="text" placeholder={value} value={valid ? value : inputBuffer} onChange={(e) => {
            const newValue = e.target.value;
            if (URLType.typeCheck(newValue)) {
                setValue(newValue);
                setValid(true);
            }
            else {
                setInputBuffer(newValue);
                setValid(false);
            }
        }}/>
    );
}

function MatrixInput({rows, columns, value, setValue}) {
    const [valid, setValid] = useState(true);
    const [inputBuffer, setInputBuffer] = useState(value);
    useEffect(()=>{
        if (MatrixType.typeCheck(value)) {
            setValid(true);
        } else {
            setValid(false);
        }
        // Keep input buffer in sync with value
        setInputBuffer(value);
    }, [value]);
    return (
        <div className={`matrix-input ${valid ? "" : "invalid"}`}>
            {
                range(rows).map(row => (
                    <div key={row} className="matrix-input-row">
                        {
                            range(columns).map(column => (
                                <input key={column} className={`matrix-input-cell ${valid ? "" : "invalid"}`} type="number" placeholder={value[row][column]} value={valid ? value[row][column] : inputBuffer[row][column]} onChange={(e) => {
                                    const newValue = value.map(row => row.slice()); // clone
                                    if (e.target.value === "") {
                                        newValue[row][column] = "";
                                        setInputBuffer(newValue);
                                        setValid(false);
                                    } else {
                                        newValue[row][column] = parseFloat(e.target.value);
                                        if (MatrixType.typeCheck(newValue)) {
                                            setValue(newValue);
                                            setValid(true);
                                        } else {
                                            setInputBuffer(newValue);
                                            setValid(false);
                                        }
                                    }
                                }}
                                onBlur={
                                    // When input is blurred and invalid, set input buffer to value and set valid to true
                                    () => {
                                        if (!valid) {
                                            setInputBuffer(value);
                                            setValid(true);
                                        }
                                    }
                                }/>
                            ))
                        }
                    </div>
                ))
            }
        </div>
    );
}

function VectorInput({length, value, setValue}) {
    const wrappedSetValue = (newValue) => {
        setValue(newValue[0]);
    }
    return (
        <MatrixInput rows={1} columns={length} value={[value]} setValue={wrappedSetValue}/>
    );
}

function EulerInput({value, setValue}) {
    // omit last element of value, as it is the order of the rotation
    const parsedValue = value.slice(0, 3);
    return (
        <VectorInput length={3} value={parsedValue} setValue={setValue}/>
    );
}

// Component for inputting a color using html color input element, but transform the hex string into a three number array representing RGB, no type checking needed as the input element always returns a valid RGB color

function rgbToHexString(rgb) {
    var rgb = rgb.map(x => Math.round(x * 255));
    return "#" + rgb.map(c => (c.toString(16).padStart(2, "0"))).join("");
}

function hexStringToRGB(hexString) {
    // Input is a string of the form "#RRGGBB"
    // Output [r, g, b] where each is between 0 and 1
    const hex = hexString.slice(1);
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return [r, g, b]
}

// ColorInput uses html color input element, no type checking needed as the input element always returns a valid RGB color
function ColorInput({value, setValue}) {
    return (
        <input className="color-input-cell" type="color" value={rgbToHexString(LinearToSRGB(value))} onChange={(e) => {
            const newValue = SRGBToLinear(hexStringToRGB(e.target.value));
            setValue(newValue)
        }}/>
        // <input className="color-input-cell" type="color" value={value} onChange={(e) => {
        //     setValue(e.target.value)
        // }}/>
    );
}

// Multiline string input using textarea
function MultilineStringInput({value, setValue}) {
    return (
        <textarea className="multiline-string-input-cell h-72" value={value} onChange={(e) => {
            setValue(e.target.value)
        }}/>
    );
}

// Helper functions for flattening and unflattening between vector and matrix

function flattenMatrix(matrix) {
    return matrix.reduce((acc, row) => acc.concat(row), []);
}

function unflattenMatrix(vector, rows, columns) {
    const matrix = [];
    for (let row = 0; row < rows; row++) {
        matrix[row] = vector.slice(row * columns, row * columns + columns);
    }
    return matrix;
}

const Vector2Input = ({value, setValue}) => VectorInput({length: 2, value, setValue});
const Vector3Input = ({value, setValue}) => VectorInput({length: 3, value, setValue});
const Vector4Input = ({value, setValue}) => VectorInput({length: 4, value, setValue});
const QuaternionInput = ({value, setValue}) => VectorInput({length: 4, value, setValue});
const Matrix3Input = ({value, setValue}) => MatrixInput({rows: 3, columns: 3, value: unflattenMatrix(value, 3, 3), setValue: (value) => setValue(flattenMatrix(value))});
const Matrix4Input = ({value, setValue}) => MatrixInput({rows: 4, columns: 4, value: unflattenMatrix(value, 4, 4), setValue: (value) => setValue(flattenMatrix(value))});

function AssetInput({value, setValue, data}) {
    // Check that data is an array of valid assetLiterals (use assetLiteralSchema)
    const { clientAssets } = useContext(EditorContext)
    if (Array.isArray(data)) {
        for (const type of data) {
            if (!targetAssetLiteralSchema.isValidSync(type)) {
                console.error("Invalid asset literal", type);
                return null;
            }
        }
    } else {
        console.error("Invalid data value", data)
        throw new Error("AssetInput data must be an array of asset literals");
    }
    let availableAssets: ClientAsset[] = []
    if (clientAssets !== null) {
        availableAssets = clientAssets.filter(asset => data.includes(asset.type)) 
    }
    const selectOptions = availableAssets.map(asset => ({
        label: asset.name,
        value: asset
    }))
    useLazyEffect(()=>{
        if (!clientAssets.includes(value)) {
            setValue(null)
        }
    }, [clientAssets])
    // Use EditorContext to get the current asset library and map it into an options list for Select element
    // Use if else to check if editorContext actually exists, if it doesnt just return empty list
    return (
        <ThemedSelect className="flex-grow" options={selectOptions} onChange={(selectedOption, _)=>{
            setValue(selectedOption.value)
        }} value={selectOptions.find(entry => entry.value === value)}/>
    )
}

const InputComponentMap = {
    "number": NumberInput,
    "string": StringInput,
    "url": URLInput,
    "color": ColorInput,
    "vector2": Vector2Input,
    "vector3": Vector3Input,
    "vector4": Vector4Input,
    "quaternion": QuaternionInput,
    "euler": EulerInput,
    "matrix3": Matrix3Input,
    "matrix4": Matrix4Input,
    "boolean": BooleanInput,
    "multiline-string": MultilineStringInput,
    "asset": AssetInput
}

type InputProps = {
    typeName: string
    value: any
    setValue: (value: any) => void
    data?: any
}

function Input({typeName, value, setValue, data}:InputProps) {
    // Props:
    // propName is the display name of the property, used to display the name of the property in the editor
    // value is the current value of the property, used to display the current value of the property in the editor
    // setValue is the function to update the state of the parent component, only call when user input is valid
    // typeName is the type of the property, used to determine which input component to use
    return (
        <MagicDiv className="flex flex-row gap-2 flex-grow">
            {
                createElement(InputComponentMap[typeName], {value, setValue, data})
            }
        </MagicDiv>
    )
}

export {Input, InputProps, InputComponentMap};