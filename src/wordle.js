import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti'

export default function Wordle() {
  const [wordle, setWordle] = useState([
    { guess: ['', '', '', '', ''], row: 1, state:["U", "U", "U", "U", "U"]}, //U = unanswered, W = wrong letter, CR = correct and right spot, CW = correct but wrong spot
    { guess: ['', '', '', '', ''], row: 2, state:["U", "U", "U", "U", "U"]},
    { guess: ['', '', '', '', ''], row: 3, state:["U", "U", "U", "U", "U"]},
    { guess: ['', '', '', '', ''], row: 4, state:["U", "U", "U", "U", "U"]},
    { guess: ['', '', '', '', ''], row: 5, state:["U", "U", "U", "U", "U"]},
  ]);

  const [currentRow, setCurrentRow] = useState(1);
  const [win, setWin] = useState(false);
  const [flashBackground, setFlashBackground] = useState(false);
  const [CorrectWord, setCorrectWord] = useState('');
  const [lose, setLose] = useState(false);
  const [takenLetters, setTakenLetters] = useState({
      wrongLetters: [],
      correctLetters: [],
  })
  const [reset, setReset] = useState(0);
  const [start, setStart] = useState(false);
  const [record, setRecord] = useState(false);
  const [checking, setChecking] = useState(false);

  function StartScreen() {
    const WordleText = ['W', 'O', 'R', 'D', 'L', 'E']
    const WordleTextMap = WordleText.map((x) => {
      return <div className='wordleTextBox'>{x}</div>
    })
    return <div className='startScreen'>
      <div className='WordleText'>{WordleTextMap}</div>
      <div className='checkBoxContainer'>
        <input type='checkbox' id='check'></input>
        <label for='check' className='checkLabel' checked={record}>Record Attempts</label>
      </div>
      <button className='startWordleButton' onClick={() => {
        const checkBox = document.getElementById('check');
        if (checkBox.checked) {
          setRecord(true)
        }
        setStart(true)
      }}>START GAME</button>
    </div>
  }
  
  function ResetWordle() {
    setWordle([
      { guess: ['', '', '', '', ''], row: 1, state:["U", "U", "U", "U", "U"]},
      { guess: ['', '', '', '', ''], row: 2, state:["U", "U", "U", "U", "U"]},
      { guess: ['', '', '', '', ''], row: 3, state:["U", "U", "U", "U", "U"]},
      { guess: ['', '', '', '', ''], row: 4, state:["U", "U", "U", "U", "U"]},
      { guess: ['', '', '', '', ''], row: 5, state:["U", "U", "U", "U", "U"]},
    ])
    setTakenLetters({
      wrongLetters: [],
      correctLetters: [],
  })
    setFlashBackground(false);
    setCorrectWord(avaliableWords[Math.floor(Math.random() * avaliableWords.length)]);
    setCurrentRow(1);
    setReset((preval) => preval + 1);
  }

  var words = require('an-array-of-english-words');
  var avaliableWords = words.filter(d => d.length === 5);

  React.useEffect(() => {
     setCorrectWord(avaliableWords[Math.floor(Math.random() * avaliableWords.length)]);
  }, [])

  function getCurrent() {
    let currentWord;
    wordle.map((x) => x.row === currentRow ?  currentWord = x.guess: '')
    return currentWord;
  }
  

  useEffect(() => {
    if (!win && start) {
      const handleKeyDown = (event) => {
        const { key } = event;
        const { keyCode } = event;
        let currentWord = CombineWord(getCurrent());
        if (keyCode > 64 && keyCode < 91) {
          if (currentWord.length < 5) {
            currentWord = currentWord + key[0];
          }
        }
        else if (key === "Delete" || key === "Backspace") {
          currentWord = currentWord.slice(0, -1);
        } else if (keyCode === 13) {
          CheckWord();
        }
        updateWordle(currentWord);
      };
  
      document.addEventListener('keydown', handleKeyDown);
  
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentRow, wordle, start]);

  function BreakWord(word) {
    let newWord = [];
    for (let i = 0; i < 5; i++) {
      if (i < word.length) {
        newWord.push(word[i].toUpperCase());
      } else {
        newWord.push('');
      }
    }
    return newWord;
  }

  function CombineWord(word) {
    return word.join('');
  }

  function updateWordle(currentValue) {
    const brokenWord = BreakWord(currentValue);
    setWordle((prevState) =>
      prevState.map((x) => (currentRow === x.row ? { ...x, guess: brokenWord } : x))
    );
  }

  function getWordleState(state) {
    switch(state) {
      case "U": 
        return "wordleGuess";
      case "W": {
        return "wordleGuess W"
      }
      case "CW": 
        return "wordleGuess CW";
      case "CR":
        return "wordleGuess CR";
      default:
        return "wordleGuess"
    } 
  }
  const toggleFlashBackground = () => {
    setFlashBackground(true);
    setTimeout(() => {
      setFlashBackground(false);
    }, 1000);
  };

  const toggleChecking = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
    }, 500);
  }


  const puzzle = wordle.map((x) => (
    <div className="wordleRow" key={x.row}>
      {x.guess.map((guess, index) => (
        <div 
        className={`${getWordleState(x.state[index])} ${guess.length > 0 && !flashBackground && currentRow === x.row ? 'inputFlash' : ''} ${currentRow === x.row && flashBackground ? 'flashRed' : ''}`}
        key={`${x.row}-${index}`}
        onAnimationEnd={() => setFlashBackground(false)}
      >
          {guess}
        </div>
      ))}
    </div>
  ));


  function CheckWord() {
    if (!win || !lose) {
      const currentWord = CombineWord(getCurrent());
      const splitWord = getCurrent();
      const splitCorrectWord = BreakWord(CorrectWord);
      let stateArray = [];
      let validWord = avaliableWords.includes(currentWord.toLowerCase());
      if (!validWord && currentWord.length > 0) {
        toggleFlashBackground();
      }
      if (currentWord.length === 5 && !win && validWord) {
        for (let i = 0; i < splitWord.length; i++) {
          let currentState = 'U';
          for (let a = 0; a < splitCorrectWord.length; a++) {
            if (splitWord[i] === splitCorrectWord[a]) {
              if (i === a) {
                currentState = "CR"
                break;
              } else {
                currentState = "CW"
              }
            }
          } 
          if (currentState !== "CR" && currentState !== "CW") {
            currentState = "W";
            setTakenLetters((preval) => {
              return {
                ...preval, ['wrongLetters']: [...preval.wrongLetters, splitWord[i]]
              }
            })
        } else {
          setTakenLetters((preval) => {
            return {
              ...preval, ['correctLetters']: [...preval.correctLetters, splitWord[i]]
            }
          })
        }
          stateArray.push(currentState);
      }
      setTimeout(() => {
        setWordle((preval) => preval.map((x) => 
      currentRow === x.row ? {...x, ['state']: stateArray}: x)
      )
  
      setCurrentRow((preval) => preval < 5 ? preval + 1 : 5)
      if (currentWord.toLowerCase() === CorrectWord) {
        setWin(true) 
      }
      if (currentRow === 5) {
        setLose(true)
      }
      }, 1000);
      

    }
    }
    if (win || lose) {
      ResetWordle();
      setWin(false);
      setLose(false);
    }
  }

  function keyPress(x) {
    if (x != 'Delete') {
      const Code = x.charCodeAt(0);
      var event = new KeyboardEvent("keydown", {key : x, keyCode: Code});
    } else {
      var event = new KeyboardEvent("keydown", {key : 'Delete'});
    }
    document.dispatchEvent(event);
  }

  function Keyboard() {
    const keysTop = ['Q','W','E','R','T','Y','U','I','O','P',];
    const keysMiddle = ['A','S','D','F','G','H','J','K','L',];
    const keysBottom = ['ENTER','Z','X','C','V','B','N','M','DEL',];

    const keysTopMap = keysTop.map((x) => {
      return <div className={takenLetters.wrongLetters.includes(x) ? 'keys unavaliable' : takenLetters.correctLetters.includes(x) ? 'keys correct': 'keys'} onClick={() => keyPress(x)}>{x}</div>
    })
    const keysMiddleMap = keysMiddle.map((x) => {
      return <div className={takenLetters.wrongLetters.includes(x) ? 'keys unavaliable' : takenLetters.correctLetters.includes(x) ? 'keys correct': 'keys'} onClick={() => keyPress(x)}>{x}</div>
    })
    const keysBottomMap = keysBottom.map((x) => x === "ENTER" || x === "DEL" ? <div className='specialKeys keys' onClick={x === 'ENTER' ? CheckWord : () => keyPress('Delete')}>{x}</div> : 
    <div className={takenLetters.wrongLetters.includes(x) ? 'keys unavaliable' : takenLetters.correctLetters.includes(x) ? 'keys correct': 'keys'} onClick={() => keyPress(x)}>{x}</div>)


    return <div className='keyboardBody'>
      <div className='keyboardRow'>
        {keysTopMap}
      </div>
      <div className='keyboardRow'>
        {keysMiddleMap}
      </div>
      <div className='keyboardRow'>
        {keysBottomMap}
      </div>
    </div>
  }

  return (
    <>
    {!start && <StartScreen />}
    {win && <Confetti width={'3000px'}/>}
    <div className="wordleBody">
      <div className="wordlePuzzle">{puzzle}</div>
      <Keyboard />
      {lose && <h1 className='tryAgain'>The correct word was <span className='correctWord'>{CorrectWord.toUpperCase()}</span>, Try again?</h1>}
      {win && <h1 className='tryAgain'>Congratulations! Try again?</h1>}
      <button className="wordleSubmit" onClick={CheckWord}>{win || lose ? 'Retry?': "Check Word"}</button>
      {record && <h2 className='Resets'>Resets : {reset}</h2>}
    </div>
    </>
  )
}