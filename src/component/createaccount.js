import React, { useEffect, useRef, useState } from 'react';
import Axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const Container = () => {  
    const [formClass, setFormClass] = useState("");
    const loginidRef = useRef();
    const loginpwRef = useRef();
    const nameRef = useRef();
    const idRef = useRef();
    const pwRef = useRef();
    const urlmove = useNavigate();

    useEffect(()=>{
        setFormClass("right-panel-active");
    });

    const click_signInBtn = () => {
        setFormClass("");
    };
      
    const click_signUpBtn = () => {
        setFormClass("right-panel-active");
    };

    const signup = () => {
        if (nameRef.current.value === "" || nameRef.current.value === undefined) {
            Swal.fire({
                icon: "warning",
                text: "이름을 입력해주세요.",
            });
            nameRef.current.focus();
            return false;
        }
        if (idRef.current.value === "" || idRef.current.value === undefined) {
            Swal.fire({
                icon: "warning",
                text: "사용할 아이디를 입력해주세요.",
            });
            idRef.current.focus();
            return false;
        }
        if (pwRef.current.value === "" || pwRef.current.value === undefined) {
            Swal.fire({
                icon: "warning",
                text: "사용할 비밀번호를 입력해주세요.",
            });
            pwRef.current.focus();
            return false;
        }


        Axios.post("http://localhost:8000/signup", {
            name: nameRef.current.value,
            id: idRef.current.value,
            pw: pwRef.current.value,
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


    const signin = () => {
        if (loginidRef.current.value === "" || loginidRef.current.value === undefined) {
            Swal.fire({
                icon: "warning",
                text: "아이디를 입력해주세요.",
            });
            loginidRef.current.focus();
            return false;
        }
        if (loginpwRef.current.value === "" || loginpwRef.current.value === undefined) {
            Swal.fire({
                icon: "warning",
                text: "비밀번호를 입력해주세요.",
            });
            loginpwRef.current.focus();
            return false;
        }


        Axios.post("http://localhost:8000/signin", {
            id: loginidRef.current.value,
            pw: loginpwRef.current.value,
        }).then((res) => {
            console.log(res.data);
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
                    title: '정상적으로 로그인 되었습니다.',
                }).then(function(){
                    sessionStorage.setItem("id", loginidRef.current.value);
                    sessionStorage.setItem("name", res.data.username);
                    sessionStorage.setItem("chip", res.data.usermoney);
                    window.location.replace("/");
                });

            }else {
                Swal.fire({
                    icon: "error",
                    title: "로그인 실패",
                    text: "입력하신 아이디 혹은 비밀번호를 확인해주세요.",
                });
            }
        }).catch((e) => {
            console.error(e);
        });
    }

    let [fade, setFade] = useState('')

    useEffect(()=>{
        // tab의 상태가 변할때 (클릭 후 다른탭 열리면) 0.1초 뒤 'end' className 바인딩
        const fadeTimer = setTimeout(()=>{ setFade('end') }, 100)
        return ()=>{
            // 기존 fadeTimer 제거 후 class 빈 값으로 변경
            clearTimeout(fadeTimer);
  	        setFade('')
        }
    }, [])


    return (
        <div className={"signin_body start " + fade}>
        <div className={`container ${formClass}`}>
            <div className="container__form container--signup">
                <form action="#" className="form" id="form1" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <h2 className="form__title">Sign Up</h2>
                    <input type="text" placeholder="User" className="input" ref={nameRef}/>
                    <input type="text" placeholder="ID" className="input" ref={idRef}/>
                    <input type="password" placeholder="Password" className="input" ref={pwRef}/>
                    <button className="btn" onClick={signup}>Sign Up</button>
                </form>
            </div>

            <div className="container__form container--signin">
                <form action="#" className="form" id="form2" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <h2 className="form__title">Sign In</h2>
                    <input type="text" placeholder="ID" className="input" ref={loginidRef}/>
                    <input type="password" placeholder="Password" className="input" ref={loginpwRef}/>
                    <a href="#" className="link">Forgot your password?</a>
                    <button className="btn" onClick={signin}>Sign In</button>
                </form>
            </div>

            <div className="container__overlay">
                <div className="overlay">
                    <div className="overlay__panel overlay--left">
                        <button className="btn" id="signIn" onClick={click_signInBtn}>Sign In</button>
                    </div>
                    <div className="overlay__panel overlay--right">
                        <button className="btn" id="signUp" onClick={click_signUpBtn}>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default Container;