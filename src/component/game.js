import gametable from "../headerimg/gametable.png";
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
import $ from 'jquery';


const Game = () => {  
    const urlmove = useNavigate();
    const location = useLocation();
    const [usercard_array, setUsercard_array] = useState([]);
    const [dealercard_array, setDealercard_array] = useState([]);
    const [firstcard, setFirstcard] = useState(false);
    const [hitcard, setHitcard] = useState(false);
    const [standcard, setStandcard] = useState(false);
    let userscoreref = useRef(0);
    let dealerscoreref = useRef(0);
    let user_card_ace = useRef(0);
    let dealer_card_ace = useRef(0);
    let count = 0;
    let [fade, setFade] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);               //카드 플립
    const [isstandFlipped, setIsstandFlipped] = useState(0);               //카드 플립
    const [isUserslide, setIsUserslide] = useState([]);              //카드 슬라이드(user)
    const [isDealerslide, setIsDealerslide] = useState([]);          //카드 슬라이드(dealer)
    var cardslideaudio = new Audio(cardslidesound);
    var cardflipaudio = new Audio(cardflipsound);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    let doubledown_val = useRef(false);
    const [isdoubledown, setIsdoubledown] = useState(false);


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


    useEffect(() => {                                       //랜더링 후 버튼 6초 비활성화
        const timer = setTimeout(() => {
            setIsButtonDisabled(false);
        }, 7500);
    
        return () => {
            clearTimeout(timer);
        };
    }, []);


    const first_user_blackjack = () => {
        let dealercard_result = setTimeout(()=>{
            userblackjack();
        }, 5000);
    }

    const first_perfectpair = () => {
        let dealercard_result = setTimeout(()=>{
            const Toast = Swal.mixin({
                toast: true,
                position: 'center-center',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                width: 600,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });

            userperfectbet();

            Toast.fire({
                icon: 'info',
                title: 'User Perfect Pair!!!!! (Your PerfectPairBets x 30)',
            });

        }, 5000);
    }


    const randomcard = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/randomcard", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });

            if(response.data.length == 4){
                setUsercard_array((prevArray) => [...prevArray, response.data[0], response.data[2]]);
                setDealercard_array((prevArray) => [...prevArray, response.data[1], response.data[3]]);

                setFirstcard(true);

                userscoreref.current = response.data[0].cardnum + response.data[2].cardnum;
                dealerscoreref.current = response.data[1].cardnum + response.data[3].cardnum;

                user_card_ace.current = response.data[0].cardnum + response.data[2].cardnum;
                dealer_card_ace.current = response.data[1].cardnum + response.data[3].cardnum;

                /* if((Number(response.data[0].cardnum) == 1 || Number(response.data[2].cardnum) == 1) && response.data[0].cardnum + response.data[2].cardnum < 12){
                    userscoreref.current = userscoreref.current + 10;
                    console.log("유저 스코어 +10 실행");
                }

                if((Number(response.data[1].cardnum) == 1 || Number(response.data[3].cardnum) == 1) && response.data[1].cardnum + response.data[3].cardnum < 12){
                    dealerscoreref.current = dealerscoreref.current + 10;
                    console.log("딜러 스코어 +10 실행");
                } */
            }

            const Toast_insurance = Swal.mixin({
                icon: 'error',
                title: '메인화면으로 돌아가시겠습니까?',
                showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
                confirmButtonColor: '#3085d6', // confrim 버튼 색깔 지정
                cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
                confirmButtonText: '승인', // confirm 버튼 텍스트 지정
                cancelButtonText: '취소', // cancel 버튼 텍스트 지정
            });

            const Toast = Swal.mixin({
                toast: true,
                position: 'center-center',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                width: 600,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });


            if((response.data[0].cardnum == 10 && response.data[2].cardnum == 1 && dealerscoreref.current != 21) || (response.data[0].cardnum == 1 && response.data[2].cardnum == 10 && dealerscoreref.current != 21)){
                first_user_blackjack();
            }else if(response.data[1].insurance == 'insurance'){
                let dealercard_result = setTimeout(()=>{
                    Toast_insurance.fire({
                        icon: 'info',
                        title: 'Insurance? (구현중..)',
                    }).then(result => {
                        if(result.isConfirmed){             //인슈어런스 받으면..
                            //여기서 베팅금액 절반 ~ 베팅금액 만큼 받은 후.. 블랙잭인지 아닌지 확인
                            if(response.data[1].cardnum == 10){
                                setIsFlipped(!isFlipped);
                                cardflipaudio.play();

                                if(userscoreref.current === dealerscoreref.current) {
                                    userdraw();
                                        
                                    Toast.fire({
                                        icon: 'info',
                                        title: 'User BlackJack!!  Dealer BlackJack!! ( push!! )',
                                    }).then(function(){
                                        urlmove('/Betting');
                                    });
                                }else {
                                    Toast.fire({
                                        icon: 'info',
                                        title: 'Dealer BlackJack!! ( You lose!! )',
                                    }).then(function(){
                                        urlmove('/Betting');
                                    });
                                }
                            }else {
                                Toast.fire({
                                    icon: 'info',
                                    title: 'Dealer No BlackJack!!',
                                });
                            }
                        }else {
                            if(response.data[1].cardnum == 10){
                                setIsFlipped(!isFlipped);
                                cardflipaudio.play();

                                if(userscoreref.current === dealerscoreref.current) {
                                    userdraw();
                                        
                                    Toast.fire({
                                        icon: 'info',
                                        title: 'User BlackJack!!  Dealer BlackJack!! ( push!! )',
                                    }).then(function(){
                                        urlmove('/Betting');
                                    });
                                }else {
                                    Toast.fire({
                                        icon: 'info',
                                        title: 'Dealer BlackJack!! ( You lose!! )',
                                    }).then(function(){
                                        urlmove('/Betting');
                                    });
                                }
                            }else {
                                Toast.fire({
                                    icon: 'info',
                                    title: 'Dealer No BlackJack!!',
                                });
                            }
                        }
                    });
                }, 5000);
            }else if(response.data[3].cardnum == 10){
                let dealercard_result = setTimeout(()=>{
                    if(response.data[1].cardnum == 1){
                        setIsFlipped(!isFlipped);
                        cardflipaudio.play();

                        if(userscoreref.current === dealerscoreref.current) {
                            userdraw();
                                
                            Toast.fire({
                                icon: 'info',
                                title: 'User BlackJack!!  Dealer BlackJack!! ( push!! )',
                            }).then(function(){
                                urlmove('/Betting');
                            });
                        }else {
                            Toast.fire({
                                icon: 'info',
                                title: 'Dealer BlackJack!! ( You lose!! )',
                            }).then(function(){
                                urlmove('/Betting');
                            });
                        }
                    }else {
                        Toast.fire({
                            icon: 'info',
                            title: 'Dealer No BlackJack!!',
                        });
                    }
                }, 5000);
            }

            if(response.data[0].cardnum == response.data[2].cardnum && response.data[0].cardpattern == response.data[2].cardpattern && response.data[0].cardimg == response.data[2].cardimg){
                first_perfectpair();
            }
        } catch(err) {
          console.error(err);
        }
    }

    const handleHit = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/hit", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });

            setUsercard_array((prevArray) => [...prevArray, response.data[0]]);

            userscoreref.current = userscoreref.current + response.data[0].cardnum;

            user_card_ace.current = user_card_ace.current + Number(usercard_array[usercard_array.length - 1].cardnum);

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

            if(dealerscoreref.current >= 17 && dealerscoreref.current <= 20){
                setStandcard(!standcard);
            }else {
                setDealercard_array((prevArray) => [...prevArray, response.data[0]]);

                dealerscoreref.current = dealerscoreref.current + response.data[0].cardnum;

                dealer_card_ace.current = dealer_card_ace.current + Number(dealercard_array[dealercard_array.length - 1].cardnum);

                setStandcard(!standcard);
            }
        } catch(err) {
          console.error(err);
        }
    }


    const handleDoubledown = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/doubledown", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });

            setUsercard_array((prevArray) => [...prevArray, response.data[0]]);

            userscoreref.current = userscoreref.current + response.data[0].cardnum;

            user_card_ace.current = user_card_ace.current + Number(usercard_array[usercard_array.length - 1].cardnum);

            //doubledown_val.current = true;

            setIsdoubledown(!isdoubledown);

            setHitcard(!hitcard);
          
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
        } catch(err) {
            console.error(err);
        }
    }

    const userdoubledownwin = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/userdoublewin", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });
        } catch(err) {
            console.error(err);
        }
    }

    const userdoubledownlose = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/userdoublelose", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });
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
        } catch(err) {
            console.error(err);
        }
    }

    const userblackjack = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/userblackjack", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
                betsmoney: location.state.betsmoney,
            });

            const Toast = Swal.mixin({
                toast: true,
                position: 'center-center',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                width: 600,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });

            setIsFlipped(!isFlipped);
            cardflipaudio.play();

            Toast.fire({
                icon: 'info',
                title: 'User BlackJack!! (bets x 1.4)',
            }).then(function(){
                urlmove('/Betting');
            });

        } catch(err) {
            console.error(err);
        }
    }


    const userperfectbet = async () => {
        try {
            const response = await Axios.post("http://localhost:8000/userperfectbet", {
                userid: location.state.userid,
                perfectbetsmoney: location.state.perfectbetsmoney,
            });
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
            timer: 2000,
            timerProgressBar: true,
            width: 600,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        let dealercard_result = setTimeout(()=>{
            if(userscoreref.current > 21){
                setIsFlipped(!isFlipped);
                cardflipaudio.play();

                if(isdoubledown){
                    userdoubledownlose();

                    Toast.fire({
                        icon: 'info',
                        title: 'User Bust!! - Doubledown  ( You lose!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }else {
                    Toast.fire({
                        icon: 'info',
                        title: 'User Bust!!  ( You lose!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }
                
            }else if (userscoreref.current === 21 && usercard_array.length === 2){
                setIsFlipped(!isFlipped);
                cardflipaudio.play();

                if(userscoreref.current == dealerscoreref.current && usercard_array.length == dealercard_array.length){
                    userdraw();

                    Toast.fire({
                        icon: 'info',
                        title: 'User BlackJack!!  Dealer BlackJack!! ( push!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }else {
                    userwin();

                    Toast.fire({
                        icon: 'info',
                        title: 'User BlackJack!! ( You win!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }
            }else {
                if(isdoubledown){
                    let timer = setTimeout(()=>{
                        handleStand();
                    }, 500);
                }
            }
        }, 800); 
        
    }, [hitcard]);



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
        const Toast = Swal.mixin({
            toast: true,
            position: 'center-center',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            width: 800,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        if(!isFlipped) {
            setIsFlipped(!isFlipped);
            cardflipaudio.play();
        }

        let timer = setTimeout(()=>{
            setIsDealerslide((data) => [...data, true]);
            cardslideaudio.play();
        }, 1000);

        let timeraudio = setTimeout(()=>{
            for(var i = 0; i < usercard_array.length; i++){
                if(Number(usercard_array[i].cardnum) == 1 && userscoreref.current < 12){
                    userscoreref.current = userscoreref.current + 10;
                    console.log("유저 스코어 +10 실행");
                }
            }

            for(var i = 0; i < dealercard_array.length; i++){
                if(Number(dealercard_array[i].cardnum) == 1 && dealerscoreref.current < 12){
                    dealerscoreref.current = dealerscoreref.current + 10;
                    console.log("딜러 스코어 +10 실행");
                }
            }

            if(dealerscoreref.current < 17){
                handleStand();
            }else if(dealerscoreref.current >= 17 && dealerscoreref.current <= 21){
                if(userscoreref.current == dealerscoreref.current) {
                    userdraw();

                    Toast.fire({
                        icon: 'info',
                        title: 'Push..  (Draw)',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }else if (userscoreref.current > dealerscoreref.current) {
                    if(isdoubledown){
                        userdoubledownwin();

                        Toast.fire({
                            icon: 'info',
                            title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' - Doubledown ( You win!! )',
                        }).then(function(){
                            urlmove('/Betting');
                        });
                    }else {
                        userwin();

                        Toast.fire({
                            icon: 'info',
                            title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' ( You win!! )',
                        }).then(function(){
                            urlmove('/Betting');
                        });
                    }
                }else {
                    if(isdoubledown){
                        userdoubledownlose();

                        Toast.fire({
                            icon: 'info',
                            title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' - Doubledown ( You lose!! )',
                        }).then(function(){
                            urlmove('/Betting');
                        });
                    }else {
                        Toast.fire({
                            icon: 'info',
                            title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' ( You lose!! )',
                        }).then(function(){
                            urlmove('/Betting');
                        });
                    }
                }
            }else if(dealerscoreref.current > 21){
                if(isdoubledown){
                    userdoubledownwin();

                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer Bust!! - Doubledown  ( You win!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }else {
                    userwin();

                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer Bust!!  ( You win!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }
            }else if(dealerscoreref.current >= 17 && dealerscoreref.current <= 21 && userscoreref.current < dealerscoreref.current){
                if(isdoubledown){
                    userdoubledownlose();

                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' - Doubledown  ( You lose!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }else {
                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + '  ( You lose!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }
            }else if(dealerscoreref.current >= 17 && dealerscoreref.current <= 21 && userscoreref.current > dealerscoreref.current){
                if(isdoubledown){
                    userdoubledownwin();

                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' - Doubledown  ( You win!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }else {
                    userwin();

                    Toast.fire({
                        icon: 'info',
                        title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + '  ( You win!! )',
                    }).then(function(){
                        urlmove('/Betting');
                    });
                }
            }else if(dealerscoreref.current < 17){
                    handleStand();
            }
        }, 1200);

        console.log("현재 유저 카드 합계 : " + userscoreref.current);
        console.log("현재 딜러 카드 합계 : " + dealerscoreref.current);
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
                    <button className="gbtn hit" disabled={isButtonDisabled} onClick={async () => {  
                        if (standcard) {
                            return;
                        }
                        if (isButtonDisabled) {
                            return;
                        }
                      
                        setIsButtonDisabled(true);
                      
                        try {
                            await handleHit();
                        } catch (error) {
                            console.error(error);
                        }
                      
                        setTimeout(() => setIsButtonDisabled(false), 3500);
                    }}>Hit</button>
                    <button className="gbtn stay" disabled={isButtonDisabled} onClick={async () => {
                        if (isButtonDisabled) {
                            return;
                        }
                      
                        setIsButtonDisabled(true);
                      
                        try {
                            await handleStand();
                        } catch (error) {
                            console.error(error);
                        }
                      
                        setTimeout(() => setIsButtonDisabled(false), 3500);
                    }}>Stand</button>
                    <button className="gbtn doubledown" id="doubledown_btn" disabled={isButtonDisabled} onClick={async () => {  
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'center-center',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                            width: 800,
                            didOpen: (toast) => {
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });

                        if (hitcard || standcard) {
                            Toast.fire({
                                icon: "error",
                                title: "이미 Hit이나 Stand를 했기 때문에 DoubleDown을 하실 수 없습니다.",
                            });

                            return;
                        }
                        if (isButtonDisabled) {
                            return;
                        }

                        if(location.state.resultmoney >= location.state.betsmoney){
                            setIsButtonDisabled(true);
                      
                            try {
                                await handleDoubledown();
                            } catch (error) {
                                console.error(error);
                            }
                        }else {
                            Toast.fire({
                                icon: "error",
                                title: "가진 금액이 부족해 DoubleDown을 할 수 없습니다.",
                            });
                        }
                    }}>Double Down</button>
                </div>

                <div className="perfectusermoney">perfectbetsmoney : {location.state != null ? location.state.perfectbetsmoney : 0}</div>
                <div className="usermoney">betsmoney : {location.state != null ? location.state.betsmoney : 0} <span className={`${isdoubledown ? '' : 'boubledown_bets'}`}> * 2</span></div>
            </div>
        </div>
    );
}

export default Game;