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

const Game = () => {  
    const urlmove = useNavigate();
    const location = useLocation();

    // Cache route state ONCE to avoid null after any re-render/navigation attempts
    const [params, setParams] = useState(() => {
        if (location.state) {
            return {
                userid: location.state.userid,
                perfectbetsmoney: Number(location.state.perfectbetsmoney || 0),
                betsmoney: Number(location.state.betsmoney || 0),
                resultmoney: Number(location.state.resultmoney || 0),
            };
        }
        return null;
    });

    useEffect(() => {
        // If we don't have params yet but route delivered state later (unlikely), set it.
        if (!params && location.state) {
            setParams({
                userid: location.state.userid,
                perfectbetsmoney: Number(location.state.perfectbetsmoney || 0),
                betsmoney: Number(location.state.betsmoney || 0),
                resultmoney: Number(location.state.resultmoney || 0),
            });
        }
    }, [location.state, params]);

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
    const [isinsurance, setIsinsurance] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isUserslide, setIsUserslide] = useState([]);
    const [isDealerslide, setIsDealerslide] = useState([]);
    var cardslideaudio = new Audio(cardslidesound);
    var cardflipaudio = new Audio(cardflipsound);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isdoubledown, setIsdoubledown] = useState(false);
    const [uiDisabled, setUiDisabled] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);

    const cardImages = require.context('../cardimg', false, /\.png$/);
    function resolveCard(urlOrFilename) {
      const name = String(urlOrFilename || '').split('/').pop();
      try { return cardImages('./' + name); } catch { return nocard; }
    }

    const handleResize = () => setWidth(window.innerWidth);
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => { // 초반 버튼 잠금
        const timer = setTimeout(() => setIsButtonDisabled(false), 6500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if(width < 769){
            const Toast = Swal.mixin({ width: 900 });
            Toast.fire({
                icon: "error",
                title: "화면 전환이 감지되어 메인으로 돌아갑니다.",
            });
            setTimeout(() => { window.location.replace('/Black-jack-React'); }, 2000);
        }
    }, [width]);

    const first_user_blackjack = () => {
        setTimeout(()=>{ userblackjack(); }, 4000);
    }

    const first_perfectpair = () => {
        setTimeout(()=>{
            const Toast = Swal.mixin({
                toast: true, position: 'center-center', showConfirmButton: false,
                timer: 2000, timerProgressBar: true, width: 600,
                didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
            });
            userperfectbet();
            Toast.fire({ icon: 'info', title: 'User Perfect Pair!!!!! (Your PerfectPairBets x 30)' });
        }, 4000);
    }

    const randomcard = async () => {
        try {
            if (!params?.userid) return;
            const response = await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/randomcard", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });

            if(response.data.length == 4){
                setUsercard_array((prevArray) => [...prevArray, response.data[0], response.data[2]]);
                setDealercard_array((prevArray) => [...prevArray, response.data[1], response.data[3]]);

                setFirstcard(true);

                userscoreref.current = response.data[0].cardnum + response.data[2].cardnum;
                dealerscoreref.current = response.data[1].cardnum + response.data[3].cardnum;

                user_card_ace.current = response.data[0].cardnum + response.data[2].cardnum;
                dealer_card_ace.current = response.data[1].cardnum + response.data[3].cardnum;

                if((response.data[1].cardnum == 1 || response.data[3].cardnum == 1) && (response.data[1].cardnum + response.data[3].cardnum >= 7 && response.data[1].cardnum + response.data[3].cardnum <= 11)){
                    dealerscoreref.current = dealerscoreref.current + 10;
                    dealer_card_ace.current = dealer_card_ace.current + 10;
                    console.log("딜러 스코어 +10 실행");
                }
            }

            const Toast_insurance = Swal.mixin({
                icon: 'error',
                title: '메인화면으로 돌아가시겠습니까?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '승인',
                cancelButtonText: '취소',
            });

            const Toast = Swal.mixin({
                toast: true, position: 'center-center', showConfirmButton: false,
                timer: 2000, timerProgressBar: true, width: 600,
                didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
            });

            if((response.data[0].cardnum == 10 && response.data[2].cardnum == 1 && dealerscoreref.current != 21) || (response.data[0].cardnum == 1 && response.data[2].cardnum == 10 && dealerscoreref.current != 21)){
                first_user_blackjack();
            }else if(response.data[1].insurance == 'insurance'){
                setTimeout(()=>{
                    Toast_insurance.fire({ icon: 'info', title: 'Insurance?' }).then(result => {
                        if(result.isConfirmed){
                            setIsinsurance(true);
                            if(response.data[1].cardnum == 10){
                                setIsFlipped(!isFlipped); cardflipaudio.play();
                                if(userscoreref.current === dealerscoreref.current) {
                                    userdraw();
                                    Toast.fire({ icon: 'info', title: 'User BlackJack!!  Dealer BlackJack!! ( push!! )' }).then(()=>{ urlmove('/Betting'); });
                                }else {
                                    userinsurancelose();
                                    Toast.fire({ icon: 'info', title: 'Dealer BlackJack!! ( You lose!! )' }).then(()=>{ urlmove('/Betting'); });
                                }
                            }else {
                                userinsurancelose_nobj();
                                Toast.fire({ icon: 'info', title: 'Dealer No BlackJack.' });
                                setTimeout(()=>{
                                    if(response.data[0].cardnum == response.data[2].cardnum && response.data[0].cardpattern == response.data[2].cardpattern && response.data[0].cardimg == response.data[2].cardimg){
                                        first_perfectpair();
                                    }
                                }, 3000);
                            }
                        }else {
                            if(response.data[1].cardnum == 10){
                                setIsFlipped(!isFlipped); cardflipaudio.play();
                                if(userscoreref.current === dealerscoreref.current) {
                                    userdraw();
                                    Toast.fire({ icon: 'info', title: 'User BlackJack!!  Dealer BlackJack!! ( push!! )' }).then(()=>{ urlmove('/Betting'); });
                                }else {
                                    Toast.fire({ icon: 'info', title: 'Dealer BlackJack!! ( You lose!! )' }).then(()=>{ urlmove('/Betting'); });
                                }
                            }else {
                                Toast.fire({ icon: 'info', title: 'Dealer No BlackJack.' });
                                setTimeout(()=>{
                                    if(response.data[0].cardnum == response.data[2].cardnum && response.data[0].cardpattern == response.data[2].cardpattern && response.data[0].cardimg == response.data[2].cardimg){
                                        first_perfectpair();
                                    }
                                }, 3000);
                            }
                        }
                    });
                }, 4000);
            }else if(response.data[3].cardnum == 10){
                setTimeout(()=>{
                    if(response.data[1].cardnum == 1){
                        setIsFlipped(!isFlipped); cardflipaudio.play();
                        if(userscoreref.current === dealerscoreref.current) {
                            userdraw();
                            Toast.fire({ icon: 'info', title: 'User BlackJack!!  Dealer BlackJack!! ( push!! )' }).then(()=>{ urlmove('/Betting'); });
                        }else {
                            Toast.fire({ icon: 'info', title: 'Dealer BlackJack!! ( You lose!! )' }).then(()=>{ urlmove('/Betting'); });
                        }
                    }else {
                        Toast.fire({ icon: 'info', title: 'Dealer No BlackJack.' });
                        setTimeout(()=>{
                            if(response.data[0].cardnum == response.data[2].cardnum && response.data[0].cardpattern == response.data[2].cardpattern && response.data[0].cardimg == response.data[2].cardimg){
                                first_perfectpair();
                            }
                        }, 3000);
                    }
                }, 4000);
            }
        } catch(err) {
          console.error(err);
        }
    }

    const handleHit = async () => {
        try {
            if (!params?.userid) return;
            const response = await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/hit", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });
            setUsercard_array((prevArray) => [...prevArray, response.data[0]]);
            userscoreref.current = userscoreref.current + response.data[0].cardnum;
            user_card_ace.current = user_card_ace.current + Number(usercard_array[usercard_array.length - 1].cardnum);
            setHitcard(!hitcard);
        } catch(err) { console.error(err); }
    }

    const handleStand = async () => {
        try {
            if (!params?.userid) return;
            const response = await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/stand", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });
            if(dealerscoreref.current >= 17 && dealerscoreref.current <= 20){
                setStandcard(!standcard);
            }else {
                setDealercard_array((prevArray) => [...prevArray, response.data[0]]);
                dealerscoreref.current = dealerscoreref.current + response.data[0].cardnum;
                dealer_card_ace.current = dealer_card_ace.current + Number(dealercard_array[dealercard_array.length - 1].cardnum);
                setStandcard(!standcard);
            }
        } catch(err) { console.error(err); }
    }

    const handleDoubledown = async () => {
        try {
            if (!params?.userid) return;
            const response = await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/doubledown", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });
            setUsercard_array((prevArray) => [...prevArray, response.data[0]]);
            userscoreref.current = userscoreref.current + response.data[0].cardnum;
            user_card_ace.current = user_card_ace.current + Number(usercard_array[usercard_array.length - 1].cardnum);
            setIsdoubledown(!isdoubledown);
            setHitcard(!hitcard);
        } catch(err) { console.error(err); }
    }

    const userwin = async () => {
        try {
            if (!params?.userid) return;
            await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userwin", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });
        } catch(err) { console.error(err); }
    }

    const userdoubledownwin = async () => {
        try {
            if (!params?.userid) return;
            await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userdoublewin", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });
        } catch(err) { console.error(err); }
    }

    const userdoubledownlose = async () => {
        try {
            if (!params?.userid) return;
            await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userdoublelose", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });
        } catch(err) { console.error(err); }
    }

    const userinsurancelose = async () => {
        try {
            if (!params?.userid) return;
            await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userinsurancelose", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });
        } catch(err) { console.error(err); }
    }

    const userinsurancelose_nobj = async () => {
        try {
            if (!params?.userid) return;
            await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userinsurancelosenobj", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: Number(params.betsmoney) / 2,
            });
        } catch(err) { console.error(err); }
    }

    const userdraw = async () => {
        try {
            if (!params?.userid) return;
            await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userdraw", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });
        } catch(err) { console.error(err); }
    }

    const userblackjack = async () => {
        try {
            if (!params?.userid) return;
            await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userblackjack", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
                betsmoney: params.betsmoney,
            });

            const Toast = Swal.mixin({
                toast: true, position: 'center-center', showConfirmButton: false,
                timer: 2000, timerProgressBar: true, width: 600,
                didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
            });

            setIsFlipped(!isFlipped); cardflipaudio.play();
            Toast.fire({ icon: 'info', title: 'User BlackJack!! (bets x 1.4)' }).then(()=>{ urlmove('/Betting'); });
        } catch(err) { console.error(err); }
    }

    // NEW: perfect pair 보상 처리
    const userperfectbet = async () => {
        try {
            if (!params?.userid) return;
            await Axios.post("https://port-0-black-jack-react-me8r4bj02dd23ef3.sel5.cloudtype.app/userperfectbet", {
                userid: params.userid,
                perfectbetsmoney: params.perfectbetsmoney,
            });
        } catch(err) { console.error(err); }
    }

    const history = createBrowserHistory();
    const preventGoBack = () => {
        history.push(null, '', history.location.href);
        const Toast = Swal.mixin({ width: 700 });
        Toast.fire({ icon: "error", title: "새로고침 혹은 뒤로가기가 감지되어 메인으로 돌아갑니다.", })
            .then(()=> { window.location.replace('/Black-jack-React'); });
    };

    useEffect(() => {
        const fadeTimer = setTimeout(()=>{ setFade('end') }, 100);
        return ()=>{ clearTimeout(fadeTimer); setFade(''); }
    }, []);

    useEffect(() => {
        if(params){ randomcard(); }
        else {
            const Toast = Swal.mixin({ width: 900 });
            Toast.fire({ icon: "error", title: "새로고침 혹은 뒤로가기가 감지되어 메인으로 돌아갑니다.", })
              .then(()=> { window.location.replace('/Black-jack-React'); });
        }
    }, [params]);

    useEffect(() => {
        (() => {
            history.push(null, '', history.location.href);
            window.addEventListener('popstate', preventGoBack);
        })();
        return () => window.removeEventListener('popstate', preventGoBack);
    }, []);

    useEffect(() => { history.push(null, '', history.location.href); }, [history.location]);

    const handleHomeClick = async () => {
        try {
            setUiDisabled(true);
            const res = await Swal.fire({
                icon: 'question',
                title: '메인화면으로 돌아가시겠습니까?',
                showCancelButton: true,
                confirmButtonText: '예',
                cancelButtonText: '아니요',
            });
            if (res.isConfirmed) {
                urlmove('/Black-jack-React');
            } else {
                setUiDisabled(false);
            }
        } catch (e) {
            console.error(e);
            setUiDisabled(false);
        }
    };

    useDidMountEffect(() => {
        const Toast = Swal.mixin({
            toast: true, position: 'center-center', showConfirmButton: false,
            timer: 2000, timerProgressBar: true, width: 600,
            didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
        });

        setTimeout(()=>{
            if(userscoreref.current > 21){
                setIsFlipped(!isFlipped); cardflipaudio.play();
                if(isdoubledown){
                    userdoubledownlose();
                    Toast.fire({ icon: 'info', title: 'User Bust!! - Doubledown  ( You lose!! )' }).then(()=>{ urlmove('/Betting'); });
                }else {
                    Toast.fire({ icon: 'info', title: 'User Bust!!  ( You lose!! )' }).then(()=>{ urlmove('/Betting'); });
                }
            }else if (userscoreref.current === 21 && usercard_array.length === 2){
                setIsFlipped(!isFlipped); cardflipaudio.play();
                if(userscoreref.current == dealerscoreref.current && usercard_array.length == dealercard_array.length){
                    userdraw();
                    Toast.fire({ icon: 'info', title: 'User BlackJack!!  Dealer BlackJack!! ( push!! )' }).then(()=>{ urlmove('/Betting'); });
                }else {
                    userwin();
                    Toast.fire({ icon: 'info', title: 'User BlackJack!! ( You win!! )' }).then(()=>{ urlmove('/Betting'); });
                }
            }else {
                if(isdoubledown){
                    setTimeout(()=>{ handleStand(); }, 500);
                }
            }
        }, 800); 
    }, [hitcard]);

    useEffect(() => { // 첫 4장 슬라이드
        const userInterval = setInterval(() => {
            if (count < (usercard_array.length + dealercard_array.length)) {
                if(count === 0){
                    const Toast = Swal.mixin({
                        toast: true, position: 'center-center', showConfirmButton: false,
                        timer: 6000, timerProgressBar: true, width: 600,
                    });
                    Toast.fire({ icon: 'info', title: 'Wait... The dealer is drawing cards.' });
                    setIsUserslide([true]);
                }else if(count === 1){
                    setIsDealerslide([true]);
                }else if(count === 2){
                    setIsUserslide((data) => [...data, true]);
                }else if(count === 3){
                    setIsDealerslide((data) => [...data, true]);
                    clearInterval(userInterval);
                }
                cardslideaudio.play();
                count++;
            }
        }, 800);
    }, [firstcard]);

    useDidMountEffect(() => { // 유저 hit 시 카드 애니메이션
        setTimeout(()=>{ setIsUserslide((data) => [...data, true]); }, 100);
        cardslideaudio.play();
    }, [hitcard]);

    useDidMountEffect(() => { // 딜러 카드 (stand 이후)
        const Toast = Swal.mixin({
            toast: true, position: 'center-center', showConfirmButton: false,
            timer: 2000, timerProgressBar: true, width: 800,
            didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
        });

        if(!isFlipped) { setIsFlipped(!isFlipped); cardflipaudio.play(); }

        setTimeout(()=>{ setIsDealerslide((data) => [...data, true]); cardslideaudio.play(); }, 800);

        setTimeout(()=>{
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
                    Toast.fire({ icon: 'info', title: 'Push..  (Draw)' }).then(()=>{ urlmove('/Betting'); });
                }else if (userscoreref.current > dealerscoreref.current) {
                    if(isdoubledown){
                        userdoubledownwin();
                        Toast.fire({ icon: 'info', title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' - Doubledown ( You win!! )' }).then(()=>{ urlmove('/Betting'); });
                    }else {
                        userwin();
                        Toast.fire({ icon: 'info', title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' ( You win!! )' }).then(()=>{ urlmove('/Betting'); });
                    }
                }else {
                    if(isdoubledown){
                        userdoubledownlose();
                        Toast.fire({ icon: 'info', title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' - Doubledown ( You lose!! )' }).then(()=>{ urlmove('/Betting'); });
                    }else {
                        Toast.fire({ icon: 'info', title: 'Dealer : ' + dealerscoreref.current + ', User : ' + userscoreref.current + ' ( You lose!! )' }).then(()=>{ urlmove('/Betting'); });
                    }
                }
            }else if(dealerscoreref.current > 21){
                if(isdoubledown){
                    userdoubledownwin();
                    Toast.fire({ icon: 'info', title: 'Dealer Bust!! - Doubledown  ( You win!! )' }).then(()=>{ urlmove('/Betting'); });
                }else {
                    userwin();
                    Toast.fire({ icon: 'info', title: 'Dealer Bust!!  ( You win!! )' }).then(()=>{ urlmove('/Betting'); });
                }
            }else if(dealerscoreref.current < 17){
                handleStand();
            }
        }, 1200);

        console.log("유저 카드 합계 : " + userscoreref.current);
        console.log("딜러 카드 합계 : " + dealerscoreref.current);
    }, [standcard]);

    return (
        <div className={"start " + fade}>
            <div className="tablediv">
                <img src={gametable} className='gametable' alt='gametable' />

                <div>
                    {dealercard_array.map((card, index) => {
                        let url = dealercard_array[index].cardimg;
                        if(index == 0){
                            return (
                                <div key={index} className={`flip-container ${isFlipped ? 'flip' : ''} ${isDealerslide[index] ? `slide-dealer` : ''}${index}`} >
                                    <div className="flipper">
                                        <div className="back">
                                            <img src={resolveCard(url)} alt="Front" className="testcard"/>
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
                                            <img src={resolveCard(url)} alt="Front" className="testcard"/>
                                        </div>
                                        <div className="back">
                                            <img src={nocard} alt="Back" className="testcard"/>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>

                <div>
                    {usercard_array.map((card, index) => {
                        const url = usercard_array[index].cardimg;
                        return (
                            <div key={index} className={`usercard1 ${isUserslide[index] ? `slide-player` : ''}${index}`}>
                                <img src={resolveCard(url)} className="testcard"/>
                            </div>
                        )
                    })}
                </div>

                <div className="cardstack">
                    <img src={cardstack} className="cardstack_img" alt="stack"></img>
                </div>

                <div className="gamebutton">
                    <button className="gbtn hit" disabled={isButtonDisabled || uiDisabled} onClick={async () => {  
                        if (standcard || isButtonDisabled || uiDisabled) return;
                        setIsButtonDisabled(true);
                        try { await handleHit(); } catch (error) { console.error(error); }
                        setTimeout(() => setIsButtonDisabled(false), 3500);
                    }}>Hit</button>

                    <button className="gbtn stay" disabled={isButtonDisabled || uiDisabled} onClick={async () => {
                        if(standcard || isButtonDisabled || uiDisabled) return;
                        setIsButtonDisabled(true);
                        try { await handleStand(); } catch (error) { console.error(error); }
                        setTimeout(() => setIsButtonDisabled(false), 3500);
                    }}>Stand</button>

                    <button className="gbtn doubledown" id="doubledown_btn" disabled={isButtonDisabled || uiDisabled} onClick={async () => {  
                        const Toast = Swal.mixin({
                            toast: true, position: 'center-center', showConfirmButton: false,
                            timer: 2000, timerProgressBar: true, width: 800,
                            didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
                        });
                        if (hitcard) {
                            Toast.fire({ icon: "error", title: "이미 Hit이나 Stand를 했기 때문에 DoubleDown을 하실 수 없습니다." });
                            return;
                        }
                        if(standcard || isButtonDisabled || uiDisabled) return;
                        if((params?.resultmoney ?? 0) >= (params?.betsmoney ?? 0)){
                            setIsButtonDisabled(true);
                            try { await handleDoubledown(); } catch (error) { console.error(error); }
                        }else {
                            Toast.fire({ icon: "error", title: "가진 금액이 부족해 DoubleDown을 할 수 없습니다." });
                        }
                    }}>Double Down</button>
                </div>

                {/* 금액 표시는 CACHED params 기준으로 렌더 → location.state 변화와 무관 */}
                <div className="perfectusermoney">Perfectbets Money : {params ? params.perfectbetsmoney : 0}</div>
                <div className="usermoney">Bets Money : {params ? params.betsmoney : 0} <span className={`${isdoubledown ? '' : 'boubledown_bets'}`}> * 2</span></div>
                <div className={`${isinsurance ? 'insurancemoney' : 'notinsurancemoney'}`}>Insurance Money : {isinsurance ? Number(params?.betsmoney || 0) / 2 : 0}</div>
            </div>
        </div>
    );
} 

export default Game;
