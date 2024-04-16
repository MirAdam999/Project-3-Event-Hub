
import { useState, useRef } from "react";
import { useToken } from '../Token';
import { useURL } from "../URL";
import '../../style/main/Profile.css'

const UpdatePassword = () => {
    const { storedURL } = useURL();
    const { storedToken } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const [sucsess, setSucsess] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const password = useRef();
    const newPassword = useRef();
    const repeatNewPassword = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.current.value !== repeatNewPassword.current.value) {
            setPasswordsMatch(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("token", storedToken);
            formData.append("password", password.current.value);
            formData.append("new_password", newPassword.current.value);

            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            const result = await fetch(`${storedURL}/change_password`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formDataObject)
            });

            if (!result.ok) {
                const data = await result.json();

                if (data.error) {
                    console.error('Error from backend:', data.error);
                    setErrorMessage(data.error);

                } else {
                    throw new Error(`HTTP error! Status: ${result.status}`);
                }

            } else {
                setSucsess(true)
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    };


    return (
        <div className="update-password">
            <p id='update-header'>Update Password</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="password">Enter Old Password:</label><br />
                <input type="password" id="password" ref={password} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,50}" required /><br />

                <label htmlFor="new-password">New Password:</label><br />
                <input type="password" id="new-password" ref={newPassword} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,50}" required /><br />
                <p id='pass-must-include'>Password must include: number, upper and lowercase letters</p>
                <label htmlFor="repeat-new-password">Repeat New Password:</label><br />
                <input type="password" id="repeat-new-password" ref={repeatNewPassword} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,50}" required /><br />
                {!passwordsMatch && <p className="error-message">Passwords do not match</p>}

                <div className='update-pass-button-container'><button className='update-pass-button' type="submit"> Change Password </button></div>
            </form>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {sucsess &&
                <div className="update-sucsess-message">
                    <p> Password Updated Sucsessfully </p>
                </div>}

        </div>
    )
}


export default UpdatePassword