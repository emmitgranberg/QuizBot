import './App.css';
import {useState, useEffect} from 'react'

function App() {

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("")
  const [explanation, setExplanation] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false)

  const fetchQuestions = (selectedTopic) => {
    setLoading(true);

    fetch(`http://localhost:5000/api/questions?topic=${encodeURIComponent(selectedTopic)}`)
      .then((res) => res.json())
      .then((data) => {
        
        if (data && data.questions) {
          setQuestions(data.questions);
          setLoading(false);
          setQuizStarted(true);
          setQuizFinished(false);
          setCurrentQuestionIndex(0);
          setScore(0);
          setHasAnswered(false);
        }
        else{
          alert("error here")
          setTimeout(() => fetchQuestions(selectedTopic), 100)
        }
        
      })
      .catch((err) => {
        alert("error")
        console.error('Error fetching questions:', err);
        setTimeout(() => fetchQuestions(selectedTopic), 100)
        setLoading(false);
      });
  };

  const fetchExplanation = (question, userAnswer, correctAnswer) => {
    fetch(`http://localhost:5000/api/explanation?question=${encodeURIComponent(question)}&userAnswer=${encodeURIComponent(userAnswer)}&correctAnswer=${encodeURIComponent(correctAnswer)}`)
      .then((res) => res.json())
      .then((data) => {
        setExplanation(data.explanation);
      })
      .catch((err) => {
        console.error('Error fetching explanation:', err);
      });
  };

  const onNext = () => {
    setHasAnswered(false); 
  
    setExplanation("")
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); 
    } else {
      setCurrentQuestionIndex(currentQuestionIndex)
    }
  
  };

  const onFinish = () => {
    setQuizFinished(true)
  }

  const handleAnswer = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    setHasAnswered(true)

    if (option === currentQuestion.answer) {
      setScore(score + 1);
      setExplanation("Correct!")
    } else {
      fetchExplanation(currentQuestion.question, option, currentQuestion.answer);
    }

    if (currentQuestionIndex < questions.length - 1) {
      // setCurrentQuestionIndex(currentQuestionIndex + 1); 
    } else {
      fetchExplanation(currentQuestion.question, option, currentQuestion.answer);
      // setQuizFinished(true);
    }
  };



  return (
    <div className='App'>
      {!quizStarted || quizFinished ? (
        <>
          <div>
            <h3>Search a topic to get started!</h3>
          </div>
          <input 
            type="text" 
            placeholder="Enter a topic" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
          />
          <button onClick={() => fetchQuestions(topic)}>
            {quizFinished ? "Start New Quiz" : "Start Quiz"}
          </button>

          <div>
            {loading && (
              <h2>Loading...</h2>
            )}
          </div>

          {quizFinished && (
            <div>
              <p>Quiz Finished</p>
              <p>Your score: {score}/{questions.length}</p>
              <p>You got {score} out of {questions.length} questions correct</p>
            </div>
          )}
        </>
      ) : (
        loading ? (
          <p>Loading questions...</p>
        ) : (
          <div>
            <h2>{questions[currentQuestionIndex].question}</h2>
            <div>
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button key={index} onClick={() => handleAnswer(option)} disabled={hasAnswered}>
                  {option}
                </button>
              ))}

            {hasAnswered && (
              <>
                {(currentQuestionIndex < questions.length - 1) ? (
                  <button onClick={()=>{onNext()}}>Next</button>
                ) : (
                  <button onClick={()=>{onFinish()}}>Finish</button>
                )}
              </>
            )}
              
            </div>
            {explanation && (
              <div>
                <h3>Explanation:</h3>
                <p>{explanation}</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default App;
