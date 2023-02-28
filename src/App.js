import Header from "./component/header.js";
import Footer from "./component/footer.js";
import {Mobile, PC} from "./component/pcormobile.js";
import Navbar from "./component/navbar.js";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import Signin from "./component/signin.js";
import Createaccount from "./component/createaccount.js";
import React, { useEffect, useState } from "react";
import Loginnavbar from "./component/loginnavbar.js";
import Game from "./component/game.js";
import Betting from "./component/betting.js"
import Axios from "axios";

function App() {
  const [logState, setLogState] = useState();

  useEffect(() => {
    setLogState(sessionStorage.getItem("id"));
  });

  console.log(sessionStorage);

  return <div>{logState === null ? loginNo() : loginOk()}</div>;
}

const loginOk = () => {

  return (
    <div className="App">
      <BrowserRouter>

        <Mobile>
          모바일로 접속함
        </Mobile>

        <PC>
          <Loginnavbar></Loginnavbar>

          <Routes>
            <Route path="/Black-jack-React" element={<Header></Header>}></Route>
            <Route path="/" element={<Header></Header>}></Route>
            <Route path="/Game" element={<Game></Game>}></Route>
            <Route path="/Betting" element={<Betting></Betting>}></Route>
          </Routes>

          <Footer></Footer>
        </PC>

      </BrowserRouter>
    </div>
  );
}


const loginNo = () => {
  return (
    <div className="App">
      <BrowserRouter>

        <Mobile>
          모바일로 접속함
        </Mobile>

        <PC>
          <Navbar></Navbar>

          <Routes>
            <Route path="/Black-jack-React" element={<Header></Header>}></Route>
            <Route path="/" element={<Header></Header>}></Route>
            <Route path="/Signin" element={<Signin></Signin>}></Route>
            <Route path="/Createaccount" element={<Createaccount></Createaccount>}></Route>
            <Route path="/Game" element={<Game></Game>}></Route>
            <Route path="/Betting" element={<Betting></Betting>}></Route>
          </Routes>

          <Footer></Footer>
        </PC>

      </BrowserRouter>
    </div>
  );
}


export default App;
