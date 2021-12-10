import React, { useContext, useState, useEffect } from "react"

import './reset.css'
import './App.css'
import {questionsColumn1, questionsColumn2, questionsColumn3, questionsColumn4} from "./Questions"
import {players} from "./Players"

const initialState = {
  questionActive: false,
  question: "",
  questionAmount: "",
  categoryTitle: "",
  answerActive: false,
  answer: "",
  players: players,
  points: [],
  timer: 30, // 30 sec?
  playersGotWrong: [],
  catergories: [
    { id: 0, title: "The catch", questions: questionsColumn1 },
    { id: 1, title: "Thats deep", questions: questionsColumn2 },
    { id: 2, title: "Geography", questions: questionsColumn3 },
    { id: 3, title: "Its Christmas", questions: questionsColumn4 },
  ]
}

const CategoriesContext = React.createContext({})

function QuestionCard({ question, title }) {
  const {
    toggleQuestionActive, 
    makeCategoryTitle, 
    makeQuestion, 
    makeQuestionAmount,
    makeAnswer,
    points
  } = useContext(CategoriesContext)

  const toggleQuestion = () => {
    toggleQuestionActive(true)
    makeCategoryTitle(title)
    makeQuestion(question.question)
    makeQuestionAmount(question.amount)
    makeAnswer(question.answer)
  }

  const isAnswered = points.filter(p => p.title === title && p.amount === question.amount)
  let cls = "question text-center"
  if(isAnswered.length>0) cls = cls + " answered"
  return (
    <li className={cls} onClick={toggleQuestion}>
      {question.amount}
      {isAnswered.length>1? <span>{isAnswered.length} Players</span> :(isAnswered.map((player, l) => <span key={l}>{player.name}</span>))}
    </li>
  );
}


function Column({ category }) {
  return (
    <div className="categories--column">
      <header>{category.title}</header>
      <ul className="questions">
        {category.questions.map((question, k) => <QuestionCard key={k} title={category.title} question={question}/>)}
      </ul>
    </div>
  );
}

function QuestionColumns() {
  const ctx = useContext(CategoriesContext)
  
  return (
    <div className="categories">
      {ctx.catergories.map(category => (<Column key={category.id} category={category} />))}
    </div>
  );
}

function Timer() {
  const [countDown, updateCountDown] = useState(15)
  const {toggleCountDown} = useContext(CategoriesContext)
  
  useEffect(() => {
    const interval = setInterval(() => {
      if(countDown!==0) {
        updateCountDown(countDown-1)
      } else {
        toggleCountDown(true)
      }
    }, 1100)

    return function cleanup() {
      clearInterval(interval)
    }
  });

  return (
    <div className="timer">
      {countDown? <><span className="countdown">{countDown}</span>s</>: <span>Now send your answer!</span>}
    </div>
  );
}

function Question() {
  const {
    toggleAnswerActive, 
    toggleQuestionActive,
    categoryTitle,
    questionAmount,
    question,
    countDown,
    toggleCountDown
  } = useContext(CategoriesContext)

  const toggleAnswer = () => {
    toggleAnswerActive(true)
    toggleQuestionActive(false)
    toggleCountDown(false)
  }

  return (
    <div className="question--container">
      <Timer />
      <div className="question--to__answer">
        <header>{categoryTitle} for {questionAmount}</header>
        <main>{question}</main>
      </div>
      {countDown? <button className="btn answer--btn" type="button" onClick={toggleAnswer}>The Answer ➡️</button>: null}
    </div>
  );
}

function Categories() {
  return <QuestionColumns />
}


const Player = ({player}) => {
  const {
    setAnsweredBy,
    answeredBy
  } = useContext(CategoriesContext)
  const setAnsweredByPlayer = () => {
    if(answeredBy.includes(player) || answeredBy === player) {
      setAnsweredBy([...answeredBy.filter(p => p!==player)])
    } else {
      answeredBy.push(player)
      setAnsweredBy([...answeredBy])
    }
  }
  const isAnswered = answeredBy.includes(player)
  return (
    <li className={isAnswered?"active": ""} onClick={setAnsweredByPlayer}>
      {player}
      {isAnswered?<span> ✔️</span>:""}
    </li>
  )
}


