import Logoimg from "../headerimg/Blackjack-hands-cards.png";
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";

export default function Header(props) {
    return (
        <>
        <div className="wrapper01"></div>
        <div className="content01">
            <section className="section01" id="Rules">
            <div className="rules-title">Blackjack Game Rules</div>
                <div className="rules-area01">
                    <div className="rules-name">Hit</div>
                    <div className="rules-value">플레이어가 처음 두 장의 카드 외에 딜러에게 추가카드를 요청하는 경우를 말합니다.</div>
                </div>
                <div className="rules-area01">
                    <div className="rules-name">Stay</div>
                    <div className="rules-value">플레이어가 추가 카드를 원하지 않을 경우를 말하며, 딜러는 카드의 합이 17 이상이면 추가 카드를 받을 수 없습니다.</div>
                </div>
                <div className="rules-area01">
                    <div className="rules-name">Doubledown</div>
                    <div className="rules-value">플레이어의 요청 시 한 장의 추가 카드만 받는다는 조건으로 플레이어의 현재 베팅 금액만큼의 추가 베팅을 더 할 수 있습니다.</div>
                </div>
                <div className="rules-area01">
                    <div className="rules-name">Bust</div>
                    <div className="rules-value">카드 합이 21을 초과하면 베팅 금액을 잃게 됩니다.</div>
                </div>
                <div className="rules-area01">
                    <div className="rules-name">Insurance</div>
                    <div className="rules-value">딜러의 오픈 카드가 Ace일 경우 플레이어는 베팅액의 1/2의 보험금을 걸 수 있습니다.<br></br># 딜러가 블랙잭인 경우 : 보험금의 두 배를 돌려받습니다.<br></br># 딜러가 블랙잭이 아닐 경우 : 보험금을 잃게 됩니다.</div>
                </div>
                <div className="rules-area01">
                    <div className="rules-name">Push</div>
                    <div className="rules-value">플레이어와 딜러의 각각의 카드 합이 같을 경우 서로 비기게 됩니다. (베팅한 금액을 돌려 받습니다.)</div>
                </div>
                <div className="rules-area02">
                    <div className="rules-name">Blackjack</div>
                    <div className="rules-value">처음 두 장의 카드 합이 21일 경우를 말하며 베팅 금액의 1.4배의 금액을 받습니다.</div>
                </div>
            </section>
        </div>
        <div className="wrapper02"></div>
        <div className="content02">
            <section className="section02" id="Game">
                <div className="gamebutton-area">
                    <button className="gamebtn">
                        {   
                            sessionStorage.length === 2 ? 
                            <Link to="/Signin"><span style={{color: "white"}}>Blackjack - Game Start !!</span></Link> : 
                            <Link to="/Betting"><span style={{color: "white"}}>Blackjack - Game Start !!</span></Link>
                        }
                    </button>
                </div>
            </section>
        </div>
        </>
    );
}