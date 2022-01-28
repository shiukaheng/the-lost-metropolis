import { useState } from 'react';
import {
    NumberType, Vector3Type, Vector4Type, Vector2Type, ColorType, QuaternionType, EulerType, Matrix3Type, Matrix4Type, StringType, URLType
} from "./EditorInputTypes"
import { range } from "lodash"
import { createElement } from "react";

// Component for inputting numbers, has red boundary on input when invalid, checked with NumberType.typeCheck; only call onValueChange when input is valid
function NumberInput({defaultValue, onValueChange}) {
    const [value, setValue] = useState(defaultValue);
    const [isValid, setIsValid] = useState(true);
    return (
        <input className={`number-input ${isValid ? "" : "invalid"}`} type="number" value={value} onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (newValue !== value) {
                setValue(newValue);
                if (NumberType.typeCheck(newValue)) {
                    setIsValid(true);
                    onValueChange(newValue);
                } else {
                    setIsValid(false);
                }
            }
        }}/>
    );
}

function StringInput({defaultValue, onValueChange}) {
    const [value, setValue] = useState(defaultValue);
    return (
        <input className="string-input" type="text" value={value} onChange={(e) => {
            const newValue = e.target.value;
            if (newValue !== value) {
                setValue(newValue);
                onValueChange(newValue);
            }
        }}/>
    );
}

// Component for inputting a URL, has red boundary on input when invalid, checked with URLType.typeCheck and only call onValueChange when input is valid
function URLInput({defaultValue, onValueChange}) {
    const [value, setValue] = useState(defaultValue);
    const [isValid, setIsValid] = useState(true);
    return (
        <input className={`url-input ${isValid ? "" : "invalid"}`} type="url" value={value} onChange={(e) => {
            const newValue = e.target.value;
            if (newValue !== value) {
                setValue(newValue);
                if (URLType.typeCheck(newValue)) {
                    setIsValid(true);
                    onValueChange(newValue);
                } else {
                    setIsValid(false);
                }
            }
        }}/>
    );
}

// Generic component for inputting a matrix of any dimension, composed by N x M cells of html number input elements, borders should all turn red when output matrix is only call onValueChange when input is valid
function MatrixInput({rows, columns, defaultValue, onValueChange}) {
    const [value, setValue] = useState(defaultValue);
    const [isValid, setIsValid] = useState(true);
    return (
        <div className="matrix-input">
            {
                range(rows).map(row => (
                    <div key={row} className="matrix-row">
                        {
                            range(columns).map(column => (
                                <input key={column} className={`matrix-cell ${isValid ? "" : "invalid"}`} type="number" value={value[row][column]} onChange={(e) => {
                                    const newValue = value.map(row => row.slice()); // clone
                                    newValue[row][column] = parseFloat(e.target.value);
                                    setValue(newValue);
                                    if (MatrixType.typeCheck(newValue)) {
                                        setIsValid(true);
                                        onValueChange(newValue);
                                    } else {
                                        setIsValid(false);
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
function VectorInput({length, defaultValue, onValueChange}) {
    const [value, setValue] = useState(defaultValue);
    const [isValid, setIsValid] = useState(true);
    return (
        <div className="vector-input">
            {
                range(length).map(index => (
                    <input key={index} className={`vector-cell ${isValid ? "" : "invalid"}`} type="number" value={value[index]} onChange={(e) => {
                        const newValue = value.slice();
                        newValue[index] = parseFloat(e.target.value);
                        setValue(newValue);
                        if (VectorType.typeCheck(newValue)) {
                            setIsValid(true);
                            onValueChange(newValue);
                        } else {
                            setIsValid(false);
                        }
                    }}/>
                ))
            }
        </div>
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

function ColorInput({defaultValue, onValueChange}) {
    const [value, setValue] = useState(defaultValue);
    return (
        <input className="color-input" type="color" value={value} onChange={(e) => {
            const newValue = hexStringToRGB(e.target.value);
            if (newValue !== value) {
                setValue(newValue);
                onValueChange(newValue);
            }
        }}/>
    );
}

const Vector2Input = ({defaultValue, onValueChange}) => VectorInput({length: 2, defaultValue, onValueChange});
const Vector3Input = ({defaultValue, onValueChange}) => VectorInput({length: 3, defaultValue, onValueChange});
const Vector4Input = ({defaultValue, onValueChange}) => VectorInput({length: 4, defaultValue, onValueChange});
const QuaternionType = ({defaultValue, onValueChange}) => VectorInput({length: 4, defaultValue, onValueChange});
const EulerType = ({defaultValue, onValueChange}) => VectorInput({length: 3, defaultValue, onValueChange});
const Matrix3Input = ({defaultValue, onValueChange}) => MatrixInput({rows: 3, columns: 3, defaultValue, onValueChange});
const Matrix4Input = ({defaultValue, onValueChange}) => MatrixInput({rows: 4, columns: 4, defaultValue, onValueChange});

const InputComponentMap = {
    "number": NumberInput,
    "string": StringInput,
    "url": URLInput,
    "color": ColorInput,
    "vector2": Vector2Input,
    "vector3": Vector3Input,
    "vector4": Vector4Input,
    "quaternion": QuaternionType,
    "euler": EulerType,
    "matrix3": Matrix3Input,
    "matrix4": Matrix4Input
}

type EditorInputProps = {
    propName: string
    typeName: string
    defaultValue: any
    onValueChange: (value: any) => void
}

function EditorInputField({propName, typeName, defaultValue, onValueChange}:EditorInputProps) {
    return (
        <div className="editor-input-field">
            <div className="editor-input-label">{propName}</div>
            {createElement(InputComponentMap[typeName], {defaultValue, onValueChange})}
        </div>
    );
}

export default EditorInputField;