const PlayerGotWrong = ({player}) => {
  const {
    playersGotWrong,
    setPlayersGotWrong,
    answeredBy
  } = useContext(CategoriesContext)

  const setPlayerGotWrong = () => {
    if(playersGotWrong.includes(player) || answeredBy === player) {
      setPlayersGotWrong([...playersGotWrong.filter(p => p!==player)])
    } else {
      playersGotWrong.push(player)
      setPlayersGotWrong([...playersGotWrong])
    }
  }

  let cls = ""
  const isPlayersGotWrong = playersGotWrong.includes(player)
  if(isPlayersGotWrong) cls = cls+" active"
  if(answeredBy.includes(player)) cls = cls+" hide"

  return (
    <li className={cls} onClick={setPlayerGotWrong}>
      {player}
      {isPlayersGotWrong?<span> ❌</span>:""}
    </li>
  )
}


function Answer() {
  const {
    answer,
    answeredBy,
    setAnsweredBy,
    toggleAnswerActive, 
    toggleQuestionActive, 
    players,
    questionAmount,
    categoryTitle,
    points,
    setPoints,
    makeCategoryTitle,
    makeQuestion,
    makeQuestionAmount,
    makeAnswer,
    playersGotWrong,
    setPlayersGotWrong
  } = useContext(CategoriesContext)

  const toggleBoard = () => {
    toggleAnswerActive(false)
    toggleQuestionActive(false)
    let pts = [...points]
    playersGotWrong.forEach(player => {
      pts.push({ name: player, amount: -questionAmount, title: categoryTitle })
    })
    answeredBy.forEach(player => {
      pts.push({ name: player, amount: questionAmount, title: categoryTitle })
    })
    setPoints([...pts])
    makeCategoryTitle("")
    makeQuestion("")
    makeQuestionAmount("")
    makeAnswer("")
    setAnsweredBy([])
    setPlayersGotWrong([])
  }

  return (
    <div className="answer--portals">
      <div className="answer--container">
        <main className="theanswer">{answer}</main>
      </div>
      <div className="answer--container portals">
        <div className="portals--labels">✔️ Players got it right (+{questionAmount})</div>
        <ul className="players">
          {players.map(player => <Player key={player.toString()} player={player} />)}
        </ul>
        <div className="portals--labels">❌ Players got it wrong (-{questionAmount})</div>
        <ul className="players">
          {players.map(player => <PlayerGotWrong key={player.toString()} player={player} />)}
        </ul>
        <button className="btn answer--btn" type="button" onClick={toggleBoard}>Back to trivia board ➡️</button>
      </div>
    </div>
  )
}

function ViewLogic() {
  const {questionActive, answerActive} = useContext(CategoriesContext)
  if (questionActive) { 
    return (<Question />)
  } else if (answerActive) {
    return (<Answer />)
  } else {
    return (
      <>
        <Categories />
        <Points />
      </>
    )
  }
}

function Points() {
  const { points, players } = useContext(CategoriesContext)
  let ll = []
  if(points.length>0) {
    players.forEach(player => {
      const getPoints = points.filter(pt => pt.name === player).map(pt => pt.amount)
      let totalPts = 0
      if(getPoints.length>0) totalPts = getPoints.reduce((a,b) => a+b)
      ll.push({ totalPts: totalPts, name: player })
    }) 
    ll = ll.sort((a, b) => a.totalPts - b.totalPts).reverse()
    return (
      <div className="points">
        <p>Players</p>
        <ul className="points--list">
          {ll.map((l, i)=> l.totalPts===0? (<li key={i}>{l.name}</li>): <li key={i}>{l.name} / {l.totalPts}pts</li>)}
        </ul>
      </div>
    );
  } else {
    return null
  }
}

export default function App() {
  const [questionActive, toggleQuestionActive] = useState(false)
  const [question, makeQuestion] = useState("")
  const [questionAmount, makeQuestionAmount] = useState("")
  const [categoryTitle, makeCategoryTitle] = useState("")
  const [answerActive, toggleAnswerActive] = useState(false)
  const [answer, makeAnswer] = useState("")
  const [answeredBy, setAnsweredBy] = useState([])
  const [playersGotWrong, setPlayersGotWrong] = useState([])
  const [points, setPoints] = useState([])
  const [countDown, toggleCountDown] = useState(false)

  const value = {
    ...initialState, 
    questionActive, 
    toggleQuestionActive,
    question,
    makeQuestion,
    questionAmount,
    makeQuestionAmount,
    categoryTitle,
    makeCategoryTitle,
    answerActive, 
    toggleAnswerActive,
    answer,
    makeAnswer,
    answeredBy,
    setAnsweredBy,
    playersGotWrong,
    setPlayersGotWrong,
    points, 
    setPoints,
    countDown, 
    toggleCountDown
  }

  return (
    <div className="lemijeopardy">
      <CategoriesContext.Provider value={value}>
        <ViewLogic />
      </CategoriesContext.Provider>
    </div>
  );
};
