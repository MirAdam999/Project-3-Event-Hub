
import '../../../style/Window.css';
import { useState } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";

const UpdateCategory = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [sucsess, setSucsess] = useState(false);
    const category = props.category
    const [categoryData, setCategoryData] = useState({
        category_id: category.category_id,
        name: category.name,
        description: category.description
    });

    const handleInputChange = (e) => {
        setCategoryData({
            ...categoryData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const result = await fetch(`http://127.0.0.1:5000/categories/${category.category_id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: storedToken,
                    category_id: categoryData.category_id,
                    name: categoryData.name,
                    description: categoryData.description,
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
        <div className="window-inner">
            <div className="update-category">
                <div className="close"><button onClick={props.onClose}>X</button></div>
                <form onSubmit={handleSubmit}>
                    <p> Update Category </p>
                    <label htmlFor="category_id">Category ID:</label>
                    <input type="number" id="category_id" value={categoryData.category_id} disabled /><br />

                    <label htmlFor="name">Category Name:</label>
                    <input type="text" id="name" value={categoryData.name}
                        maxLength="100" onChange={handleInputChange} required /><br />

                    <label htmlFor="description">Description:</label><br />
                    <textarea type="text" id="description" value={categoryData.description}
                        maxLength="1000" onChange={handleInputChange} /><br />

                    <button type="submit" className="green-button"> Update </button>
                </form>

                {loading && <div className="events-loading">
                    <Spinner />
                </div>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {sucsess &&
                    <div className="sucsess-message">
                        <p> Category Updated Sucsessfully </p>
                    </div>}
            </div>
        </div>
    )
}

export default UpdateCategory