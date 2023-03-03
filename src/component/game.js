import gametable from "../headerimg/gametable.jpg";
import testcard from "../cardimg/1_ace_of_clubs.png";
import testcard2 from "../cardimg/10_king_of_hearts.png";
import nocard from "../cardimg/cardback.png";
import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from "react-spring";
import Axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from 'react-router-dom';
import { useBeforeunload } from "react-beforeunload";
import { createBrowserHistory } from 'history';

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
    if(location.state != null){
        usermoney = location.state.resultmoney;
    }else {
        usermoney = 0;

        const Toast = Swal.mixin({
            width: 600,
        });

        Toast.fire({
            icon: 'error',
            title: '메인으로 돌아갑니다.',
        }).then(result => {
            if (result.isConfirmed) {
              urlmove('/');
            }
        });
    }

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
        if(location.state != null){
            randomcard();
        }
    }, []);

    const handleFlip = () => {
      setIsFlipped(!isFlipped);             //카드 뒤집는 코드
    };



    const history = createBrowserHistory();                     // 1. history라는 상수에 createBrowerHistory 함수를 할당한다.
      
    const preventGoBack = () => {                               // 2. 뒤로가기 막는 함수 설정
        history.push(null, '', history.location.href);          // 2-1. 현재 상태를 세션 히스토리 스택에 추가(push)한다.
        const Toast = Swal.mixin({
            width: 600,
        });

        Toast.fire({
            icon: 'error',
            title: '뒤로가기 시 메인으로 돌아갑니다.',
        }).then(result => {
            if (result.isConfirmed) {
              urlmove('/');
            }
        });
    };

    useEffect(() => {
        (() => {
            history.push(null, '', history.location.href);                  // 3. 렌더링 완료 시 현재 상태를 세션 히스토리 스택에 추가(push)한다.
            window.addEventListener('popstate', preventGoBack);             // 3-1. addEventListener를 이용해 "popstate"라는 이벤트를 감지하게 한다.
                                                                            // 3-2. popstate 이벤트를 감지했을 때 preventGoBack 함수가 실행된다.
        })();
      
        return () => {
            window.removeEventListener('popstate', preventGoBack);          // 3-3. 렌더링이 끝난 이후엔 eventListner을 제거한다.
        };
    }, []);
      
    useEffect(() => {
        history.push(null, '', history.location.href);                      // 4-1. 현재 상태를 세션 히스토리 스택에 추가(push)한다.
    }, [history.location]);                                                 // 4. history.location (pathname)이 변경될때마다




    const preventClose = (e) => {                          // 새로고침을 감지하는 함수생성
        e.preventDefault();                                // 특정 이벤트에 대한 사용자 에이전트 (브라우저)의 기본 동작이 실행되지 않도록 막는다.
        e.returnValue = ''; 
        // e.preventDefault를 통해서 방지된 이벤트가 제대로 막혔는지 확인할 때 사용한다고 한다.
        // 더 이상 쓰이지 않지만, chrome 설정상 필요하다고 하여 추가함.
        // returnValue가 true일 경우 이벤트는 그대로 실행되고, false일 경우 실행되지 않는다고 한다.
    };
        
    useEffect(() => {
        (() => {
        window.addEventListener('beforeunload', preventClose);          // beforeunload 이벤트는 리소스가 사라지기 전 window 자체에서 발행한다.
                                                                        // window의 이벤트를 감지하여 beforunload 이벤트 발생 시 preventClose 함수가 실행된다.
        })();
        
        return () => {
            window.removeEventListener('beforeunload', preventClose);   // 5. 해당 이벤트 실행 후, beforeunload를 감지하는 것을 제거한다.
        };
    });


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

                <div className="usermoney">bankroll : {usermoney}</div>
            </div>
        </div>
    );


    const gamepage = () => {
        
    }
}

export default Game;