
import { useRef, useState } from "react";
import { useToken } from "./Token";
import { useURL } from "./URL";
import '../style/Pop-Up.css';

const LoginPopUp = (props) => {
    const { storedURL } = useURL();
    const username = useRef();
    const password = useRef();
    const { setToken, setName, setIsMasterPermission, setId } = useToken();
    const [errorMessage, setErrorMessage] = useState('');

    function openSignUp() {
        props.onClickSignUp()
        props.onClose()
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const result = await fetch(`${storedURL}/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username.current.value,
                    password: password.current.value
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
                const data = await result.json();
                const receivedToken = data.front_end_token;
                const receivedId = data.user_id;
                const receivedName = data.users_name;
                const recevedMasterPrem = data.is_master;
                setToken(receivedToken);
                setId(receivedId);
                setName(receivedName);
                setIsMasterPermission(recevedMasterPrem);
                props.onClose();
                e.target.reset();
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    };

    return (
        <div className="popup">
            <div className="popup-inner">
                <div className="login">
                    <form className="login-form" onSubmit={handleLogin}>
                        <p id='log-header' >Login</p>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" ref={username} required />
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" ref={password} required />

                        <button className="login-button" type="submit"> Log In </button>
                    </form>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
                <div className="signup">
                    <p id='log-header'>New to EventHub?</p>
                    <button className="go-to-signup-button" onClick={openSignUp}> Sign Up !</button>
                    <div id='demo-users'>
                        <p >Demo Users:</p>
                        <table>
                            <thead>
                                <th>Username</th>
                                <th >Password</th>
                                <th>User Type</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>User444</td>
                                    <td id='border-eventhub'>password4</td>
                                    <td>Admin</td>
                                </tr>
                                <tr>
                                    <td>user9</td>
                                    <td id='border-eventhub'>password9</td>
                                    <td>Regular</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="close"><button onClick={props.onClose}>X</button></div>
            </div>
        </div >
    )
}

export default LoginPopUp