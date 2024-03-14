
import { useState, useEffect, useRef } from "react";
import Spinner from "../Loading";
import EventsFound from "./EventsFound";

const SearchEvent = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);
    const event_id = useRef();
    const title = useRef();
    const organiser = useRef();
    const location = useRef();
    const date = useRef();
    const [category, setCategory] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');

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

            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const formData = new FormData();
            formData.append("event_id", event_id.current.value);
            formData.append("title", title.current.value);
            formData.append("organiser", organiser.current.value);
            formData.append("location", location.current.value);
            formData.append("date", date.current.value);
            formData.append("category", selectedValue);

            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            console.log(formDataObject)

            const result = await fetch("http://127.0.0.1:5000/search_event", {
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
                const data = await result.json();
                setEvents(data.found_events);
            }

        } catch (error) {
            console.error('Error during fetch:', error);

        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    return (
        <div className="search_event">

            <div className="searchbar">
                <form onSubmit={handleSubmit}>

                    <label htmlFor="event_id">Event ID:</label>
                    <input type="number" id="event_id" ref={event_id} /><br />
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" ref={title} maxLength='100' /><br />
                    <label htmlFor="organiser">Organiser:</label>
                    <input type="text" id="organiser" ref={organiser} maxLength='100' /><br />
                    <label htmlFor="location">Location:</label>
                    <input type="text" id="location" ref={location} maxLength='300' /><br />
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" ref={date} /><br />
                    <select value={selectedValue} onChange={handleSelectChange}>
                        <option value="">- Event Category -</option>
                        {Array.isArray(category) && category.map((categoryItem) => (
                            <option key={categoryItem.category_id} value={categoryItem.category_id}>
                                {categoryItem.category}: {categoryItem.description}
                            </option>
                        ))}
                    </select><br />
                    <button type="submit"> Search </button>
                </form>
            </div>

            <div className="search-result">
                {searched ? (
                    loading ? (
                        <div className="events-loading">
                            <Spinner />
                        </div>
                    ) : (
                        <EventsFound events={events} error={errorMessage} />
                    )
                ) : null}
            </div>
        </div >
    );
}

export default SearchEvent