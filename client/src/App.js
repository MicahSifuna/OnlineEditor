import React, {useState} from 'react';
import axios from 'axios';


import './App.css';

function App() {

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");

  const handleSubmit = async() => {
    const payload = {
      language,
      code,
    };
    try {
        const {data} = await axios.post("http://localhost:5550/run", payload);
        console.log(data);
        setOutput(data.job.output);
    } catch({response}) {
          if(response) {
            console.log(response);
            const errMsg = response.data.err.stderr;
            setOutput(errMsg);
          } else {
            setOutput("Error connecting to the server!");
          }
    }
  }
  return (
    <div className="App">
      <h1>Online code compiler</h1>
      <div>
        <label htmlFor="">Language:</label>
        <select name="" id=""
        value={language}
        onChange={
          (e) => {
            setLanguage(e.target.value);
            console.log(e.target.value);
          }
        }
        >
        <option value="cpp">C++</option>
        <option value="py">Python</option>
        </select>
      </div>
      <br />
      <textarea name="" id="" cols="75" rows="20" value={code}
        onChange={(e) => {
          setCode(e.target.value);
        }}
      ></textarea>
      <br />
      <button onClick={handleSubmit} >submit</button>
      <p> {output} </p>

    </div>
  );
}

export default App;
