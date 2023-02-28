import gametable from "../headerimg/gametable.jpg";
import testcard from "../cardimg/1_ace_of_clubs.png";
import testcard2 from "../cardimg/10_king_of_hearts.png";
import nocard from "../cardimg/cardback.jpg";
import React, { useEffect, useRef, useState } from 'react';
import Axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';


const Game = () => {  
    const urlmove = useNavigate();
    const left = ["40%", "43%", "46%"];
    let usermoney = 0;

    const randomcard = () => {
        Axios.post("http://localhost:8000/randomcard", {
            
        }).then((res) => {
            if (res.data.affectedRows === 1){
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
                    icon: 'success',
                    title: '아이디가 정상적으로 생성되었습니다. <br/> 생성된 아이디로 로그인해주세요.',
                }).then(function(){
                    urlmove('/');
                });
                
            }else {
                Swal.fire({
                    icon: "warning",
                    title: "아이디 중복",
                    text: "이미 존재하는 아이디입니다.",
                });
            }
        }).catch((e) => {
            console.error(e);
        });
    }

    return (
        <div>
            <div className="tablediv">
                <img src={gametable} className='gametable' alt='gametable' />

                <div className="delercard1">
                    <img src={testcard} className="testcard"/>
                </div>
                <div className="delercard2">
                    <img src={nocard} className="testcard2"/>
                </div>

                <div >
                    {
                        left.map((css, index) => {
                            return (
                                <div key={index} className="usercard1" style={{left : left[index]}}>
                                    <img src={testcard} className="testcard"/>
                                </div>
                            )
                        })
                    }
                    <div className="usercard2">
                        <img src={testcard2} className="testcard2"/>
                    </div>
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
}

export default Game;