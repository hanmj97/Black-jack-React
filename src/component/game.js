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
    const left = ["40%", "43%", "46%"];
    let usermoney = 0;

    console.log(location.state);

    const randomcard = () => {
        Axios.post("http://localhost:8000/randomcard", {
            userid: location.state.userid,
            betsmoney: location.state.betsmoney,
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

    /*
    const [flipped, setFlipped] = useState(false);

    const { transform, opacity } = useSpring({
        opacity: flipped ? 1 : 0,
        transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80 }
    });
    */

    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
      setIsFlipped(!isFlipped);
    };


    //randomcard();

    return (
        <div className={"start " + fade}>
            <div className="tablediv">
                <img src={gametable} className='gametable' alt='gametable' />

                <div className={`flip-container ${isFlipped ? 'flip' : ''}`} onClick={handleFlip}>
                    <div className="flipper">
                        <div className="front">
                            <img src={testcard} alt="Front" style={{
                                width: "10%",
                                height: "20%",
                            }}/>
                        </div>
                        <div className="back">
                            <img src={nocard} alt="Back" style={{
                                width: "10%",
                                height: "20%",
                            }}/>
                        </div>
                    </div>
                </div>
                
                {/* 
                <div className="delercard1" onClick={() => setFlipped(!flipped)}>
                    <animated.img src={testcard} className="testcard" style={{ opacity: opacity.interpolate(o => 1 - o), transform }}/>
                    <animated.img src={nocard} className="testcard" style={{
                        opacity,
                        transform: transform.interpolate(t => `${t} rotateX(180deg)`)
                    }}/>
                </div>
                 */}

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