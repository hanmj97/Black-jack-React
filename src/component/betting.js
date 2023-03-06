import gametable from "../headerimg/gametable2.jpg";
import testcard from "../cardimg/1_ace_of_clubs.png";
import testcard2 from "../cardimg/10_king_of_hearts.png";
import nocard from "../cardimg/cardback.png";
import chip1 from "../chipimg/1_white_chip.png";
import chip5 from "../chipimg/5_red_chip.png";
import chip10 from "../chipimg/10_blue_chip.png";
import chip25 from "../chipimg/25_green_chip.png";
import chip100 from "../chipimg/100_black_chip.png";
import soundicon from "../headerimg/soundicon.png";
import React, { useEffect, useRef, useState } from 'react';
import Axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import backgroundsound from '../soundeffect/backgroundsound.mp3';
import chipsound from '../soundeffect/chipsound.mp3';
import useSound from 'use-sound';
import AudioPlayer from 'react-h5-audio-player';


let userid = "";
let usermoney = 0;


userid = sessionStorage.getItem("id");

Axios.post("http://localhost:8000/userinfo", {
    id: sessionStorage.getItem("id"),
}).then((res) => {
    usermoney = Number(res.data.usermoney);
}).catch((e) => {
    console.error(e);
});
  

setInterval(() => {
    userid = sessionStorage.getItem("id");

    Axios.post("http://localhost:8000/userinfo", {
        id: sessionStorage.getItem("id"),
    }).then((res) => {  
        usermoney = Number(res.data.usermoney);
    }).catch((e) => {
        console.error(e);
    });
}, 1000);



const Game = () => {  
    const urlmove = useNavigate();
    const battingmoney = 0;
    let [fade, setFade] = useState('');
    var chipaudio = new Audio(chipsound);
    /* const audio = new Audio(backgroundsound);
    let playstatus = false;
    const [isPlaying, setIsPlaying] = React.useState(false); */


    /* const playbacksound = () => {
        if(playstatus) {
            playstatus = false;

            audio.pause();        // mp3 재생
        }else {
            playstatus = true;

            audio.loop = true;   // 반복재생하지 않음
            audio.volume = 0.2;  // 음량 설정
            audio.muted = true;
            audio.play();        // mp3 재생
            audio.muted = false;
        }
    } 

    const [play, {pause}] = useSound(backgroundsound, {
        volume: 0.2,
        onplay: () => setIsPlaying(true),
        onend: () => setIsPlaying(false),
    });

    const togglePlay = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
        setIsPlaying(!isPlaying);
    }
    */

    useEffect(() => {
        // tab의 상태가 변할때 (클릭 후 다른탭 열리면) 0.1초 뒤 'end' className 바인딩
        const fadeTimer = setTimeout(()=>{ setFade('end') }, 100)
        return () => {
            // 기존 fadeTimer 제거 후 class 빈 값으로 변경
            clearTimeout(fadeTimer);
  	        setFade('');
        }
    }, []);


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

                        Axios.post("http://localhost:8000/betting", {
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
                                        urlmove('/');
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