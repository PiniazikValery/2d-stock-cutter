import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import io from "socket.io-client";
import uuidv4 from 'uuid/v4';

const socket = io(API_URL);

function App() {
  const [chromosome, setChromosome] = useState(undefined);
  const [newRectWidth, setNewRectWidth] = useState('');
  const [newRectHeight, setNewRectHeight] = useState('');
  const [outerRectWidth, setOuterRectWidth] = useState('');
  const [outerRectHeight, setOuterRectHeight] = useState('');
  const [rectsList, setRectsList] = useState([]);
  const [resultIsLoading, setResultIsLoading] = useState(false);
  const [launchIsAvaliable, setLaunchIsAvaliable] = useState(false);

  const canvasOfChromosome = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on('successResult', result => {
        setResultIsLoading(false);
        setChromosome(result);
      });
    }
    if (chromosome) {
      initCanvasOfGens();
      drowGens();
    }
  });

  useEffect(() => {
    if (socket && rectsList.length !== 0 && outerRectWidth && outerRectHeight && !resultIsLoading) {
      setLaunchIsAvaliable(true);
    } else {
      setLaunchIsAvaliable(false);
    }
  }, [rectsList.length, outerRectWidth, outerRectHeight, resultIsLoading]);

  const initCanvasOfGens = () => {
    var ctx = canvasOfChromosome.current.getContext("2d");
    ctx.beginPath();
    ctx.rect(0, 0, chromosome.width, chromosome.height);
  };

  const drowGens = () => {
    var ctx = canvasOfChromosome.current.getContext("2d");
    chromosome.gens.forEach(gen => {
      ctx.beginPath();
      ctx.rect(gen.x - (gen.width / 2), gen.y - (gen.height / 2), gen.width, gen.height);
      ctx.stroke();
    });
  };

  const clearAllNewRectInputFields = () => {
    setNewRectHeight('');
    setNewRectWidth('');
  };

  const onClickAddNewRect = () => {
    if (newRectWidth && newRectHeight) {
      const newRectsList = rectsList;
      newRectsList.push({ width: newRectWidth, height: newRectHeight, id: uuidv4() });
      setRectsList(newRectsList);
      clearAllNewRectInputFields();
    }
  };

  const typeOnlyNumbers = (value, callback) => {
    if (!isNaN(value)) {
      callback(value);
    }
  }

  const onDeleteRect = (id) => {
    setRectsList(rectsList.filter(rect => rect.id !== id));
  };

  const onStartEvolution = () => {
    setChromosome(undefined);
    setResultIsLoading(true);
    axios.post('/chromosome', {
      params: {
        socketId: socket.id,
        genCollection: rectsList.map(gen => { return { width: gen.width, height: gen.height } }),
        width: outerRectWidth,
        height: outerRectHeight
      }
    })
      .catch(function (error) {
        console.log({
          msg: 'unable to load chromosome',
          error
        });
      });
  };

  return (
    <div className="App">
      <div className="editor">
        <div className="rect-editor">
          <div className="field">
            <span>Ширина внешнего прямоугольника:</span>
            <input value={outerRectWidth} onChange={event => typeOnlyNumbers(event.target.value, setOuterRectWidth)} />
          </div>
          <div className="field">
            <span>Высота внешнего прямоугольника:</span>
            <input value={outerRectHeight} onChange={event => typeOnlyNumbers(event.target.value, setOuterRectHeight)} />
          </div>
          <div className="field">
            <span>Ширина прямоугольника:</span>
            <input value={newRectWidth} onChange={event => typeOnlyNumbers(event.target.value, setNewRectWidth)} />
          </div>
          <div className="field">
            <span>Высота прямоугольника:</span>
            <input value={newRectHeight} onChange={event => typeOnlyNumbers(event.target.value, setNewRectHeight)} />
          </div>
          <div>
            <button onClick={onClickAddNewRect}>Добавить прямоугольник</button>
          </div>
        </div>
        <div className="rect-list">
          {rectsList.map((rect) => {
            return (
              <div key={rect.id}>
                <button onClick={() => onDeleteRect(rect.id)} className="delete-rect">Удалить</button>
                <span>{rect.width} x {rect.height}</span>
              </div>
            );
          })}
        </div>
        <div className="start-evolution">
          <button disabled={!launchIsAvaliable} onClick={onStartEvolution}>Пуск</button>
        </div>
      </div>
      <div className="result_img">
        {chromosome ? <canvas ref={canvasOfChromosome} width={chromosome.width} height={chromosome.height} /> : undefined}
      </div>
    </div>
  );
}

export default App;
