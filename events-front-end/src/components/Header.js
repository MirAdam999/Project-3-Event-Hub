
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from './Token';
import '../style/Header.css';

const Header = (props) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { storedToken } = useToken();
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };


    useEffect(() => {
        if (storedToken != null) {
            setIsLoggedIn(true)
        }
        else {
            setIsLoggedIn(false)
        }
    }, [storedToken]);

    return (
        <div className="header">
            <div id='logo' onClick={() => handleNavigation('/')}>
                <h1> EventHub </h1>
            </div>
            <div className='header-elements'>
                {isLoggedIn ? (
                    <div className="header-buttons">
                        <button className="header-button" id='log-out-header' onClick={props.onLogOut}> Log Out </button>
                    </div>
                ) : (
                    <div className="header-buttons">
                        <button className="header-button" id='log-in-header' onClick={props.onLogIn}> Login <i class="fa-solid fa-right-to-bracket"></i></button>
                        <button className="header-button" id='sign-up-header' onClick={props.onSignUp}> Sign Up </button>
                    </div>
                )}

                <div className="header-buttons" id='open-sidebar'><button onClick={props.openSidebar}><i class="fa-solid fa-bars"></i> Menu </button></div>

            </div>
        </div>
    )
}

export default Header