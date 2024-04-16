
import { useState, useEffect, useRef } from "react";
import { useURL } from "../URL";
import Spinner from "../Loading";
import EventsFound from "./EventsFound";
import '../../style/main/Searchbar.css'
import '../../style/main/SearchEvent.css'
import '@fortawesome/fontawesome-free/css/all.css';

const SearchEvent = () => {
    const { storedURL } = useURL();
    const [errorMessage, setErrorMessage] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
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
                const response = await fetch(`${storedURL}/get_categories`);
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

            const result = await fetch(`${storedURL}/search_event`, {
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
                    <div className="label-input">
                        <label htmlFor="event_id">Event ID:</label><br />
                        <input type="number" id="event_id" ref={event_id} /><br />
                    </div>
                    <div className="label-input">
                        <label htmlFor="titlee">Title:</label><br />
                        <input type="text" id="titlee" ref={title} maxLength='100' /><br />
                    </div>
                    <div className="label-input">
                        <label htmlFor="organiser">Organiser:</label><br />
                        <input type="text" id="organiser" ref={organiser} maxLength='100' /><br />
                    </div>
                    <div className="label-input">
                        <label htmlFor="locationn">Location:</label><br />
                        <input type="text" id="locationn" ref={location} maxLength='300' /><br />
                    </div>
                    <div className="label-input">
                        <label htmlFor="date">Date:</label><br />
                        <input type="date" id="date" ref={date} /><br />
                    </div>
                    <div className="label-input" id="category-div">
                        <label htmlFor="category">Category:</label><br />
                        <select id="category" value={selectedValue} onChange={handleSelectChange}>
                            <option value="">-Select-</option>
                            {Array.isArray(category) && category.map((categoryItem) => (
                                <option key={categoryItem.category_id} value={categoryItem.category_id}>
                                    {categoryItem.category}
                                </option>
                            ))}
                        </select><br />
                    </div>
                    <div className="search-button">
                        <button type="submit"> Search <i class="fa-solid fa-magnifying-glass"></i> </button>
                    </div>
                </form>
            </div>

            {searched && <div className="search-result">
                {loading ? (
                    <div className="events-loading">
                        <Spinner />
                    </div>
                ) : (
                    <EventsFound events={events} error={errorMessage} />
                )}
            </div>}

        </div>
    );
}

export default SearchEvent