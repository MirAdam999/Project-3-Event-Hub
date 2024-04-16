
import { useState, useEffect } from "react";
import { useToken } from '../../Token';
import { useURL } from "../../URL";
import { useNavigate } from 'react-router-dom';
import Spinner from "../../Loading";
import RevokeAdmin from "./RevokeAdmin";
import AddAdmin from "./AddAdmin";
import '../../../style/main/Admin.css'

const AdminsMangment = () => {
    const { storedToken, usersId } = useToken();
    const { storedURL } = useURL();
    const [errorMessage, setErrorMessage] = useState('');
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userUpdate, setUserUpdate] = useState(null)
    const [revokePopUpIsOpen, setRevokePopUpIsOpen] = useState(false);
    const [addPopUpIsOpen, setAddPopUpIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    function openRevoke(user) {
        setRevokePopUpIsOpen(user);
    }

    function closeRevoke() {
        setRevokePopUpIsOpen(false);
    }

    function openAdd() {
        setAddPopUpIsOpen(true);
    }

    function closeAdd() {
        setAddPopUpIsOpen(false);
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch(`${storedURL}/admins`, {
                    method: 'POST',
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
                    const data = await result.json();
                    setAdmins(data.admins);
                }
            } catch (error) {
                console.error('Error during fetch:', error);

            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [userUpdate, addPopUpIsOpen, revokePopUpIsOpen]);

    const revokeAdmin = async (user) => {
        try {
            const result = await fetch(`${storedURL}/revoke_admin/${user.user_id}`, {
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
                        action: 'Revoked Admin Permissions'
                    });
                setTimeout(() => {
                    closeRevoke();
                }, 5000);
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }


    if (loading) {
        return (
            <div className="admins">
                <div className="users-header">
                    <button disabled id='categories-add-button-fake-button'> Fake </button>
                    <p> All Admins </p>
                    <button onClick={openAdd}>Add Admin + </button>
                </div>
                <div className="events-loading">
                    <Spinner />
                </div>
            </div>
        );
    } else if (admins.length > 0) {
        return (
            <div className="admins">
                <div className="users-header">
                    <button disabled id='categories-add-button-fake-button'> Fake </button>
                    <p> All Admins </p>
                    <button onClick={openAdd}>Add Admin + </button>
                </div>

                {userUpdate && <div className="users-message">
                    <p> User ID {userUpdate.user_id}, Name {userUpdate.name}, has been {userUpdate.action}</p>
                </div>}

                {addPopUpIsOpen && <div>
                    <AddAdmin onClose={closeAdd} />
                </div>}

                <div className="users-display">
                    <table>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Created At</th>
                        <th>User Page</th>
                        <th>Status</th>
                        <th>Action</th>
                        <tbody>
                            {admins.map(user => (
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
                                    <td>{user.user_id === usersId ?
                                        (<button disabled id='red-button'> Revoke Admin </button>) :
                                        (<button id='red-button' onClick={() => openRevoke(user)}> Revoke Admin</button>)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {revokePopUpIsOpen &&
                    <RevokeAdmin onClose={closeRevoke}
                        revokeAdmin={revokeAdmin}
                        user={revokePopUpIsOpen} />}

            </div >
        )
    }
    else if (admins.length = 0) {
        return (
            <div className="admins">
                <div className="users-header">
                    <button disabled id='categories-add-button-fake-button'> Fake </button>
                    <p> All Admins </p>
                    <button onClick={openAdd}>Add Admin + </button>
                </div>
                <div className="events-none">
                    <p> No Admins Found </p>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="admins">
                <div className="users-header">
                    <button disabled id='categories-add-button-fake-button'> Fake </button>
                    <p> All Admins </p>
                    <button onClick={openAdd}>Add Admin + </button>
                </div>
                <div className="events-err">
                    <p className="error-message">{errorMessage}</p>
                </div>
            </div>
        );
    }
}

export default AdminsMangment