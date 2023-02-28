import gametable from "../headerimg/gametable.jpg";
import testcard from "../cardimg/1_ace_of_clubs.png";
import testcard2 from "../cardimg/10_king_of_hearts.png";
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

    //console.log("돈 : " + usermoney);
}, 5000);



const Game = () => {  
    const urlmove = useNavigate();
    const battingmoney = 0;

    let [fade, setFade] = useState('');

    useEffect(()=>{
        // tab의 상태가 변할때 (클릭 후 다른탭 열리면) 0.1초 뒤 'end' className 바인딩
        const fadeTimer = setTimeout(()=>{ setFade('end') }, 100)
        return ()=>{
            // 기존 fadeTimer 제거 후 class 빈 값으로 변경
            clearTimeout(fadeTimer);
  	        setFade('')
        }
    }, []);

    return (
        <div>
            <div className={"tablediv start " + fade}>
                <img src={gametable} className='gametable' alt='gametable' />

                <div className="delercard1">
                    <img src={nocard} className="testcard"/>
                </div>
                <div className="delercard2">
                    <img src={nocard} className="testcard2"/>
                </div>

                <div className="usercard1">
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
                            const resultElement = document.getElementById('bettingmoney');
                            
                            resultElement.value = usermoney;
                        }}>All In</button>
                    </div>
                    <img src={chip5} className="chip5"     onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        if(Number(perfectElement.value) + Number(resultElement.value) + 5 <= usermoney){
                            resultElement.value = Number(resultElement.value) + 5;
                        }
                    }}/>
                    <img src={chip10} className="chip10"   onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        if(Number(perfectElement.value) + Number(resultElement.value) + 10 <= usermoney){
                            resultElement.value = Number(resultElement.value) + 10;
                        }
                    }}/>
                    <img src={chip25} className="chip25"   onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

                        if(Number(perfectElement.value) + Number(resultElement.value) + 25 <= usermoney){
                            resultElement.value = Number(resultElement.value) + 25;
                        }
                    }}/>
                    <img src={chip100} className="chip100" onClick={() => {
                        const perfectElement = document.getElementById('perfectbetmoney');
                        const resultElement = document.getElementById('bettingmoney');

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

                        const resultElement = document.getElementById('bettingmoney');

                        Axios.post("http://localhost:8000/betting", {
                            betsmoney : resultElement.value,
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
                                    const resultElement = document.getElementById('bettingmoney');

                                    urlmove('/Game', {
                                        state: {
                                            userid: userid,
                                            betsmoney: Number(resultElement.value), 
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