const Groq = require("groq-sdk");
const express = require("express");
const cors = require("cors");

GROQ_API_KEY = "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"

const app = express();
const PORT = 5000;


app.use(cors({
    origin: "http://localhost:3000"
}));

app.get("/api/questions", async (req, res) => {

    const topic = req.query.topic || "precalculus"
    const groq = new Groq({ apiKey: GROQ_API_KEY })
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are creating a quiz designed to review "${topic}" concepts for an upcoming quiz for a student. Create 5 random questions with 4 multiple choice answers. Also, provide the answer separately. The response should be in the following JSON format but with different questions and answers: {"questions":[{"id":0,"question":"What is the value of sec(π/6) in exponential form?","options":["root(3)(2) + root(3)(3)","2 + sqrt(3)","1 + sqrt(3)","1 + root(3)(2)"],"answer":"1 + sqrt(3)"},{"id":1,"question":"What is the equation of the line that is perpendicular to the line y = 3x + 2 and passes through the point (-1, -1)?","options":["y = -3x + 5","y = -3x - 1","y = 3x + 1","y = -3x - 5"],"answer":"y = -3x + 5"},{"id":2,"question":"What is the sum of the roots of the quadratic equation x^2 + 5x + 6 = 0?","options":["-3","-1","2","-5"],"answer":"-3"},{"id":3,"question":"What is the equation of the circle with center (1, -2) and radius 3?","options":["(x - 1)^2 + (y + 2)^2 = 9","(x + 2)^2 + (y - 1)^2 = 9","(x - 2)^2 + (y + 1)^2 = 9","(x + 1)^2 + (y - 2)^2 = 9"],"answer":"(x - 1)^2 + (y + 2)^2 = 9"},{"id":4,"question":"What is the equation of the line that passes through the points (2, 3) and (4, 5)?","options":["y = x + 1","y = x - 1","y = x + 2","y = x - 2"],"answer":"y = x + 1"}]}`
          },
        ],
        model: "llama3-8b-8192",
        response_format: {"type":"json_object"},
      })
      
      const aiResponse = completion.choices[0].message.content
      const json = JSON.parse(aiResponse)
      res.json(json)
    }
    catch(error) {
      console.error('Error fetching GroqCloud completion:', error)
      res.status(500).json({ error: 'Failed to generate quiz questions' })
    }

})

app.get("/api/explanation", async (req, res) => {
  
  const { question, userAnswer, correctAnswer } = req.query;
  
  if (!question || !userAnswer || !correctAnswer) {
    return res.status(400).json({ error: 'Missing query parameters' });
  }
  
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert providing explanations. Explain why the user's answer "${userAnswer}" is incorrect for the question "${question}". The correct answer is "${correctAnswer}". Provide a detailed explanation.`
        },
      ],
      model: "llama3-8b-8192",
      
    });
    
    console.log('GroqCloud response:', completion); // Debugging statement
    
    const aiResponse = completion.choices[0].message.content;
    res.json({ explanation: aiResponse });

} catch (error) {
    console.error('Error fetching explanation from GroqCloud:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
}

})


app.listen(PORT, () => {console.log("server running on port 5000")})