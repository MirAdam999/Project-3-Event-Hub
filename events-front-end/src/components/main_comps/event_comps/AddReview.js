
import { useState, useRef } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";

const AddReview = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const raiting = useRef();
    const comment = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const result = await fetch(`http://127.0.0.1:5000/add_review/${props.event_id}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken,
                    raiting: raiting.current.value,
                    comment: comment.current.value
                })
            })
            console.log(raiting)
            console.log(comment)
            if (!result.ok) {
                const data = await result.json();

                if (data.error) {
                    console.error('Error from backend:', data.error);
                    setErrorMessage(data.error);

                } else {
                    throw new Error(`HTTP error! Status: ${result.status}`);
                }

            } else {
                setIsSuccess(true);
            }

        } catch (error) {
            console.error('Error during fetch:', error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="window">
            <div className="window-inner">
                <div className="add-image-window">
                    <div className="close"><button onClick={props.onClose}>X</button></div>
                    <form onSubmit={handleSubmit}>
                        <p> Write A Review Of The Event:</p>
                        <label htmlFor="raiting">Raiting, 1 to 5:</label>
                        <input type="number" id="raiting" ref={raiting}
                            min="1" max="5" /><br />

                        <label htmlFor="comment">Comment:</label><br />
                        <textarea type="text" id="comment" ref={comment}
                            maxLength="1000" /><br />

                        <button type="submit">Submit Review</button>
                    </form >
                    {loading && <Spinner />}
                    {isSuccess &&
                        <div className="sucsess-message">
                            <p>Review Submitted Sucsessfully!</p>
                        </div>
                    }
                    {errorMessage && <p>{errorMessage}</p>}
                </div>
            </div >
        </div>
    )
}

export default AddReview