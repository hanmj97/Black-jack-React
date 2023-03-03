import gametable from "../headerimg/gametable.jpg";
import testcard from "../cardimg/1_ace_of_clubs.png";
import testcard2 from "../cardimg/10_king_of_hearts.png";
import nocard from "../cardimg/cardback.png";
import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from "react-spring";
import Axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from 'react-router-dom';

const Game = () => {  
    const urlmove = useNavigate();
    const location = useLocation();
    const left = ["31%", "34%", "37%", "40%", "43%", "46%", "49%"];
    const [usercard_array,setUsercard_array] = useState([]);
    const [dealercard_array,setDealercard_array] = useState([]);
    let usermoney = 0;
    let [fade, setFade] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);      // 카드 뒤집기

    console.log(location.state);

    const randomcard = () => {
        Axios.post("http://localhost:8000/randomcard", {
            userid: location.state.userid,
            perfectbetsmoney: location.state.perfectbetsmoney,
            betsmoney: location.state.betsmoney,
        }).then((res) => {
            console.log(res.data);
            if(res.data.length == 4){
                usercard_array.push(res.data[0]);
                usercard_array.push(res.data[2]);
                dealercard_array.push(res.data[1]);
                dealercard_array.push(res.data[3]);
            }
        }).catch((e) => {
            console.error(e);
        });
    }

    const hit = () => {
        Axios.post("http://localhost:8000/hit", {
            userid: location.state.userid,
            perfectbetsmoney: location.state.perfectbetsmoney,
            betsmoney: location.state.betsmoney,
        }).then((res) => {
            console.log(res.data);
            if(res.data.length == 4){
                usercard_array.push(res.data[0]);
                usercard_array.push(res.data[2]);
                dealercard_array.push(res.data[1]);
                dealercard_array.push(res.data[3]);
            }
        }).catch((e) => {
            console.error(e);
        });
    }

    const stay = () => {
        Axios.post("http://localhost:8000/stay", {
            userid: location.state.userid,
            perfectbetsmoney: location.state.perfectbetsmoney,
            betsmoney: location.state.betsmoney,
        }).then((res) => {
            console.log(res.data);
            if(res.data.length == 4){
                usercard_array.push(res.data[0]);
                usercard_array.push(res.data[2]);
                dealercard_array.push(res.data[1]);
                dealercard_array.push(res.data[3]);
            }
        }).catch((e) => {
            console.error(e);
        });
    }


    useEffect(()=>{
        // tab의 상태가 변할때 (클릭 후 다른탭 열리면) 0.1초 뒤 'end' className 바인딩
        const fadeTimer = setTimeout(()=>{ setFade('end') }, 100)
        return ()=>{
            // 기존 fadeTimer 제거 후 class 빈 값으로 변경
            clearTimeout(fadeTimer);
  	        setFade('')
        }
    }, []);

    useEffect(() => {
        randomcard();
    }, []);

    const handleFlip = () => {
      setIsFlipped(!isFlipped);             //카드 뒤집는 코드
    };

    return (
        <div className={"start " + fade}>
            <div className="tablediv">
                <img src={gametable} className='gametable' alt='gametable' />
                <div>
                    {
                        dealercard_array.map((card, index) => {
                            let url = dealercard_array[index].cardimg;                            

                            if(index == 0){
                                return (
                                    <div key={index} className={`flip-container ${isFlipped ? 'flip' : ''}`} style={{left : left[index]}} onClick={handleFlip}>
                                        <div className="flipper">
                                            <div className="back">
                                                <img src={process.env.PUBLIC_URL + url} alt="Front" className="testcard"/>
                                            </div>
                                            <div className="front">
                                                <img src={nocard} alt="Back" className="testcard"/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }else {
                                return (
                                    <div key={index} className={`flip-container ${isFlipped ? 'flip' : ''}`} style={{left : left[index]}} onClick={handleFlip}>
                                        <div className="flipper">
                                            <div className="front">
                                                <img src={process.env.PUBLIC_URL + url} alt="Front" className="testcard"/>
                                            </div>
                                            <div className="back">
                                                <img src={nocard} alt="Back" className="testcard"/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })
                    }
                </div>

                <div>
                    {
                        usercard_array.map((card, index) => {
                            const url = usercard_array[index].cardimg;
                            return (
                                <div key={index} className="usercard1" style={{left : left[index]}}>
                                    <img src={process.env.PUBLIC_URL + url} className="testcard"/>
                                </div>
                            )
                        })
                    }
                </div>


                <div className="gamebutton">
                    <button className="gbtn hit"  onClick={(e) =>  e.preventDefault()}>Hit</button>
                    <button className="gbtn stay" onClick={(e) =>  e.preventDefault()}>Stay</button>
                    <button className="gbtn doubledown" onClick={(e) =>  e.preventDefault()}>Double Down</button>
                </div>

                <div className="usermoney">bankroll : {location.state.resultmoney}</div>
            </div>
        </div>
    );


    const gamepage = () => {
        
    }
}

export default Game;