
import { useState, useEffect, useRef } from "react";
import useToken from "../Token";
import Spinner from "../Loading"

const AddEvent = () => {
    const { getToken } = useToken();
    const token = getToken();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const title = useRef();
    const description = useRef();
    const location = useRef();
    const date = useRef();
    const time = useRef();
    const image = useRef();
    const [category, setCategory] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/get_categories');
                const result = await response.json();

                if ('categories' in result) {
                    setCategory(result.categories);
                } else {
                    console.error('Error: No categories key in the response');
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleCheckboxChange = () => {
        setIsPrivate(!isPrivate);
    };

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const formData = new FormData();
            formData.append("token", token);
            formData.append("title", title.current.value);
            formData.append("description", description.current.value);
            formData.append("location", location.current.value);
            formData.append("date", date.current.value);
            formData.append("time", time.current.value);

            const imageInput = image.current;
            if (imageInput.files.length > 0) {
                formData.append("image", imageInput.files[0]);
            }

            formData.append("category", selectedValue);
            formData.append("isPrivate", isPrivate);

            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            console.log(formDataObject)

            const result = await fetch("http://127.0.0.1:5000/add_event", {
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

    if (Array.isArray(category)) {
        return (
            <div className="add-event">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" ref={title} maxLength='100' required /><br />
                    <label htmlFor="description">Description:</label><br />
                    <textarea type="text" id="description" ref={description} maxLength="1000" /><br />
                    <label htmlFor="location">Location:</label>
                    <input type="text" id="location" ref={location} maxLength='300' required /><br />
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" ref={date} required /><br />
                    <label htmlFor="time">Time:</label>
                    <input type="time" id="time" ref={time} required /><br />
                    <label for="image">Upload Image:</label>
                    <input type="file" id="image" ref={image} /><br />

                    <span>Is This a Private Event?</span><br />
                    <span>If the event is marked private, each registration for the event will require your approval.</span><br />
                    <label>
                        The Event Is Private
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={handleCheckboxChange}
                        />
                    </label><br />

                    <select value={selectedValue} onChange={handleSelectChange}>
                        <option value="">Select Event Category</option>
                        {Array.isArray(category) && category.map((categoryItem) => (
                            <option key={categoryItem.category_id} value={categoryItem.category_id}>
                                {categoryItem.category}: {categoryItem.description}
                            </option>
                        ))}
                    </select><br />

                    <button type="submit">Create Event!</button>
                </form>

                {loading && <Spinner />}
                {isSuccess && <p>Adding success!</p>}
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        )
    }

    else {
        return (
            <Spinner />
        )
    }

};

export default AddEvent