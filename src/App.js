import {useEffect, useState} from 'react';
import styled from 'styled-components';


const TextInput = styled.input`
  width: 50%;
  margin-bottom: 16px;
`;
const TextField = styled.textarea`
  width: 100%;
  height: 200px;
  resize: none;
`;

const SubmitButton = styled.button`
  border: none;
  font-size: 16px;
  color: whitesmoke;
  background-color: fuchsia;
  padding: 8px;
  border-radius: 16px;
  cursor: pointer;
  margin: 8px;
  width: 100%;
`;

const AppContainer = styled.div`
  display: flex;
  
  @media only screen and (max-width: 800px){
    flex-direction: column;
  }
`;

const FormContainer = styled.div`
  flex: 1;
`;
const MessageWindow = styled.div`
  background-color: gray;
  flex: 1;
  min-height: 500px;
`;

const MessageContainer = styled.div`
  ${({lastChild})=> !lastChild && 
    `border-bottom: 2px solid black;`
  }
  padding: 16px;
  display: flex;
  flex-direction: row;
`;
const UserProfile = styled.div`
  margin-right: 20px;
  font-weight: bold;
`;
const TextMessage = styled.div`
  flex: 1;
`;


const client = new WebSocket('ws://localhost:8000/ws');


function App() {
  const [username, updateUsername] = useState();
  const [text, onTextUpdate] = useState();
  const [messages, updateMessages] = useState([]);
  useEffect(() => {
    // Grab the past messages from history
    fetch("http://localhost:8000/history", {
      method: 'GET',
      headers: new Headers(),
      redirect: 'follow'
    })
      .then(response => response.json())
      // fill messages in if successful response
      .then(result => updateMessages(result))
      .catch(error => console.log('error', error));

    client.onopen = ({target}) => {
      console.log({connection: target});
    }
    // Add message when server sends data
    client.onmessage = ({data})=> {
      updateMessages([...messages, JSON.parse(data)])
    }
  });

  const sendData = () => {
    const data = {
      username: username || 'Anonymous',
      text
    };
    client.send(JSON.stringify(data));
  }

  return (
    <AppContainer>
      <FormContainer>
        <h1>Websocket Test</h1>
        <h3>Username:</h3>
        <TextInput 
          type={'text'} 
          label={'Username'}
          onChange={({nativeEvent})=> updateUsername(nativeEvent.target.value)}
          placeholder={'Anonymous'}
        />
        <h3>Data:</h3>
        <TextField onChange={({nativeEvent}) => onTextUpdate(nativeEvent.target.value)}/>
        <SubmitButton onClick={sendData}>
          Submit
      </SubmitButton>
      </FormContainer>
      <MessageWindow>
        <h1>Messages</h1>
        {!!messages.length && messages.map(({username, text},index)=> 
          <MessageContainer lastChild={index === messages.length - 1}>
            <UserProfile>{username}</UserProfile>
            <TextMessage>{text}</TextMessage>
          </MessageContainer>)}
      </MessageWindow>
    </AppContainer>
  );
}

export default App;
