import gametable from "../headerimg/gametable2.jpg";
import nocard from "../cardimg/cardback.png";
import chip1 from "../chipimg/1_white_chip.png";
import chip5 from "../chipimg/5_red_chip.png";
import chip10 from "../chipimg/10_blue_chip.png";
import chip25 from "../chipimg/25_green_chip.png";
import chip100 from "../chipimg/100_black_chip.png";
import React, { useEffect, useRef, useState } from 'react';
import Axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import backgroundsound from '../soundeffect/backgroundsound.mp3';
import chipsound from '../soundeffect/chipsound.mp3';
import AudioPlayer from 'react-h5-audio-player';
import Modal from 'react-modal';


let userid = "";
let usermoney = 0;


const Game = () => {  
    const urlmove = useNavigate();
    const battingmoney = 0;
    let [fade, setFade] = useState('');
    const [ismoney, setIsmoney] = useState(0);
    var chipaudio = new Audio(chipsound);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [rank, setRank] = useState([]);


    if(modalIsOpen){
        Axios.post("https://port-0-black-jack-react-server-p8xrq2mleyd78ib.sel3.cloudtype.app/userrank", {
            id: sessionStorage.getItem("id"),
        }).then((res) => {
            setRank(res.data);
        }).catch((e) => {
            console.error(e);
        });
    }


    const customStyles = {
        overlay: {
            position: 'fixed',
            backgroundColor: 'rgba(255, 255, 255, 0)',
            zIndex: 500,
        },
        content: {
            width: '30%',
            height: '50%',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        }

    }


    userid = sessionStorage.getItem("id");

    Axios.post("https://port-0-black-jack-react-server-p8xrq2mleyd78ib.sel3.cloudtype.app/userinfo", {
        id: sessionStorage.getItem("id"),
    }).then((res) => {
        usermoney = Number(res.data.usermoney);
        setIsmoney(Number(res.data.usermoney));
    }).catch((e) => {
        console.error(e);
    });


    useEffect(() => {
        // tab의 상태가 변할때 (클릭 후 다른탭 열리면) 0.1초 뒤 'end' className 바인딩
        const fadeTimer = setTimeout(()=>{ setFade('end') }, 100)
        return () => {
            // 기존 fadeTimer 제거 후 class 빈 값으로 변경
            clearTimeout(fadeTimer);
  	        setFade('');
        }
    }, []);


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
            window.location.replace('/Black-jack-React');
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


    return (
        <div>
            <div className={"tablediv start " + fade}>
                <img src={gametable} className='gametable' alt='gametable' />


                <div className="backsoundbar">
                    <AudioPlayer autoPlay src={backgroundsound} /* onPlay={e => console.log("onPlay")} */ loop={true} volume={0.1}
                        // other props here
                    />
                </div>
    
                <div className="delercard1">
                    <img src={nocard} className="testcard"/>
                </div>
                <div className="delercard2">
                    <img src={nocard} className="testcard2"/>
                </div>

                <div className="usercard">
                    <img src={nocard} className="testcard"/>
                </div>
                <div className="usercard2">
                    <img src={nocard} className="testcard2"/>
                </div>

                <div className="usermoney">bankroll : {usermoney}</div>

                <div className="betsfield">
                    <a className="perfectbettext">Perfect Pair Bets : </a>
                    <a className="bettingtext">Bets : </a>
                    <input type="number" className="perfectbetmoney" id="perfectbetmoney" disabled={true} value={battingmoney} ></input><a className="perfectdallor">$</a>
                    <input type="number" className="bettingmoney" id="bettingmoney" disabled={true} value={battingmoney} ></input><a className="betdallor">$</a>
                </div>

                <div className="rank_btn">
                    <button className="gbtn ranks" onClick={() => {
                        setModalIsOpen(true);
                    }}>Ranking</button>

                    <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} ariaHideApp={false} style={customStyles}>
      	                <div className="ranking">
                            <span className="rank_title">👑 Black-jack Ranking 👑</span>
                        </div>
                        <div className="rank_content">
                            <ul className='rank_link'>
                                <li className="rank_user">
                                    <span className="rank_user_id_head">User ID</span><span className="rank_user_usermoney_head">Score</span>
                                </li>
                                {rank.map((ranking) => {
                                    const { userid, usermoney, username } = ranking;
                                    return (
                                        <li key={userid} className="rank_user">
                                            <span className="rank_user_id">{userid}</span><span className="rank_user_usermoney">{usermoney}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </Modal>
                </div>

                <div className="chips">
                    <div className="betbtn1">
                        <button className="gbtn betreset" onClick={() => {
                            const perfectElement = document.getElementById('perfectbetmoney');
                            const resultElement = document.getElementById('bettingmoney');

                            perfectElement.value = 0;
                            resultElement.value = 0;
                        }}>Reset</button>
                    </div>

                    <div className="betbtn2">
                    <button className="gbtn betallin" onClick={() => {
                            const perfectElement = document.getElementById('perfectbetmoney');
                            const resultElement = document.getElementById('bettingmoney');
                            
                            chipaudio.play();
                            
                            resultElement.value = usermoney - perfectElement.value;
                        }}>All In</button>
                    </div>
                    <img src={chip5} className="chip5"     onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        chipaudio.play();

                        if(Number(perfectElement.value) + Number(resultElement.value) + 5 <= usermoney){
                            resultElement.value = Number(resultElement.value) + 5;
                        }
                    }}/>
                    <img src={chip10} className="chip10"   onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        chipaudio.play();

                        if(Number(perfectElement.value) + Number(resultElement.value) + 10 <= usermoney){
                            resultElement.value = Number(resultElement.value) + 10;
                        }
                    }}/>
                    <img src={chip25} className="chip25"   onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        chipaudio.play();

                        if(Number(perfectElement.value) + Number(resultElement.value) + 25 <= usermoney){
                            resultElement.value = Number(resultElement.value) + 25;
                        }
                    }}/>
                    <img src={chip100} className="chip100" onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        chipaudio.play();

                        if(Number(perfectElement.value) + Number(resultElement.value) + 100 <= usermoney){
                            resultElement.value = Number(resultElement.value) + 100;
                        }
                    }}/>
                </div>

                <div className="finishbats">
                    <button className="gbtn perfectbets" onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        if(Number(resultElement.value) > 50){
                            Swal.fire({
                                icon: "warning",
                                title: "Perfect Pair",
                                html: "베팅금액이 최대치를 벗어났습니다. <br/> (최대 베팅가능금액 : 50$)",
                            });
                        }else {
                            perfectElement.value = resultElement.value;
                            resultElement.value = 0;
                        }
                    }}>Perfect Pair Bets</button>
                    <button className="gbtn finbats" onClick={(e) =>  {
                        e.preventDefault();

                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        Axios.post("https://port-0-black-jack-react-server-p8xrq2mleyd78ib.sel3.cloudtype.app/betting", {
                            betsmoney : Number(resultElement.value) + Number(perfectElement.value),
                            id : sessionStorage.getItem("id"),
                        }).then((res) => {
                            if(res.data.betting === "finish"){

                                if(usermoney < 9){
                                    const Toast = Swal.mixin({
                                        toast: true,
                                        position: 'center-center',
                                        showConfirmButton: false,
                                        timer: 3000,
                                        timerProgressBar: true,
                                        width: 500,
                                        didOpen: (toast) => {
                                          toast.addEventListener('mouseenter', Swal.stopTimer)
                                          toast.addEventListener('mouseleave', Swal.resumeTimer)
                                        }
                                    })
                    
                                    Toast.fire({
                                        icon: 'error',
                                        title: '가진 돈이 최소 베팅금액보다 적습니다.',
                                    }).then(function(){
                                        urlmove('/Black-jack-React');
                                    });
                                }else if(usermoney >= 10 && resultElement.value < 10){
                                    const Toast = Swal.mixin({
                                        width: 800,
                                    })
        
                                    Toast.fire({
                                        icon: 'warning',
                                        title: '베팅한 금액이 최소 베팅금액보다 적습니다.',
                                    });
                                }else {
                                    const perfectElement = document.getElementById('perfectbetmoney');
                                    const resultElement = document.getElementById('bettingmoney');
                                    
                                    const Toast = Swal.mixin({
                                        width: 1000,
                                    });
                            
                                    Toast.fire({
                                        icon: 'info',
                                        title: '게임을 시작하시겠습니까? <br/> (게임시작 후 새로고침이나 뒤로가기 시 게임이 중단됩니다.)',
                                    }).then(result => {
                                        if (result.isConfirmed) {
                                            urlmove('/Game', {
                                                state: {
                                                    userid: userid,
                                                    perfectbetsmoney: Number(perfectElement.value), 
                                                    betsmoney: Number(resultElement.value), 
                                                    resultmoney: Number(usermoney) - (Number(resultElement.value) + Number(perfectElement.value)),
                                                }
                                            });
                                        }
                                    });
                                }
                            } else {
                                const Toast = Swal.mixin({
                                    width: 500,
                                })
    
                                Toast.fire({
                                    icon: 'warning',
                                    title: '베팅에 실패하였습니다.',
                                });
                            }
                        }).catch((e) => {
                            console.error(e);
                        });

                    }}>Deal</button>
                </div>
            </div>
        </div>
    );
}

export default Game;