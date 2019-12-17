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
  const [socketListenerIsOn, setSocketListener] = useState(false);
  const [chromosomesSquare, setChromosomesSquare] = useState(undefined);
  const [freeSpace, setFreeSpace] = useState(undefined);
  const [fitnessScore, setFitnessScore] = useState(undefined);
  const [workTime, setWorkTime] = useState(undefined);
  const [drawInfo, setDrawInfo] = useState(undefined);

  const canvasOfChromosome = useRef(null);

  useEffect(() => {
    const initCanvasOfGens = () => {
      const ctx = canvasOfChromosome.current.getContext("2d");
      ctx.beginPath();
      ctx.rect(0, 0, drawInfo.widthToDraw, drawInfo.heightToDraw);
    };

    const drowGens = () => {
      const ctx = canvasOfChromosome.current.getContext("2d");
      chromosome.gens.forEach(gen => {
        ctx.beginPath();
        ctx.rect(gen.x - (gen.width / 2), gen.y - (gen.height / 2), gen.width, gen.height);
        ctx.stroke();
      });
    };

    const drowOuterRect = () => {
      const ctx = canvasOfChromosome.current.getContext("2d");
      ctx.beginPath();
      ctx.rect(0, 0, drawInfo.outerRectWidth, drawInfo.outerRectHeight);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 5;
      ctx.stroke();
    };

    if (socket && !socketListenerIsOn) {
      setSocketListener(true);
      socket.on('successResult', result => {
        setWorkTime(result.info.time);
        setChromosomesSquare(typeof result.info.chromosomeSquare === 'object' ? result.info.chromosomeSquare.width * result.info.chromosomeSquare.height : result.info.chromosomeSquare);
        setFreeSpace(result.info.freeSpace);
        setFitnessScore(result.info.fitness);
        setDrawInfo(result.drawInfo);
        setResultIsLoading(false);
        setChromosome(result);
      });
    }
    if (chromosome) {
      initCanvasOfGens();
      drowGens();
      drowOuterRect();
    }
  }, [chromosome, socketListenerIsOn, drawInfo]);

  useEffect(() => {
    if (socket && rectsList.length !== 0 && outerRectWidth && outerRectHeight && !resultIsLoading) {
      setLaunchIsAvaliable(true);
    } else {
      setLaunchIsAvaliable(false);
    }
  }, [rectsList.length, outerRectWidth, outerRectHeight, resultIsLoading]);

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

  const cleanResults = () => {
    setWorkTime(undefined);
    setChromosomesSquare(undefined);
    setFreeSpace(undefined);
    setFitnessScore(undefined);
  }

  const onStartEvolution = () => {
    setChromosome(undefined);
    setResultIsLoading(true);
    cleanResults();
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
      <div className="result">
        <div className="result_img">
          {chromosome ?
            <div className="canvas_wrapper">
              <canvas ref={canvasOfChromosome} width={drawInfo.widthToDraw} height={drawInfo.heightToDraw} />
            </div>
            : undefined}
        </div>
        <div className="result_info">
          <span className="title">Результаты работы</span>
          <br />
          <span className="info_value">Площадь всех прямоугольников: {chromosomesSquare || '-'}</span>
          <br />
          <span className="info_value">Общая площадь: {outerRectWidth && outerRectHeight ? outerRectHeight * outerRectWidth : '-'}</span>
          <br />
          <span className="info_value">Площадь остатков: {freeSpace || '-'}</span>
          <br />
          <span className="info_value">Выживаемость: {fitnessScore ? fitnessScore * 100 + '%' : '-'}</span>
          <br />
          <span className="info_value">Время работы алгоритма: {workTime ? workTime + 'ms' : '-'}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
