import React from 'react'
import ReactDOM from 'react-dom/client'
import WildGuessGame from './App.jsx'
// 👇 THIS LINE MUST EXIST AND POINT TO YOUR CSS FILE
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WildGuessGame />
  </React.StrictMode>,
)