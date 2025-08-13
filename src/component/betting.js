import gametable from "../headerimg/gametable2.jpg";
import nocard from "../cardimg/cardback.png";
import chip1 from "../chipimg/1_white_chip.png";
import chip5 from "../chipimg/5_red_chip.png";
import chip10 from "../chipimg/10_blue_chip.png";
import chip25 from "../chipimg/25_green_chip.png";
import chip100 from "../chipimg/100_black_chip.png";
import chip1000 from "../chipimg/1000_yellow_chip_3d.png";
import React, { useEffect, useRef, useState } from 'react';
import Axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import backgroundsound from '../soundeffect/backgroundsound.mp3';
import chipsound from '../soundeffect/chipsound.mp3';
import AudioPlayer from 'react-h5-audio-player';
import Modal from 'react-modal';
import { createBrowserHistory } from 'history';


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
    const [isDealDisabled, setDealDisabled] = useState(false); // Deal lock
    
    if(modalIsOpen){
        Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userrank", {
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

    Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userinfo", {
        id: sessionStorage.getItem("id"),
    }).then((res) => {
        usermoney = Number(res.data.usermoney);
        setIsmoney(Number(res.data.usermoney));
    }).catch((e) => {
        console.error(e);
    });


    useEffect(() => {
        const fadeTimer = setTimeout(()=>{ setFade('end') }, 100)
        return () => {
            clearTimeout(fadeTimer);
  	        setFade('');
        }
    }, []);


    const history = createBrowserHistory();
      
    const preventGoBack = () => {
        history.push(null, '', history.location.href);
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
            history.push(null, '', history.location.href);
            window.addEventListener('popstate', preventGoBack);
        })();
      
        return () => {
            window.removeEventListener('popstate', preventGoBack);
        };
    }, []);
      
    useEffect(() => {
        history.push(null, '', history.location.href);
    }, [history.location]);


    // Deal 클릭: DB 차감은 "확인" 이후에만!
    const handleDealClick = async (e) => {
        e.preventDefault();
        if (isDealDisabled) return;
        setDealDisabled(true);

        const perfectElement = document.getElementById('perfectbetmoney');
        const resultElement  = document.getElementById('bettingmoney');
        const perfect = Number(perfectElement.value || 0);
        const mainBet = Number(resultElement.value || 0);
        const totalBet = perfect + mainBet;

        // 1) 로컬 검증 (서버 차감 전)
        if (usermoney < 9) {
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
            });
            await Toast.fire({
                icon: 'error',
                title: '가진 돈이 최소 베팅금액보다 적습니다.',
            });
            urlmove('/Black-jack-React'); // 이동
            return; // 이동하므로 해제 불필요
        }

        if (usermoney >= 10 && mainBet < 10) {
            await Swal.fire({
                icon: 'warning',
                width: 800,
                title: '베팅한 금액이 최소 베팅금액보다 적습니다. <br/> (최소베팅금액 : 10$)',
            });
            setDealDisabled(false);
            return;
        }

        // 2) 사용자 확인 (이 시점에는 DB 차감 안함)
        const result = await Swal.fire({
            icon: 'info',
            title: '게임을 시작하시겠습니까? <br/> (게임시작 후 새로고침이나 뒤로가기 시 게임이 중단됩니다.)',
            width: 1000,
            showCancelButton: true,
            confirmButtonText: '시작',
            cancelButtonText: '취소',
        });

        if (!result.isConfirmed) {
            setDealDisabled(false);
            return;
        }

        // 3) 확인한 경우에만 DB 차감 호출
        try {
            const res = await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/betting", {
                betsmoney : totalBet,
                id : sessionStorage.getItem("id"),
            });

            if (res.data.betting === "finish") {
                // 성공 시 게임 화면으로 이동
                urlmove('/Game', {
                    state: {
                        userid: userid,
                        perfectbetsmoney: perfect, 
                        betsmoney: mainBet, 
                        resultmoney: Number(usermoney) - totalBet,
                    }
                });
                // 이동이므로 해제 불필요
            } else {
                await Swal.fire({
                    icon: 'warning',
                    width: 500,
                    title: '베팅에 실패하였습니다.',
                });
                setDealDisabled(false);
            }
        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: '서버 통신 중 오류가 발생했습니다.',
                text: '잠시 후 다시 시도해주세요.'
            });
            setDealDisabled(false);
        }
    };


    return (
        <div>
            <div className={"tablediv start " + fade}>
                <img src={gametable} className='gametable' alt='gametable' />

                {/* <div className="backsoundbar">
                    <AudioPlayer autoPlay src={backgroundsound} loop={true} volume={0.1} />
                </div> */}
    
                <div className="delercard1">
                    <img src={nocard} className="testcard" alt="card"/>
                </div>
                <div className="delercard2">
                    <img src={nocard} className="testcard2" alt="card"/>
                </div>

                <div className="usercard">
                    <img src={nocard} className="testcard" alt="card"/>
                </div>
                <div className="usercard2">
                    <img src={nocard} className="testcard2" alt="card"/>
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
                                    if(usermoney >= 10000000){
                                        return (
                                            <li key={userid} className="rank_user">
                                                <span className="rank_user_id">💎{userid}💎</span><span className="rank_user_usermoney">{usermoney}</span>
                                            </li>
                                        );
                                    }else if(usermoney >= 1000000){
                                        return (
                                            <li key={userid} className="rank_user">
                                                <span className="rank_user_id">🏆{userid}🏆</span><span className="rank_user_usermoney">{usermoney}</span>
                                            </li>
                                        );
                                    }else if(usermoney >= 100000){
                                        return (
                                            <li key={userid} className="rank_user">
                                                <span className="rank_user_id">🥇{userid}🥇</span><span className="rank_user_usermoney">{usermoney}</span>
                                            </li>
                                        );
                                    }else if(usermoney >= 10000){
                                        return (
                                            <li key={userid} className="rank_user">
                                                <span className="rank_user_id">🏅{userid}🏅</span><span className="rank_user_usermoney">{usermoney}</span>
                                            </li>
                                        );
                                    }else if(usermoney >= 1000){
                                        return (
                                            <li key={userid} className="rank_user">
                                                <span className="rank_user_id">💰{userid}💰</span><span className="rank_user_usermoney">{usermoney}</span>
                                            </li>
                                        );
                                    }else {
                                        return (
                                            <li key={userid} className="rank_user">
                                                <span className="rank_user_id">{userid}</span><span className="rank_user_usermoney">{usermoney}</span>
                                            </li>
                                        );
                                    }
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
                    <img src={chip1000} className="chip1000" onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        chipaudio.play();

                        if(Number(perfectElement.value) + Number(resultElement.value) + 1000 <= usermoney){
                            resultElement.value = Number(resultElement.value) + 1000;
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

                    <button
                        className="gbtn finbats"
                        onClick={handleDealClick}
                        disabled={isDealDisabled}
                        aria-busy={isDealDisabled}
                    >
                        {isDealDisabled ? '처리중…' : 'Deal'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Game;