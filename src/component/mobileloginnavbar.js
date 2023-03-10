import React, { useState, useRef, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { loginlinks, loginsocial } from './loginokdata.js';
import logo from "../headerimg/logo2.png";
import { Link as LinkRoll } from "react-scroll";
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';


const Logoutbtn = () => {
  const Toast = Swal.mixin({
    width: 600,
  })

  Toast.fire({
    icon: "success",
    title: "정상적으로 로그아웃 되었습니다.",
  }).then(function(){
    sessionStorage.clear();
    window.location.replace('/Black-jack-React');
  });
}

const Loginnavbar = () => {
  // 메뉴버튼 
  const [showLinks, setShowLinks] = useState(false);
  const linksContainerRef = useRef(null);
  const linksRef = useRef(null);
  const location = useLocation();
  const urlmove = useNavigate();

  const toggleLinks = () => {
    setShowLinks(!showLinks);
  };

  useEffect(() => {
    const linksHeight = linksRef.current.getBoundingClientRect().height;
    if (showLinks) {
      linksContainerRef.current.style.height = `${linksHeight}px`;
    } else {
      linksContainerRef.current.style.height = '0px';
    }
  }, [showLinks]);

  return (
    <nav>
      <div className='nav-center'>
        <div className='nav-header'>
          <img src={logo} className='logo' alt='logo' />
          <button className='nav-toggle' onClick={toggleLinks}>
            <FaBars />
          </button>
        </div>
        <div className='links-container' ref={linksContainerRef} >
          <ul className='links' ref={linksRef}>
            {/* data에서 Nav목록 가져오기 */}
            {loginlinks.map((link) => {
              const { id, url, text } = link;

              if(location.pathname == "/logout" || location.pathname == "/Betting" || location.pathname == "/Game"){
                return (
                  <li key={id} className="navbar_link">
                    <Link onClick={() => {
                      const Toast = Swal.mixin({
                        width: 500,
                      })
    
                      Toast.fire({
                        icon: 'error',
                        title: '메인화면으로 돌아가시겠습니까?',
                        showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
                        confirmButtonColor: '#3085d6', // confrim 버튼 색깔 지정
                        cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
                        confirmButtonText: '승인', // confirm 버튼 텍스트 지정
                        cancelButtonText: '취소', // cancel 버튼 텍스트 지정
                      }).then(result => {
                        if (result.isConfirmed) { // 만약 모달창에서 confirm 버튼을 눌렀다면
                          urlmove('/Black-jack-React');
                        }
                     });
                    }}>{text}</Link>
                  </li>
                );
              }else {
                return (
                  <li key={id} className="navbar_link">
                    <LinkRoll activeClass="active" smooth spy to={text}>
                      <div>{text}</div>
                    </LinkRoll>
                  </li>
                );
              }
            })}
            <div className='userinfo'>"{sessionStorage.getItem("name")}" 님 환영합니다.</div>
            {loginsocial.map((socialIcon) => {
              const { id, url, text } = socialIcon;
              return (
                <li key={id}>
                  <div className="frame">
                  <button className="custom-btn" style={{
                    fontSize: '13px',
                    color: 'black',
                    lineHeight: '45px',
                    height: '100%',
                  }} onClick={Logoutbtn}>{text}</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Loginnavbar;