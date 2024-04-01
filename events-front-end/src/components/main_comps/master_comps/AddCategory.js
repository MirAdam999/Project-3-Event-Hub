
import { useRef, useState } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import '../../../style/Window.css';

const AddCategory = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [sucsess, setSucsess] = useState(false);
    const name = useRef();
    const description = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const result = await fetch(`http://127.0.0.1:5000/add_category`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken,
                    name: name.current.value,
                    description: description.current.value
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
                setTimeout(() => {
                    props.onClose();
                }, 5000);
            }

        } catch (error) {
            console.error('Error during fetch:', error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="window-inner">

            <div className="add-category">
                <form onSubmit={handleSubmit}>
                    <p id='cat-head'> Create Category </p>
                    <label htmlFor="cat-name">Category Name:</label><br />
                    <input type="text" id="cat-name" ref={name}
                        maxLength="100" required /><br />

                    <label htmlFor="description">Description:</label><br />
                    <textarea type="text" id="description" ref={description}
                        maxLength="1000" cols="35" rows="10" /><br />

                    <button type="submit" className="approve-button"> Create </button>
                </form>

                {loading && <div className="events-loading">
                    <Spinner />
                </div>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {sucsess &&
                    <div className="sucsess-message">
                        <p> Category Created Sucsessfully! </p>
                    </div>}
            </div>

            <div className="close"><button onClick={props.onClose}>X</button></div>
        </div>
    )
}

export default AddCategory