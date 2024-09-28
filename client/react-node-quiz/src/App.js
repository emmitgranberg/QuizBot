import './App.css';
import {useState, useEffect, useRef } from 'react'
import searchIcon from './search.png'

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
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [errorMessage, setErrorMessage] = useState('');
  const [wrongQuestionTypes, setWrongQuestionTypes] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatMessages, setChatMessages] = useState([])
  const [chatVisible, setChatVisible] = useState(false);

  const chatBoxRef = useRef(null);



  const fetchQuestions = (selectedTopic, tries=0) => {
    setErrorMessage('');
    if (tries >= 5){
      setErrorMessage("Error fetching questions. Check your spelling and try again.")
      tries = 0
      setLoading(false)
      setTopic("")
      return
    }
    
    setLoading(true);


    if (selectedTopic) {
    fetch(`http://localhost:5000/api/questions?topic=${encodeURIComponent(selectedTopic)}`)
      .then((res) => res.json())
      .then((data) => {

        
        if (data && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setLoading(false);
          setQuizStarted(true);
          setQuizFinished(false);
          setCurrentQuestionIndex(0);
          setScore(0);
          setHasAnswered(false);
        }
        else{
          //alert("error here")
          setTimeout(() => fetchQuestions(selectedTopic, (tries + 1)), 30)
        }
        
      })
      .catch((err) => {
        alert("error")
        console.log('Error fetching questions:', err);
        setTimeout(() => fetchQuestions(selectedTopic, (tries + 1)), 30)
        setLoading(false);
      });
      }
      else
      {
        setLoading(false)
      }
  };

  const fetchExplanation = (question, userAnswer, correctAnswer) => {
    setLoadingExplanation(true)

    fetch(`http://localhost:5000/api/explanation?question=${encodeURIComponent(question)}&userAnswer=${encodeURIComponent(userAnswer)}&correctAnswer=${encodeURIComponent(correctAnswer)}`)
      .then((res) => res.json())
      .then((data) => {
        setExplanation(data.explanation);
        setLoadingExplanation(false)
      })
      .catch((err) => {
        setLoadingExplanation(false)
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
    setExplanation("")
  }


  const [selectedAnswer, setSelectedAnswer] = useState("")

  const handleAnswer = (option) => {
    setSelectedAnswer(option)
    const currentQuestion = questions[currentQuestionIndex];
    setHasAnswered(true)

    if (currentQuestion) {
    if (option == currentQuestion.answer) {
      setScore(score + 1);
      setExplanation("Correct!")
    } else {
      setWrongQuestionTypes(prevTypes => [...prevTypes, currentQuestion.type]);
      fetchExplanation(currentQuestion.question, option, currentQuestion.answer);
    }
  } else {
    alert("ERROR LINE 115")
  }

    if (currentQuestionIndex < questions.length - 1) {
      // setCurrentQuestionIndex(currentQuestionIndex + 1); 
    } else {
      fetchExplanation(currentQuestion.question, option, currentQuestion.answer);
      // setQuizFinished(true);
    }
  };


  const handleChatSend = () => {
    if (chatText.trim()) {
      setChatMessages(prev => [...prev, { type: 'user', text: chatText }]);
      fetchChatResponse(chatText);
      setChatText(""); 

    

    }
  };

  const fetchChatResponse = (message) => {
    fetch(`http://localhost:5000/api/chat?message=${encodeURIComponent(message)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // Check the structure of the response
        setChatMessages(prev => [...prev, { type: 'ai', text: data.explanation }]);
        
      })
      .catch((err) => {
        console.error('Error fetching chat response:', err);
      });

  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };

  useEffect(() => {
    if (chatVisible && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; 
    }
  }, [chatVisible]);




  return (
    <div className='main-container'>
    <div className='quiz-container'>
    {errorMessage && (
          <div className='error-banner'>
          <p>{errorMessage}</p>
          <button className='close-button' onClick={() => {setErrorMessage("")}}>X</button>
        </div>
      )}
      {!quizStarted || quizFinished ? (
        <>
          <div>
            <h3 className='quiz-title'>Search a topic to get started!</h3>
          </div>
          <div className="search-container">
            <input
              type="text"
              className="quiz-input"
              placeholder="Enter a topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuestions(topic)}
            />
            <button className="start-button" onClick={() => fetchQuestions(topic)}>
              <img src={searchIcon} alt="Search" className='search-icon' />
            </button>
          </div>

          <div className='quiz-loader'>
            {loading && (
              <div className="loader"></div>
            )}
          </div>

          {(quizFinished && !loading) && (
            <div className='quiz-results'>
              <p>Your score: {score}/{questions.length}</p>

              <div>
                <h4>Consider studying these concepts:</h4>
                  {Array.from(new Set(wrongQuestionTypes)).map((type, index) => (
                <button 
                  className='suggested-topic-button'
                  key={index} 
                  onClick={() => {
                    fetchQuestions(type)
                    setWrongQuestionTypes(prevTypes => prevTypes.filter(item => item !== type))
                  }}>
                  {type}
                </button>
          ))}
              </div>

            </div>
            
            
          )}
        </>
      ) : (
        loading ? (
          <p className='quiz-loader'>Loading questions...</p>
        ) : (
          questions.length > 0 && questions[currentQuestionIndex] && (
            <>
            <div className='quiz-box'>
              <h2 className='question-text'>{questions[currentQuestionIndex].question}</h2>
              <div className='answer-box'>
                {questions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    className={`answer-button ${
                      hasAnswered ?
                        questions[currentQuestionIndex].answer === option ? "correct-answer" :
                        selectedAnswer === option ? "wrong-answer" : ""
                        : ""
                    }`}
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={hasAnswered}
                  >
                    {option}
                  </button>
                ))}

                {hasAnswered && (
                  <>
                    {(currentQuestionIndex < questions.length - 1) ? (
                      <button className="next-button" onClick={onNext} disabled={loadingExplanation}>→</button>
                    ) : (
                      <button className="next-button" onClick={onFinish} disabled={loadingExplanation}>Finish</button>
                    )}
                  </>
                )}
              </div>

              <div className="explanation-box">
                {loadingExplanation && <div className="loader"></div>}
                <p>{explanation}</p>
              </div>
            </div>
      
            </>
          )
        )
      )}
    </div>
    
        
        {chatVisible && (
          <>
          <div className='chat-container'>
        <div className='chat-box' ref={chatBoxRef}>
          {chatMessages.map((msg, index) => (
            <div key={index} className={msg.type === 'user' ? 'user-message' : 'ai-message'}>
              {msg.text || "Error fetching response"}
            </div>
          ))}
        </div>
        <div className='chat-input-container'>
          <input
            type='text'
            className='chat-input'
            placeholder='Chat with an AI tutor...'
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              />
              <button className='chat-send-button' onClick={handleChatSend}>Send</button>
          </div>
          </div>
          </>
          
          )}
          <button onClick={toggleChat} className='toggle-chat-button'>
          {chatVisible ? 'Hide Chat' : 'Show Chat'}
        </button>
        
            </div>
    
  );
}

export default App;
