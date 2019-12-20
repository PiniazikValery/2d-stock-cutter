import React, { useState, useRef, useEffect } from 'react';
import uuidv4 from 'uuid/v4';

const AddRectsPopup = ({ rectsList, setRectsList, setIsOpen, typeOnlyNumbers }) => {
    const [newRectWidth, setNewRectWidth] = useState('');
    const [newRectHeight, setNewRectHeight] = useState('');
    const [countOfRects, setCountOfRects] = useState('');

    const firstFocusableElement = useRef(null);
    const lastFocusableElement = useRef(null);

    const closePopup = () => {
        setIsOpen(false);
    };

    const switchTab = e => {
        return (withShift) => {
            const charCode = e.which || e.keyCode;
            const shift = withShift ? e.shiftKey : !e.shiftKey;
            if (charCode === 9 && shift) {
                withShift ? lastFocusableElement.current.focus() : firstFocusableElement.current.focus();
                e.preventDefault();
            }
        }
    };

    const addRects = () => {
        const newRects = rectsList;
        for (let i = 1; i <= countOfRects; i++) {
            newRects.push({ width: newRectWidth, height: newRectHeight, id: uuidv4() });
        }
        setRectsList(newRects);
        setIsOpen(false);
    };

    useEffect(() => {
        firstFocusableElement.current.focus();
    }, [firstFocusableElement]);

    return (
        <div className="popup-layout" onClick={closePopup}>
            <div className="popup-wrapper">
                <div className="popup" onClick={e => e.stopPropagation()}>
                    <span className="title">Добавление прямоугольника:</span>
                    <div className="field">
                        <span>Ширина:</span>
                        <input ref={firstFocusableElement} onKeyDown={event => switchTab(event)(true)} value={newRectWidth} onChange={event => typeOnlyNumbers(event.target.value, setNewRectWidth)} />
                    </div>
                    <div className="field">
                        <span>Высота:</span>
                        <input value={newRectHeight} onChange={event => typeOnlyNumbers(event.target.value, setNewRectHeight)} />
                    </div>
                    <div className="field">
                        <span>Колличество:</span>
                        <input value={countOfRects} onChange={event => typeOnlyNumbers(event.target.value, setCountOfRects)} />
                    </div>
                    <button onClick={addRects} ref={lastFocusableElement} onKeyDown={event => switchTab(event)(false)}>Добавить прямоугольники</button>
                </div>
            </div>
        </div>
    );
};

export default AddRectsPopup;
