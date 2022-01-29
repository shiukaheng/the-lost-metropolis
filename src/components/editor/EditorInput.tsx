import { useRef, useState } from 'react';
import {
    NumberType, Vector3Type, Vector4Type, Vector2Type, ColorType, QuaternionType, EulerType, Matrix3Type, Matrix4Type, StringType, URLType, MatrixType, VectorType, EditorInputType, BooleanType
} from "./EditorInputTypes"
import { range } from "lodash"
import { createElement } from "react";

// Props for input elements:
// value is the current value of the property, used to display the current value of the property in the editor
// setValue is the function to update the state of the parent component, only call when user input is checked to be valid using type's typeCheck function

// Component for inputting numbers
function NumberInput({value, setValue}) {
    const [valid, setValid] = useState(true);
    return (
        <input className={`number-input-field ${valid ? "" : "invalid"}`} type="number" value={value} onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (NumberType.typeCheck(newValue)) {
                setValue(newValue);
                setValid(true);
            } else {
                setValid(false);
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
        <input className={`string-input-cell ${valid ? "" : "invalid"}`} type="text" value={value} onChange={(e) => {
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
    return (
        <input className={`string-input-cell ${valid ? "" : "invalid"}`} type="text" value={value} onChange={(e) => {
            const newValue = e.target.value;
            if (URLType.typeCheck(newValue)) {
                setValue(newValue);
                setValid(true);
            } else {
                setValid(false);
            }
        }}/>
    );
}

function MatrixInput({rows, columns, value, setValue}) {
    const [valid, setValid] = useState(true);
    return (
        <div className={`matrix-input ${valid ? "" : "invalid"}`}>
            {
                range(rows).map(row => (
                    <div key={row} className="matrix-input-row">
                        {
                            range(columns).map(column => (
                                <input key={column} className={`matrix-input-cell ${valid ? "" : "invalid"}`} type="number" value={value[row][column]} onChange={(e) => {
                                    const newValue = value.map(row => row.slice()); // clone
                                    newValue[row][column] = parseFloat(e.target.value);
                                    console.log(newValue)
                                    if (MatrixType.typeCheck(newValue)) {
                                        setValue(newValue);
                                        setValid(true);
                                    } else {
                                        setValid(false);
                                    }
                                }}/>
                            ))
                        }
                    </div>
                ))
            }
        </div>
    );
}

// Generic component for inputting a vector of any dimension, composed by N cells of html number input elements, borders should all turn red when output vector is only call onValueChange when input is valid
// function VectorInput({length, value, setValue}) {
//     const [valid, setValid] = useState(true);
//     return (
//         <div className={`editor-input-field ${valid ? "" : "invalid"}`}>
//             {
//                 range(length).map(index => (
//                     <input key={index} className={`vector-cell ${valid ? "" : "invalid"}`} type="number" value={value[index]} onChange={(e) => {
//                         const newValue = value.map(value => value); // clone
//                         newValue[index] = parseFloat(e.target.value);
//                         if (VectorType.typeCheck(newValue)) {
//                             setValue(newValue);
//                             setValid(true);
//                         } else {
//                             setValid(false);
//                         }
//                     }}/>
//                 ))
//             }
//         </div>
//     );
// }

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

function hexStringToRGB(hexString) {
    const hex = hexString.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(6, 8), 16);
    return [r, g, b];
}

// ColorInput uses html color input element, no type checking needed as the input element always returns a valid RGB color
function ColorInput({value, setValue}) {
    return (
        <input className="color-input-cell" type="color" value={value} onChange={(e) => {
            const newValue = hexStringToRGB(e.target.value);
            setValue(newValue)
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
}

type EditorInputProps = {
    propName: string
    typeName: string
    value: any
    setValue: (value: any) => void
    
}

function EditorInput({propName, typeName, value, setValue}:EditorInputProps) {
    // Props:
    // propName is the display name of the property, used to display the name of the property in the editor
    // value is the current value of the property, used to display the current value of the property in the editor
    // setValue is the function to update the state of the parent component, only call when user input is valid
    // typeName is the type of the property, used to determine which input component to use
    return (
        <div className="flex flex-row gap-2">
            <div className="editor-input-label">{propName}</div>
            {
                createElement(InputComponentMap[typeName], {value, setValue})
            }
        </div>
    )
}

export default EditorInput;