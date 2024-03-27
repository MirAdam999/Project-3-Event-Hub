
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
            <div className="window-inner">
                <div className="update-review">
                    <div className="close"><button onClick={props.onClose}>X</button></div>
                    <form onSubmit={handleSubmit}>
                        <p> Update Review </p>

                        <label htmlFor="raiting">Raiting, 1 to 5:</label>
                        <input type="number" id="raiting" value={reviewData.raiting}
                            min="1" max="5" onChange={handleInputChange} /><br />

                        <label htmlFor="comment">Comment:</label><br />
                        <textarea type="text" id="comment" value={reviewData.comment}
                            maxLength="1000" onChange={handleInputChange} /><br />

                        <button type="submit" className="green-button"> Update </button>
                    </form>

                    {loading && <div className="events-loading">
                        <Spinner />
                    </div>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {sucsess &&
                        <div className="sucsess-message">
                            <p> Review Updated Sucsessfully </p>
                        </div>}
                </div>
            </div>
        </div>
    )
}
export default UpdateReview