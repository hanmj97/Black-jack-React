import Axios from "axios";
import Header from "./component/header.js"
import Footer from "./component/footer.js";

const submitTest = () => {
    Axios.get("http://localhost:8000/", {}).then(() => {
        alert("등록 완료!");                                  //서버 8000과 통신하여 쿼리문 실행 후 완료되면 알림창뜸
    });
};

function App() {
  return (
    <div className="App">
      <Header></Header>
      <Footer></Footer>
    </div>
  );
}

export default App;
