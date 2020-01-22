import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import io from "socket.io-client";
import uuidv4 from 'uuid/v4';
import AddRectsPopup from './components/addRectsPopup';
import ReactGA from 'react-ga';

const socket = io(API_URL);

function initReactGA() {
  ReactGA.initialize('UA-156682948-2');
  ReactGA.pageview('/homepage');
}

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
  const [popupIsOpen, setPopupIsOpen] = useState(false);

  const canvasOfChromosome = useRef(null);
  const widthOfNewRectInput = useRef(null);

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
      widthOfNewRectInput.current.focus();
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
      {initReactGA()}
      {popupIsOpen && <AddRectsPopup rectsList={rectsList} setRectsList={setRectsList} setIsOpen={setPopupIsOpen} typeOnlyNumbers={typeOnlyNumbers} />}
      <div className="editor">
        <div className="rect-editor">
          <span className="title">Stock parameters:</span>
          <div className="field">
            <span>Width:</span>
            <input value={outerRectWidth} onChange={event => typeOnlyNumbers(event.target.value, setOuterRectWidth)} />
          </div>
          <div className="field">
            <span>Height:</span>
            <input value={outerRectHeight} onChange={event => typeOnlyNumbers(event.target.value, setOuterRectHeight)} />
          </div>
          <span className="title">Add rectangle:</span>
          <div className="field">
            <span>Width:</span>
            <input ref={widthOfNewRectInput} value={newRectWidth} onChange={event => typeOnlyNumbers(event.target.value, setNewRectWidth)} />
          </div>
          <div className="field">
            <span>Height:</span>
            <input value={newRectHeight} onChange={event => typeOnlyNumbers(event.target.value, setNewRectHeight)} />
          </div>
          <div className="add-rect-buttons">
            <button onClick={onClickAddNewRect}>Add</button>
            <button onClick={() => setPopupIsOpen(true)}>Add group of rectangles</button>
          </div>
        </div>
        <div className="rect-list">
          {rectsList.map((rect) => {
            return (
              <div key={rect.id}>
                <button onClick={() => onDeleteRect(rect.id)} className="delete-rect">Delete</button>
                <span>{rect.width} x {rect.height}</span>
              </div>
            );
          })}
        </div>
        <div className="start-evolution">
          <button disabled={!launchIsAvaliable} onClick={onStartEvolution}>Launch algorithm</button>
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
          <span className="title">Algorithm results</span>
          <br />
          <span className="info_value">Square of all rectangles: {chromosomesSquare || '-'}</span>
          <br />
          <span className="info_value">All square: {outerRectWidth && outerRectHeight ? outerRectHeight * outerRectWidth : '-'}</span>
          <br />
          <span className="info_value">Square of the left space: {freeSpace || '-'}</span>
          <br />
          <span className="info_value">Survival: {fitnessScore ? fitnessScore * 100 + '%' : '-'}</span>
          <br />
          <span className="info_value">Algorithms work time: {workTime ? workTime + 'ms' : '-'}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
