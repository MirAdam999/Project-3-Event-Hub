
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import SearchUser from "./SearchUser";
import AllUsers from "./AllUser";

const UsersMangment = () => {
    const { storedToken } = useToken();
    const { usersId } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [userUpdate, setUserUpdate] = useState(null)
    const [showAll, setShow] = useState(true)
    const [searched, setSearched] = useState(false)
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
    }, [users, userUpdate])

    const disableUser = async (user) => {
        try {
            const result = await fetch(`http://127.0.0.1:5000/disactivate_user/${user.user_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken
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
                setUserUpdate(
                    {
                        user_id: user.user_id,
                        name: user.name,
                        action: 'Disactivated'
                    });
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }

    const enableUser = async (user) => {
        try {
            const result = await fetch(`http://127.0.0.1:5000/activate_user/${user.user_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken
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
                setUserUpdate(
                    {
                        user_id: user.user_id,
                        name: user.name,
                        action: 'Activated'
                    });
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }

    return (
        <div className="users">
            < AllUsers setUsers={setUsers}
                userUpdate={userUpdate}
                setErrorMessage={setErrorMessage}
                showAll={showAll} setShow={setShow}
                setSearched={setSearched} />

            <div className="users-top">
                < SearchUser setUsers={setUsers}
                    setErrorMessage={setErrorMessage}
                    setSearched={setSearched} />
                <button onClick={() => setShow(true)}> Show All Users </button>
                {userUpdate && <div className="users-message">
                    <p> User ID {userUpdate.user_id}, Name {userUpdate.name}, has been {userUpdate.action}</p>
                </div>}</div>

            {users &&
                <div className="users-display">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Full Name</th>
                                <th>Created At</th>
                                <th>Status</th>
                                <th>Permissions</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.user_id} className="table">
                                    <td><button onClick={() => handleNavigation(`/user/${user.user_id}`)}>{user.user_id}</button></td>
                                    <td><button onClick={() => handleNavigation(`/user/${user.user_id}`)}>{user.username}</button></td>
                                    <td >{user.email}</td>
                                    <td><button onClick={() => handleNavigation(`/user/${user.user_id}`)}>{user.name}</button></td>
                                    <td>{user.created}</td>
                                    <td>{user.is_active}</td>
                                    <td>{user.is_master}</td>
                                    <td>{user.is_active === 'Active' ?
                                        (user.user_id === usersId ? (<button disabled> Disactivate </button>)
                                            : (<button onClick={() => disableUser(user)}> Disactivate </button>))
                                        : (<button onClick={() => enableUser(user)}> Activate </button>)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}

            {searched && !users &&
                <div className="none-found">
                    No Users Meeting Search Found</div>}

            {errorMessage &&
                <p className="error-message">{errorMessage}</p>}

        </div >
    )
}

export default UsersMangment