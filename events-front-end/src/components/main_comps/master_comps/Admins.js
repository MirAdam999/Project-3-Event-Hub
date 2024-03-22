
import { useState, useEffect } from "react";
import { useToken } from '../../Token';
import { useNavigate } from 'react-router-dom';
import Spinner from "../../Loading";
import RevokeAdmin from "./RevokeAdmin";
import AddAdmin from "./AddAdmin";

const AdminsMangment = () => {
    const { storedToken, usersId } = useToken();
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
                const result = await fetch("http://127.0.0.1:5000/admins", {
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
            const result = await fetch(`http://127.0.0.1:5000/revoke_admin/${user.user_id}`, {
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
            <div className="events-loading">
                <Spinner />
            </div>
        );
    } else if (admins.length > 0) {
        return (
            <div className="users">
                <div className="users-header">
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
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Full Name</th>
                                <th>Created At</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(user => (
                                <tr key={user.user_id} className="table">
                                    <td><button onClick={() => handleNavigation(`/user/${user.user_id}`)}>{user.user_id}</button></td>
                                    <td><button onClick={() => handleNavigation(`/user/${user.user_id}`)}>{user.username}</button></td>
                                    <td >{user.email}</td>
                                    <td><button onClick={() => handleNavigation(`/user/${user.user_id}`)}>{user.name}</button></td>
                                    <td>{user.created}</td>
                                    <td>{user.is_active}</td>
                                    <td>{user.user_id === usersId ?
                                        (<button disabled> Revoke Admin </button>) :
                                        (<button onClick={() => openRevoke(user)}> Revoke Admin</button>)}</td>
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
            <div className="events-none">
                <p> No Admins Found </p>
            </div>
        );
    }
    else {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }
}

export default AdminsMangment