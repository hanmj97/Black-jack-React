import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faBlog } from "@fortawesome/free-solid-svg-icons";
import { faInstagramSquare } from "@fortawesome/free-brands-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import backgroundsound from '../soundeffect/backgroundsound.mp3';
import AudioPlayer from 'react-h5-audio-player';
import { useLocation } from 'react-router-dom';
import React, { useEffect, useRef } from "react";

export default function Footer() {
    const location = useLocation();
    const audioRef = useRef(null);

    useEffect(() => {
        if (location.pathname === "/Betting" || location.pathname === "/Game") {
            audioRef.current.audio.current.play();
        }else {
            audioRef.current.audio.current.pause();
        }
    }, [location.pathname]);

    return (
        <>
            <footer>
                <div className={`backsoundbar${location.pathname == "/Betting" || location.pathname == "/Game" ? '' : 'none'}`}>
                    <AudioPlayer /* autoPlay */ src={backgroundsound} loop={true} volume={0.1} ref={audioRef}
                        // other props here
                    />
                </div>

                <div className="footer-content">
                    <h3>Black-Jack Game</h3>
                    <p>This page is a blackjack game page that I made using REACT because I was bored. The source code on this page can be found in the Github link below.</p>
                    <ul className="socials">
                        <li><a href="/"><FontAwesomeIcon icon={faGamepad} size="2x"/></a></li>
                        <li><a href="/"><FontAwesomeIcon icon={faHouse} size="2x"/></a></li>
                        <li><a href="https://blog.naver.com/hanmj97" target="_blank"><FontAwesomeIcon icon={faBlog} size="2x"/></a></li>
                        <li><a href="https://instagram.com/hmj_97_?igshid=Zjc2ZTc4Nzk=" target="_blank"><FontAwesomeIcon icon={faInstagramSquare} size="2x"/></a></li>
                        <li><a href="https://github.com/hanmj97/Black-jack-React" target="_blank"><FontAwesomeIcon icon={faGithub} size="2x"/></a></li>
                    </ul>
                </div>
            </footer>
        </>
    );
}