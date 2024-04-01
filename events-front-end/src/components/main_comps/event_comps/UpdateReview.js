
import { useState } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import '../../../style/Window.css';

const UpdateReview = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [sucsess, setSucsess] = useState(false);
    const review = props.review
    const [reviewData, setReviewData] = useState({
        review_id: review.review_id,
        raiting: review.raiting,
        comment: review.comment
    });

    const handleInputChange = (e) => {
        setReviewData({
            ...reviewData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const result = await fetch(`http://127.0.0.1:5000/reviews/${review.review_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken,
                    raiting: reviewData.raiting,
                    comment: reviewData.comment,
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
                            <p className='add-review-haeder'> Update Review </p>
                            <label htmlFor="raiting">Raiting, 1 to 5:</label>
                            <input type="number" id="raiting" value={reviewData.raiting}
                                min="1" max="5" onChange={handleInputChange} /><br />

                            <label htmlFor="comment">Comment:</label><br />
                            <textarea type="text" id="comment" value={reviewData.comment}
                                maxLength="1000" cols="35" rows="10" onChange={handleInputChange} /><br />

                            <button type="submit" className='approve-button'> Update </button>
                        </form>

                        {loading && <div className="events-loading">
                            <Spinner />
                        </div>}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        {sucsess &&
                            <p className="sucsess-message"> Review Updated Sucsessfully </p>
                        }
                    </div>

                    <div className="close"><button onClick={props.onClose}>X</button></div>
                </div>
            </div>
        </div>
    )
}
export default UpdateReview