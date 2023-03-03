import React, { useState, useRef, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { links, social } from './data.js';
import logo from "../headerimg/logo2.png";
import { Link as LinkRoll } from "react-scroll";
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  // 메뉴버튼 
  const [showLinks, setShowLinks] = useState(false);
  const linksContainerRef = useRef(null);
  const linksRef = useRef(null);
  const location = useLocation();

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

              if(location.pathname == "/Signin" || location.pathname == "/Createaccount" || location.pathname == "/Betting" || location.pathname == "/Game"){
                return (
                  <li key={id} style={{
                      margin: "30px",
                      marginLeft: "100px",
                  }}>
                    <Link to="/">{text}</Link>
                  </li>
                );
              }else {
                return (
                  <li key={id} style={{
                      margin: "30px",
                      marginLeft: "100px",
                  }}>
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