
import { useRef, useState } from "react";
import { useToken } from "../../Token";
import '../../../style/main/Admin.css'

const SearchForAdmin = (props) => {
    const { storedToken } = useToken();
    const { setLoading } = props;
    const user_id = useRef();
    const username = useRef();
    const email = useRef();
    const name = useRef();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true)
        try {
            const formData = new FormData();
            formData.append("token", storedToken);
            formData.append("user_id", user_id.current.value);
            formData.append("username", username.current.value);
            formData.append("email", email.current.value);
            formData.append("name", name.current.value);

            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            console.log(formDataObject)

            const result = await fetch("http://127.0.0.1:5000/search_user", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formDataObject)
            });
            if (!result.ok) {
                const data = await result.json();

                if (data.error) {
                    console.error('Error from backend:', data.error);
                    props.setErrorMessage(data.error);

                } else {
                    throw new Error(`HTTP error! Status: ${result.status}`);
                }
            } else {
                const data = await result.json();
                props.setUsers(data.users);
            }
        } catch (error) {
            console.error('Error during fetch:', error);

        } finally {
            setLoading(false);
            props.setSearched(true);
        }
    };


    return (
        <div className="search-for-admin">
            <form onSubmit={handleSubmit}>
                <div className="label-input" id='label-input-admin'>
                    <label htmlFor="user_id_search">User ID:</label>
                    <input type="number" id="user_id_search" ref={user_id} /><br />
                </div>
                <div className="label-input" id='label-input-admin'>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" ref={username} /><br />
                </div>
                <div className="label-input" id='label-input-admin'>
                    <label htmlFor="email">Email:</label>
                    <input type="text" id="email" ref={email} /><br />
                </div>
                <div className="label-input" id='label-input-admin'>
                    <label htmlFor="name">Full Name:</label>
                    <input type="text" id="name" ref={name} /><br />
                </div>
                <div className="search-button" id='search-button-admin'>
                    <button type="submit"> Search User </button>
                </div>
            </form>
        </div>
    )

}
export default SearchForAdmin