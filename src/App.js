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

  let [fade, setFade] = useState('')

  useEffect(()=>{
    // tab의 상태가 변할때 (클릭 후 다른탭 열리면) 0.1초 뒤 'end' className 바인딩
    const fadeTimer = setTimeout(()=>{ setFade('end') }, 100)
    return ()=>{
      // 기존 fadeTimer 제거 후 class 빈 값으로 변경
      clearTimeout(fadeTimer);
  	  setFade('')
    }
  }, [])

  useEffect(() => {
    setLogState(sessionStorage.getItem("id"));
  });

  console.log(sessionStorage);

  return <div>{logState === null ? loginNo(fade) : loginOk(fade)}</div>;
}

const loginOk = (fade) => {
  return (
    <div className={"App start " + fade}>
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


const loginNo = (fade) => {
  return (
    <div className={"App start " + fade}>
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
