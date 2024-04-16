
import { useRef } from "react";
import { useState } from "react";
import { useURL } from "./URL";
import '../style/Pop-Up.css';

const SignUpPopUp = (props) => {
    const username = useRef();
    const password = useRef();
    const repeatPassword = useRef();
    const email = useRef();
    const name = useRef();
    const description = useRef();
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [sucsess, setSucsess] = useState(false);
    const { storedURL } = useURL();

    function goToLogin() {
        props.onClose();
        props.onOpenLogin();
    }

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password.current.value !== repeatPassword.current.value) {
            setPasswordsMatch(false);
            return;
        }

        try {
            const result = await fetch(`${storedURL}/signup`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username.current.value,
                    password: password.current.value,
                    email: email.current.value,
                    name: name.current.value,
                    description: description.current.value
                })
            });

            if (!result.ok) {
                const data = await result.json();

                if (data.error) {
                    console.error('Error from backend:', data.error);
                    setErrorMessage(data.error);
                }
                else {
                    throw new Error(`HTTP error! Status: ${result.status}`);
                }
            }
            else {
                e.target.reset();
                setSucsess(true);
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    };

    return (
        <div className="popup">
            <div className="popup-inner">
                <div className="signup-form" >
                    <p id='signup-header'>Sign Up To EventHub</p>
                    <form onSubmit={handleSignUp}>
                        <div className="signup-both">
                            <div className="signup-l">
                                <label htmlFor="username">Username:</label><br />
                                <input type="text" id="username" ref={username} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,50}" required /><br />
                                <p id='pass-must-include' >Username must include: number, upper and lowercase letters</p>
                                <label htmlFor="password">Password:</label><br />
                                <input type="password" id="password" ref={password} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,50}" required /><br />
                                <p id='username-must-include'>Password must include: number, upper and lowercase letters</p>
                                <label htmlFor="repeat-password">Repeat Password:</label><br />
                                <input type="password" id="repeat-password" ref={repeatPassword} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,50}" required /><br />
                                {!passwordsMatch && <p className="error-message">Passwords do not match</p>}
                                <label htmlFor="email">Email:</label><br />
                                <input type="email" id="email" ref={email} maxLength="50" required /><br />
                            </div>

                            <div className="signup-r">
                                <label htmlFor="name">Full Name:</label><br />
                                <input type="text" id="name" ref={name} maxLength="100" required /><br />
                                <label htmlFor="sign-up-description">About Yourself:</label><br />
                                <textarea type="text" id="sign-up-description" ref={description} maxLength="1000" cols="68" rows="10" /><br />

                                <button className="signup-button" type="submit"> Sign Up</button>

                                {errorMessage && <p className="error-message">{errorMessage}</p>}
                                {sucsess &&
                                    <div className="signup-sucsess">
                                        <p id='signup-sucsess-top' >Welcome to EventHub!</p>
                                        <p>Your Sign Up has been sucsessful. Please proceed to Log In:</p>
                                        <button className="go-to-log-in-button" onClick={goToLogin}> Log In </button>
                                    </div>}

                            </div>
                        </div>

                    </form>
                </div>
                <div className="close"><button onClick={props.onClose}>X</button></div>
            </div >
        </div>
    )
}

export default SignUpPopUp