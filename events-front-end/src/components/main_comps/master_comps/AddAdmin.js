
import SearchUser from "./SearchUser"
import { useState } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";

const AddAdmin = (props) => {
    const { storedToken } = useToken();
    const [searched, setSearched] = useState(false)
    const [errorMessage, setErrorMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sucsess, setSucsess] = useState(false);

    const makeAdmin = async (user) => {
        setLoading(true)
        try {
            const result = await fetch(`http://127.0.0.1:5000/make_admin/${user.user_id}`, {
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
                setSucsess(user)
                setLoading(false)
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }

    return (
        <div className="window">
            <div className="window-inner">
                <div className="add-user-search">
                    <div className="close"><button onClick={props.onClose}>X</button></div>
                    <SearchUser setUsers={setUsers}
                        setErrorMessage={setErrorMessage}
                        setSearched={setSearched} />
                    {sucsess &&
                        <div className="sucsess-message">
                            <p>User {sucsess.name}, ID {sucsess.user_id} Made Admin</p>
                        </div>
                    }
                    {errorMessage && <p>{errorMessage}</p>}
                    {loading && <Spinner />}
                </div>
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
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.user_id} className="table">
                                        <td>{user.user_id}</td>
                                        <td>{user.username}</td>
                                        <td >{user.email}</td>
                                        <td>{user.name}</td>
                                        <td>{user.created}</td>
                                        <td>{user.is_active}</td>
                                        <td>{user.is_active === 'Active' ?
                                            (<button onClick={() => makeAdmin(user)}> Make Admin</button>) :
                                            (<button disabled> Make Admin </button>)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}

                {searched && !users &&
                    <div className="none-found">
                        No Users Meeting Search Found</div>}
            </div >
        </div>
    )
}
export default AddAdmin