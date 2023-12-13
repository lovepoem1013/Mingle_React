import "./App.css";

//컴포넌트 요소
import Header from "./components/Header/Header";
import MemberLogin from "./pages/MemberLogin/MemberLogin";
import Footer from "./components/Footer/Footer";
import Main from "./pages/Main/Main";
import Denied from "./components/Denied/Denied";
import PartyCreate from "./pages/PartyCreate/PartyCreateMain";

import { createContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 관리자
import AdminMain from './pages/AdminMain/AdminMain';
import DetailMemberManage from "./pages/AdminMain/pages/DetailMemberManage/DetailMemberManage";
import DetailReportParty from './pages/AdminMain/pages/DetailMemberManage/pages/DetailReportParty/DetailReportParty';
import ReportReadForm from "./pages/AdminMain/pages/ReportReadForm/ReportReadForm";

export const MenuContext = createContext();
export const LoginContext = createContext();

function App() {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loginId, setLoginId] = useState("");
  const [loginNick, setLoginNick] = useState("");

  return (
    <LoginContext.Provider
      value={{ loginId, setLoginId, loginNick, setLoginNick }}
    >
      <MenuContext.Provider value={{ selectedMenu, setSelectedMenu }}>
        <>
          <Router>
            <Header></Header>

            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/login/*" element={<MemberLogin />}></Route>
              <Route path="/party/*" element={<PartyCreate />}></Route>
              <Route path="/denied" element={<Denied />}></Route>

              {/* 관리자 */}
              <Route path="/admin" element={<AdminMain />}/>
              <Route path="/admin/ReportReadForm" element={<ReportReadForm />}/>
              <Route path="/admin/DetailMemberManage" element={<DetailMemberManage />}/>
              <Route path="/admin/DetailMemberManage/DetailReportParty" element={<DetailReportParty />}/>
            </Routes>
            <Footer></Footer>
          </Router>
        </>
      </MenuContext.Provider>
    </LoginContext.Provider>
  );
}

export default App;
