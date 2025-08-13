import React, { useState, useRef, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { links, social } from './data.js';
import logo from "../headerimg/logo2.png";
import { Link as LinkRoll } from "react-scroll";
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const Navbar = () => {
  // 메뉴버튼 
  const [showLinks, setShowLinks] = useState(false);
  const linksContainerRef = useRef(null);
  const linksRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleLinks = () => {
    setShowLinks(!showLinks);
  };
  useEffect(() => {
    const linksHeight = 215;      //linksRef.current.getBoundingClientRect().height;
    if (showLinks) {
      linksContainerRef.current.style.height = `${linksHeight}px`;
    } else {
      linksContainerRef.current.style.height = '0px';
    }
  }, [showLinks]);

  const isBlockingPath = (path) =>
    path === "/Signin" || path === "/Createaccount" || path === "/Betting" || path === "/Game";

  const confirmGoHome = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const res = await Swal.fire({
      icon: 'question',
      title: '메인화면으로 돌아가시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니요',
    });
    if (res.isConfirmed) {
      navigate('/Black-jack-React');
    }
  };

  return (
    <nav>
      <div className='nav-center'>
        <div className='nav-header'>
          <img src={logo} className='logo' alt='logo' />
          <button className='nav-toggle' onClick={toggleLinks}>
            <FaBars />
          </button>
        </div>
        <div className='links-container' ref={linksContainerRef}>
          <ul className='links' ref={linksRef}>
            {/* data에서 Nav목록 가져오기 */}
            {links.map((link) => {
              const { id, url, text } = link;

              if(isBlockingPath(location.pathname)){
                // 게임/베팅 화면 등에서는 Home만 확인 모달로 처리 (절대 즉시 라우팅 금지)
                if (text === 'Home') {
                  return (
                    <li key={id} className="navbar_link">
                      <button
                        type="button"
                        className="link-like"
                        onClick={confirmGoHome}
                        style={{ background:'none', border:'none', padding:0, margin:0, cursor:'pointer', font:'inherit', color:'inherit' }}
                        aria-label="Go Home"
                      >
                        {text}
                      </button>
                    </li>
                  );
                }
                // 나머지는 기존 동작 유지 (필요 시 동일한 확인 로직으로 확장 가능)
                return (
                  <li key={id} className="navbar_link">
                    <Link to="/Black-jack-React">{text}</Link>
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
          </ul>
        </div>

        <ul className='social-icons'>
          {social.map((socialIcon) => {
            const { id, url, text } = socialIcon;
            return (
              <li key={id}>
                <div className="frame">
                <button className="custom-btn"><Link to={url} style={{
                  display: 'block',
                  fontSize: '13px',
                  color: 'black',
                  lineHeight: '45px',
                  height: '100%',
                }}>{text}</Link></button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;