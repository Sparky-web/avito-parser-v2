import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {SWRConfig} from "swr";

const options = {
    fetcher: url => window.fetch("http://192.168.0.107:1200" + url).then(res => res.json())
}

ReactDOM.render(
    <React.StrictMode>
        <SWRConfig value={options}>
            <App />
        </SWRConfig>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();