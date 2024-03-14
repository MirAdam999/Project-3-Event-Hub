
import '@fortawesome/fontawesome-free/css/all.css';
import { useState, useEffect } from "react";
import { useToken } from "./Token";

const Sidebar = (props) => {
    const { storedToken, usersName, isMasterUser } = useToken();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!storedToken); // Set isLoggedIn to true if token exists, otherwise false
        console.log(storedToken)
    }, [storedToken]);

    return (
        <div className="sidebar">
            <div className="sidebar-inner">
                {isLoggedIn ? (
                    <div>
                        <div className="sidebar-top">
                            <div><p>Welcome</p>
                                <p>{usersName}!</p></div>
                            <div id="close-sidebar"><button onClick={props.onClose}>X</button></div>
                        </div>
                        <div className="sidebar-buttons">
                            <div className="sidebar-buttons-wrapper">
                                <button onClick={() => { props.onChangeMainComp('search_event'); props.onClose(); }}> <i class="fa-solid fa-magnifying-glass"></i> Search Event </button>
                                <button onClick={() => { props.onChangeMainComp('add_event'); props.onClose(); }}><i class="fa-solid fa-plus"></i> Add Event </button>
                                <button onClick={() => { props.onChangeMainComp('my_events'); props.onClose(); }}><i class="fa-solid fa-calendar-days"></i> My Events </button>
                            </div>
                            <div className="sidebar-buttons-wrapper">
                                <button><i class="fa-solid fa-pen-to-square"></i> My Registrations </button>
                                <button><i class="fa-solid fa-gift"></i> Attended Events </button>
                            </div>
                            <div className="sidebar-buttons-wrapper">
                                <button><i class="fa-solid fa-user"></i> My Profile </button>
                                <button onClick={() => { props.onLogOut(); props.onClose(); }}><i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out </button>
                            </div>
                            {isMasterUser ? (
                                <div className='sidebar-buttons-wrapper'>
                                    <button onClick={() => { props.onChangeMainComp('all_events'); props.onClose(); }}><i class="fa-solid fa-globe"></i> Show All Events </button>
                                    <button> <i class="fa-solid fa-list-check"></i> Category Managment </button>
                                    <button><i class="fa-solid fa-people-roof"></i> Users Managment </button>
                                    <button><i class="fa-solid fa-user-shield"></i> Admins Managment </button>
                                </div>
                            ) : (null)}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="sidebar-top">
                            <div><p>Hello Guest!</p></div>
                            <div id="close-sidebar"><button onClick={props.onClose}>X</button></div>
                        </div>
                        <div className="sidebar-buttons">
                            <div className="sidebar-buttons-wrapper">
                                <button onClick={() => { props.onChangeMainComp('search_event'); props.onClose(); }}> <i class="fa-solid fa-magnifying-glass"></i> Search Event </button>
                            </div>
                            <div className="sidebar-buttons-wrapper">
                                <button onClick={() => { props.onLogIn(); props.onClose(); }}> <i class="fa-solid fa-right-to-bracket"></i> Log In </button>
                                <button onClick={() => { props.onSignUp(); props.onClose(); }}> <i class="fa-solid fa-user-plus"></i> Sign Up </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}

export default Sidebar