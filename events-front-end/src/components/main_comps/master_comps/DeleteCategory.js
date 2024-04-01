
import { useState } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import '../../../style/Pop-Up.css';

const DeleteCategory = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [sucsess, setSucsess] = useState(false);
    const category = props.category

    const handleDelete = async (e) => {
        setLoading(true)
        try {
            const result = await fetch(`http://127.0.0.1:5000/categories/${category.category_id}`, {
                method: 'DELETE',
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
                }
                else {
                    throw new Error(`HTTP error! Status: ${result.status}`);
                }
            }
            else {
                setSucsess(true)
                setTimeout(() => {
                    props.onClose();
                }, 5000);
                if (e.target && e.target.form) {
                    e.target.form.reset();
                }
            }

        } catch (error) {
            console.error('Error during fetch:', error);

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="popup">
            <div className="popup-inner">

                <div className="revoke-admin">
                    <p className='revoke-haeder'>Delte Category {category.name}, ID {category.category_id}?</p>
                    <div className="revoke-bottons">
                        <button className="approve-button" onClick={handleDelete}> Delete </button>
                        <button className="cancel-button" onClick={props.onClose}> Cancel </button>

                    </div>
                    {loading && <div className="events-loading">
                        <Spinner />
                    </div>}
                    {sucsess &&
                        <div className="sucsess-message">
                            <p> Category Deleted Sucsessfully </p>
                        </div>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>

                <div className="close"><button onClick={props.onClose}>X</button></div>

            </div>
        </div >
    )
}

export default DeleteCategory