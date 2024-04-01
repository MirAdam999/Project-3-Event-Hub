
import { useState, useRef } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import '../../../style/Window.css';

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
            <div className="window-inner" id='window-inner-add-review'>
                <div className="add-image-window">

                    <div className="add-image-after-event">
                        <form onSubmit={handleSubmit}>
                            <p className='add-review-haeder'> Write A Review Of The Event:</p>
                            <label htmlFor="raiting">Raiting, 1 to 5:</label>
                            <input type="number" id="raiting" ref={raiting}
                                min="1" max="5" /><br />

                            <label htmlFor="comment">Comment:</label><br />
                            <textarea type="text" id="comment" ref={comment}
                                maxLength="1000" cols="35" rows="10" /><br />

                            <button className='approve-button' type="submit">Submit Review</button>
                        </form >
                        {loading && <Spinner />}
                        {isSuccess &&
                            <p className="sucsess-message">Review Submitted Sucsessfully!</p>
                        }
                        {errorMessage && <p>{errorMessage}</p>}
                    </div>
                    <div className="close"><button onClick={props.onClose}>X</button></div>
                </div>
            </div >
        </div>
    )
}

export default AddReview