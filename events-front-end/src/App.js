
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './style/App.css';
import './style/Backround.css'
import { TokenProvider } from './components/Token';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar'
import LoginPopUp from './components/LogIn';
import SignUpPopUp from './components/SignUp';
import LogOutPopUp from './components/LogOut';
import Main from './components/Main';
import LandingPage from './components/main_comps/Home';
import MyEvents from './components/main_comps/MyEvents';
import AddEvent from './components/main_comps/AddEvent';
import AllEvents from "./components/main_comps/master_comps/AllEvents";
import SearchEvent from "./components/main_comps/SearchEvent";
import ViewEvent from './components/main_comps/event_comps/ViewEvent';
import ViewUser from './components/main_comps/ViewUser';
import MyRegistrations from "./components/main_comps/MyRegistr";
import AttendedEvents from "./components/main_comps/Attended";
import MyProfile from "./components/main_comps/MyProfile";
import UsersMangment from "./components/main_comps/master_comps/Users";
import AdminsMangment from "./components/main_comps/master_comps/Admins";
import CategoriesMangment from "./components/main_comps/master_comps/Categories";

function App() {
  const [sidebarIsOpen, setSIdebarIsOpen] = useState(false);
  const [logInIsOpen, setLogInIsOpen] = useState(false)
  const [signUpPopUpIsOpen, setsignUpPopUpIsOpen] = useState(false);
  const [logOutIsOpen, setLogOutIsOpen] = useState(false);

  function openSidebar() {
    setSIdebarIsOpen(true);
  }

  function closeSidebar() {
    setSIdebarIsOpen(false);
  }

  function openLogIn() {
    setLogInIsOpen(true);
  }

  function closeLogIn() {
    setLogInIsOpen(false);
  }

  function openSignUp() {
    setsignUpPopUpIsOpen(true);
  }

  function closeSignUp() {
    setsignUpPopUpIsOpen(false);
  }

  function openLogOut() {
    setLogOutIsOpen(true);
  }

  function closeLogOut() {
    setLogOutIsOpen(false);
  }

  return (
    <TokenProvider>
      <div className="App">
        <div className="backround"></div>

        <Header onLogOut={openLogOut} onSignUp={openSignUp} onLogIn={openLogIn} openSidebar={openSidebar} />

        {sidebarIsOpen && <Sidebar onClose={closeSidebar} onLogOut={openLogOut} onSignUp={openSignUp} onLogIn={openLogIn} />}
        {signUpPopUpIsOpen && <SignUpPopUp onClose={closeSignUp} onOpenLogin={openLogIn} />}
        {logInIsOpen && <LoginPopUp onClose={closeLogIn} onClickSignUp={openSignUp} />}
        {logOutIsOpen && <LogOutPopUp onClose={closeLogOut} />}

        <Main />

        <Routes>

          {/* Unlogged */}
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/search_event" element={<SearchEvent />} />
          <Route path="/view_event/:event_id" element={<ViewEvent onLogIn={openLogIn} />} />
          <Route path="/user/:user_id" element={<ViewUser />} />
          {/* User */}
          <Route path="/my_events" element={<MyEvents />} />
          <Route path="/add_event" element={<AddEvent />} />
          <Route path="/my_registrations" element={<MyRegistrations />} />
          <Route path="/attended" element={<AttendedEvents />} />
          <Route path="/my_profile" element={<MyProfile />} />
          {/* Admin */}
          <Route path="/all_events" element={<AllEvents />} />
          <Route path="/categories" element={<CategoriesMangment />} />
          <Route path="/users" element={<UsersMangment />} />
          <Route path="/admins" element={<AdminsMangment />} />

        </Routes>

        <Footer />

      </div>
    </TokenProvider>
  );
}

export default App;
