import gametable from "../headerimg/gametable.jpg";
import nocard from "../cardimg/cardback.png";
import cardstack from "../cardimg/card_stack.png";
import React, { useEffect, useRef, useState } from 'react';
import Axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import useDidMountEffect from '../customhook/renderingeffect.js';
import backgroundsound from '../soundeffect/backgroundsound.mp3';
import cardflipsound from '../soundeffect/cardsound-1.mp3';
import cardslidesound from '../soundeffect/cardsound-2.mp3';
import AudioPlayer from 'react-h5-audio-player';


const Game = () => {  
    const urlmove = useNavigate();
    const location = useLocation();
    const [usercard_array, setUsercard_array] = useState([]);
    const [dealercard_array, setDealercard_array] = useState([]);
    const [firstcard, setFirstcard] = useState(false);
    const [hitcard, setHitcard] = useState(false);
    const [standcard, setStandcard] = useState(false);
    const [userscore, setUserscore] = useState(0);
    const [dealerscore, setDealerscore] = useState(0);
    let count = 0;
    let [fade, setFade] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);               //카드 플립
    const [isstandFlipped, setIsstandFlipped] = useState(0);               //카드 플립
    const [isUserslide, setIsUserslide] = useState([]);              //카드 슬라이드(user)
    const [isDealerslide, setIsDealerslide] = useState([]);          //카드 슬라이드(dealer)
    var cardslideaudio = new Audio(cardslidesound);
    var cardflipaudio = new Audio(cardflipsound);

    /* const [resize, setResize] = useState();
    const handleResize = () => {
        const windowsize = window.innerWidth;
        if(windowsize <= 768) {
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
    };
  
    useEffect(() => {
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []); */

    //console.log("리랜더링");

    const randomcard = () => {
        Axios.post("http://localhost:8000/randomcard", {
            userid: "hanmj97",
            perfectbetsmoney: 0,
            betsmoney: 10,
        }).then((res) => {
            if(res.data.length == 4){
                setUsercard_array((prevArray) => [...prevArray, res.data[0], res.data[2]]);
                setDealercard_array((prevArray) => [...prevArray, res.data[1], res.data[3]]);

                setFirstcard(true);

                setUserscore(res.data[0].cardnum + res.data[2].cardnum);
                setDealerscore(res.data[1].cardnum + res.data[3].cardnum);
            }
        }).catch((e) => {
            console.error(e);
        });
    }

    /* const hit = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/hit", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });

            setUsercard_array((prevArray) => [...prevArray, response.data[0]]);

            setHitcard(!hitcard);
        } catch(err) {
            console.error(err);
        }
    } */

    const handleHit = async () => {
        try {
          const response = await Axios.post("http://localhost:8000/hit", {
            userid: location.state.userid,
            perfectbetsmoney: location.state.perfectbetsmoney,
            betsmoney: location.state.betsmoney,
          });

          setUsercard_array((prevArray) => [...prevArray, response.data[0]]);
          setUserscore(userscore + response.data[0].cardnum);

          setHitcard(!hitcard);
        } catch(err) {
          console.error(err);
        }
    }

    const handleStand = async () => {
        try {
          const response = await Axios.post("http://localhost:8000/stand", {
            userid: location.state.userid,
            perfectbetsmoney: location.state.perfectbetsmoney,
            betsmoney: location.state.betsmoney,
          });

          if(dealerscore >= 17 && dealerscore <= 20){
            setStandcard(!standcard);
          }else {
            setDealercard_array((prevArray) => [...prevArray, response.data[0]]);

            setDealerscore(dealerscore + response.data[0].cardnum);

            setStandcard(!standcard);
            
          }
        } catch(err) {
          console.error(err);
        }
    }

    const userwin = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/userwin", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });

            urlmove('/Betting');
        } catch(err) {
            console.error(err);
        }
    }

    const userlose = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/userlose", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });

            urlmove('/Betting');
        } catch(err) {
            console.error(err);
        }
    }

    const userdraw = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/userdraw", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });

            urlmove('/Betting');
        } catch(err) {
            console.error(err);
        }
    }




    useEffect(()=>{
        const fadeTimer = setTimeout(()=>{ setFade('end') }, 100)
        return ()=>{
            clearTimeout(fadeTimer);
  	        setFade('')
        }
    }, []);

    useEffect(() => {
        if(location.state != null){
            randomcard();
        }else {
            const Toast = Swal.mixin({
                width: 900,
            })
            
            Toast.fire({
                icon: "error",
                title: "새로고침 혹은 뒤로가기가 감지되어 메인으로 돌아갑니다.",
            }).then(function(){
                window.location.replace('/');
            });
        }
    }, []);



    useDidMountEffect(() => {                                                   //딜러 유저 카드값 비교 (user 카드값 변할때마다)
        const Toast = Swal.mixin({
            toast: true,
            position: 'center-center',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            width: 600,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        if(usercard_array.length === 2 && dealercard_array.length === 2 && dealercard_array[1].cardnum === 10){
            let cardopen = false;

            Toast.fire({
                icon: 'info',
                title: 'Insurance? (구현중..)',
            }).then(function(){
                //변수 하나 놓고 true면 한다 false면 안한다하고 아래 if문에서 쓰면될듯 조건으로..
                cardopen = true;
            });

            if(cardopen && dealercard_array[0].cardnum === 11){

                Toast.fire({
                    icon: 'info',
                    title: 'Dealer BlackJack!!',
                }).then(function(){
                    
                });
            }else if(cardopen){
                Toast.fire({
                    icon: 'info',
                    title: 'Dealer No BlackJack.',
                });
            }
        }

        let dealercard_result = setTimeout(()=>{
            if(userscore > 21){
                setIsFlipped(!isFlipped);
                cardflipaudio.play();

                for(var i = 0; i < usercard_array.length; i++){                 //여기 부분이 문제 (유저가 21넘었을때 에이스를 가진상황)
                    if(usercard_array[i].cardnum === 11){
                        setUserscore(userscore - 10);
                    }else if((i + 1) === usercard_array.length && userscore > 21){
                        Toast.fire({
                            icon: 'info',
                            title: 'User Bust!!  You lose!!',
                        }).then(function(){
                            urlmove('/Betting');
                        });
                    }
                }
            }else if (userscore === 21 && usercard_array.length === 2){
                setIsFlipped(!isFlipped);
                cardflipaudio.play();

                if(userscore == dealerscore && usercard_array.length == dealercard_array.length){
                    Toast.fire({
                        icon: 'info',
                        title: 'User BlackJack!!  Dealer BlackJack!!  push!!',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }else {
                    Toast.fire({
                        icon: 'info',
                        title: 'User BlackJack!!  You win!!',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }
            }
        }, 1000); 
    }, [userscore]);



    useEffect(() => {                                                              //첫 카드 4장 순차 슬라이드
        const userInterval = setInterval(() => {
          if (count < (usercard_array.length + dealercard_array.length)) {

            if(count === 0){
                setIsUserslide([true]);
            }else if(count === 1){
                setIsDealerslide([true]);
            }else if(count === 2){
                setIsUserslide((data) => [...data, true]);
            }else if(count === 3){
                setIsDealerslide((data) => [...data, true]);
            }

            cardslideaudio.play();

            count++;
          }
        }, 1000);
        return () => clearInterval(userInterval);
    }, [firstcard]);



    useDidMountEffect(() => {                                                       // 유저 카드 hit (hit 버튼 클릭시)
        let timer = setTimeout(()=>{
            setIsUserslide((data) => [...data, true]);
        }, 100);

        cardslideaudio.play();
    }, [hitcard]);



    useDidMountEffect(() => {                                                       // 딜러 카드 hit (stand 버튼 클릭시)
        console.log("현재 유저 카드 합계 : " + userscore);
        console.log("현재 딜러 카드 합계 : " + dealerscore);

        const Toast = Swal.mixin({
            toast: true,
            position: 'center-center',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            width: 600,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        let timer = setTimeout(()=>{
            setIsDealerslide((data) => [...data, true]);
            cardslideaudio.play();
        }, 1000);

        let timeraudio = setTimeout(()=>{
            if(dealerscore < 17){
                handleStand();
            }else if(dealerscore >= 17 && dealerscore <= 21){
                setIsFlipped(!isFlipped);
                cardflipaudio.play();
                
                if(userscore == dealerscore) {
                    Toast.fire({
                        icon: 'info',
                        title: 'Push..',
                    }).then(function(){
                        urlmove('/Betting');
                        //userdraw();
                    });
                }else if (userscore > dealerscore) {
                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer : ' + dealerscore + ', User : ' + userscore + '  You win!!',
                    }).then(function(){
                        urlmove('/Betting');
                        //userwin();
                    });
                }else {
                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer : ' + dealerscore + ', User : ' + userscore + '  You lose!!',
                    }).then(function(){
                        urlmove('/Betting');
                        //userlose();
                    });
                }
            }else if(dealerscore > 21){
                setIsFlipped(!isFlipped);
                cardflipaudio.play();

                for(var i = 0; i < dealercard_array.length; i++){               //여기 부분이 문제 (딜러가 21넘었을때 에이스를 가진상황)
                    if(dealercard_array[i].cardnum == 11){
                        console.log("딜러 스코어 -10 실행");
                        setDealerscore(dealerscore - 10);
                    }
                }

                if(dealerscore > 21){
                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer Bust!!  You win!!',
                    }).then(function(){
                        urlmove('/Betting');
                        //userwin();
                    });
                }else if(dealerscore <= 21 && userscore < dealerscore){
                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer : ' + dealerscore + ', User : ' + userscore + '  You lose!!',
                    }).then(function(){
                        urlmove('/Betting');
                        //userlose();
                    });
                }else if(dealerscore <= 21 && userscore > dealerscore){
                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer : ' + dealerscore + ', User : ' + userscore + '  You win!!',
                    }).then(function(){
                        urlmove('/Betting');
                        //userwin();
                    });
                }
            }
        }, 1000);
    }, [standcard]);

    

    const history = createBrowserHistory();                     // 1. history라는 상수에 createBrowerHistory 함수를 할당한다.
      
    const preventGoBack = () => {                               // 2. 뒤로가기 막는 함수 설정
        history.push(null, '', history.location.href);          // 2-1. 현재 상태를 세션 히스토리 스택에 추가(push)한다.
        const Toast = Swal.mixin({
            width: 700,
        });

        Toast.fire({
            icon: "error",
            title: "새로고침 혹은 뒤로가기가 감지되어 메인으로 돌아갑니다.",
        }).then(function(){
            window.location.replace('/');
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
    


    /* const preventClose = (e) => {                          // 새로고침을 감지하는 함수생성
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
    }); */


    return (
        <div className={"start " + fade}>
            <div className="tablediv">
                <img src={gametable} className='gametable' alt='gametable' />

                <div className="backsoundbar">
                    <AudioPlayer autoPlay src={backgroundsound} /* onPlay={e => console.log("onPlay")} */ loop={true} volume={0.1}
                        // other props here
                    />
                </div>

                <div>
                    {
                        dealercard_array.map((card, index) => {
                            let url = dealercard_array[index].cardimg;

                            if(index == 0){
                                return (
                                    <div key={index} className={`flip-container ${isFlipped ? 'flip' : ''} ${isDealerslide[index] ? `slide-dealer` : ''}${index}`} >
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
                                    <div key={index} className={`flip-container ${isDealerslide[index] ? `slide-dealer` : ''}${index}`} >
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
                                <div key={index} className={`usercard1 ${isUserslide[index] ? `slide-player` : ''}${index}`}>
                                    <img src={process.env.PUBLIC_URL + url} className="testcard"/>
                                </div>
                            )
                        })
                    }
                </div>

                <div className="cardstack">
                    <img src={cardstack} className="cardstack_img"></img>
                </div>

                <div className="gamebutton">
                    <button className="gbtn hit"  onClick={handleHit}>Hit</button>
                    <button className="gbtn stay" onClick={handleStand}>Stand</button>
                    <button className="gbtn doubledown" onClick={(e) =>  e.preventDefault()}>Double Down</button>
                </div>

                <div className="perfectusermoney">perfectbetsmoney : {location.state != null ? location.state.perfectbetsmoney : 0}</div>
                <div className="usermoney">betsmoney : {location.state != null ? location.state.betsmoney : 0}</div>
            </div>
        </div>
    );
}

export default Game;