
import { useState, useEffect } from "react";
import { useToken } from '../Token';
import Spinner from "../Loading";
import UpdatePassword from "./UpdatePassword";

const MyProfile = () => {
    const { storedToken } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sucsess, setSucsess] = useState(false);
    const [userData, setUserData] = useState({
        user_id: '',
        username: '',
        email: '',
        name: '',
        description: '',
        password: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch('http://127.0.0.1:5000/get_user', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token: storedToken
                    })
                });
                const data = await result.json();

                if ('user_data' in data) {
                    const user_data = data.user_data
                    setUserData({
                        user_id: user_data.user_id,
                        username: user_data.username,
                        email: user_data.email,
                        name: user_data.name,
                        description: user_data.description || ''
                    });

                } else {
                    console.error('Error: No user_data key in the response');
                }

            } catch (error) {
                console.error('Error fetching data:', error);

            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setUserData({
            ...userData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const result = await fetch("http://127.0.0.1:5000/update_user", {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken,
                    user_id: userData.user_id,
                    username: userData.username,
                    email: userData.email,
                    name: userData.name,
                    description: userData.description,
                    password: userData.password
                })
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
                setSucsess(true);
            }

        } catch (error) {
            console.error('Error during fetch:', error);

        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="events-loading">
                <Spinner />
            </div>
        )
    } else if (userData) {
        return (
            <div className="update-data" >
                <div className="update-profile">
                    <form onSubmit={handleSubmit}>
                        <p> My Profile </p>
                        <label htmlFor="user_id">Your User ID:</label>
                        <input type="number" id="user_id" value={userData.user_id} disabled /><br />
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" value={userData.username} onChange={handleInputChange}
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,50}" required /><br />
                        <p>Username must include: number, upper and lowercase letters</p>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" value={userData.email}
                            maxLength='50' required onChange={handleInputChange} /><br />
                        <label htmlFor="name">Full Name:</label>
                        <input type="text" id="name" value={userData.name}
                            maxLength='100' required onChange={handleInputChange} /><br />
                        <label htmlFor="description">About Yourself:</label><br />
                        <textarea type="text" id="description" value={userData.description}
                            maxLength="1000" onChange={handleInputChange} /><br />

                        <label htmlFor="password">To Update Profile, Enter Password:</label><br />
                        <input type="password" id="password" value={userData.password} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,50}"
                            required onChange={handleInputChange} /><br />

                        <button type="submit" className="green-button"> Update Profile </button>
                    </form>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {sucsess &&
                        <div className="sucsess-message">
                            <p> Profile Update Sucsessfully </p>
                        </div>}
                </div>

                <UpdatePassword />

            </div >
        )
    } else {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        )
    }
}


export default MyProfile