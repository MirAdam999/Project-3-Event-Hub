
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../../Token';
import { useURL } from "../../URL";
import Spinner from "../../Loading";
import SearchUser from "./SearchUser";
import AllUsers from "./AllUser";
import '../../../style/main/Admin.css'
import '../../../style/main/Searchbar.css'

const UsersMangment = () => {
    const { storedToken } = useToken();
    const { storedURL } = useURL();
    const { usersId } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [userUpdate, setUserUpdate] = useState(null)
    const [showAll, setShow] = useState(true)
    const [searched, setSearched] = useState(false)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
    }, [users, userUpdate])

    const disableUser = async (user) => {
        try {
            const result = await fetch(`${storedURL}/disactivate_user/${user.user_id}`, {
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
            const result = await fetch(`${storedURL}/activate_user/${user.user_id}`, {
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
            <div className="users-top">
                <div className="searchbar-users">
                    < SearchUser setUsers={setUsers}
                        setErrorMessage={setErrorMessage}
                        setSearched={setSearched}
                        setLoading={setLoading} />
                    <div className="search-button" id='show-all-users'>
                        <button onClick={() => setShow(true)}> Show All Users </button>
                    </div>
                </div>
            </div>

            <div className="users-bottom">
                {userUpdate && <div className="users-message">
                    <p> User ID {userUpdate.user_id}, Name {userUpdate.name}, has been {userUpdate.action}</p>
                </div>}
                < AllUsers setUsers={setUsers}
                    userUpdate={userUpdate}
                    setErrorMessage={setErrorMessage}
                    showAll={showAll} setShow={setShow}
                    setSearched={setSearched}
                    setLoading={setLoading} />

                {loading &&
                    <div className="events-loading">
                        <Spinner />
                    </div>}

                {users.length > 0 &&
                    <div className="users-display" id='all-users-display'>
                        <table>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Full Name</th>
                            <th>Created At</th>
                            <th>User Page</th>
                            <th>Status</th>
                            <th>Permissions</th>
                            <th>Action</th>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.user_id}>
                                        <td>{user.user_id}</td>
                                        <td>{user.username}</td>
                                        <td >{user.email}</td>
                                        <td>{user.name}</td>
                                        <td>{user.created}</td>
                                        <td id='go-to-users-page' onClick={() => handleNavigation(`/user/${user.user_id}`)}>User Page</td>
                                        <td style={{ color: user.is_active === 'Active' ? 'green' : 'red' }}>
                                            {user.is_active}
                                        </td>
                                        <td style={{ color: user.is_master === 'Admin' ? '#c54363' : '' }}>
                                            {user.is_master}
                                        </td>
                                        <td>{user.is_active === 'Active' ?
                                            (user.user_id === usersId ? (<button id='red-button' disabled> Deactivate </button>)
                                                : (<button id='red-button' onClick={() => disableUser(user)}> Deactivate </button>))
                                            : (<button id='green-button' onClick={() => enableUser(user)}> Activate </button>)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }

                {searched && !users &&
                    <div className="none-found">
                        No Users Meeting Search Found</div>}

                {errorMessage &&
                    <p className="error-message">{errorMessage}</p>}
            </div>
        </div >
    )
}

export default UsersMangment