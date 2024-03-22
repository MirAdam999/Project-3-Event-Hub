
import { useState, useEffect } from "react";
import { useToken } from '../../Token';
import Spinner from "../../Loading";
import AddCategory from "./AddCategory";
import CategoryDetails from "./CategoryDetails";
import UpdateCategory from "./UpdateCategory";
import DeleteCategory from "./DeleteCategory";

const CategoriesMangment = () => {
    const { storedToken } = useToken();
    const [errorMessage, setErrorMessage] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [catDetailsIsOpen, setCatDetailsIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);
    const [deltePopUpIsOpen, setDeltePopUpIsOpen] = useState(false);

    function openAdd() {
        setAddIsOpen(true);
    }

    function closeAdd() {
        setAddIsOpen(false);
    }

    function openCategory(category) {
        setCatDetailsIsOpen(category);
    }

    function closeCategory() {
        setCatDetailsIsOpen(false);
    }

    function openUpdate(category) {
        setUpdateIsOpen(category);
    }

    function closeUpdate() {
        setUpdateIsOpen(false);
    }

    function openDelete(category) {
        setDeltePopUpIsOpen(category);
    }

    function closeDelete() {
        setDeltePopUpIsOpen(false);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch("http://127.0.0.1:5000/categories", {
                    method: 'POST',
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

                    } else {
                        throw new Error(`HTTP error! Status: ${result.status}`);
                    }
                } else {
                    const data = await result.json();
                    setCategories(data.categories);
                }
            } catch (error) {
                console.error('Error during fetch:', error);

            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [deltePopUpIsOpen, updateIsOpen, addIsOpen]);

    if (loading) {
        return (
            <div className="events-loading">
                <Spinner />
            </div>
        );
    } else if (categories.length > 0) {
        return (
            <div className="categories">
                <div className="categories-header">
                    <p> All Event Categories </p>
                </div>
                <div className="categories-add-button">
                    <button onClick={() => openAdd()}> Add Category + </button>
                </div>
                <div className="usecategoriesrs-display">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Event Category</th>
                                <th>Category Description</th>
                                <th>Num. Of Events</th>
                                <th>View Events</th>
                                <th>Update</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category.category_id}>
                                    <td>{category.category_id}</td>
                                    <td>{category.name}</td>
                                    <td>{category.description}</td>
                                    <td>{category.count}</td>
                                    <td><button onClick={() => openCategory(category)}> View Events </button></td>
                                    <td><button onClick={() => openUpdate(category)}> Update </button></td>
                                    <td>
                                        {category.count > 0 ? (
                                            <button disabled>Delete</button>
                                        ) : (
                                            <button onClick={() => openDelete(category)}>Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {addIsOpen && <div className="window">
                    <AddCategory onClose={closeAdd} />
                </div>}

                {catDetailsIsOpen && <div className="window">
                    <CategoryDetails onClose={closeCategory} category={catDetailsIsOpen} />
                </div>}

                {updateIsOpen && <div className="window">
                    <UpdateCategory onClose={closeUpdate} category={updateIsOpen} />
                </div>}

                {deltePopUpIsOpen && <div className="window">
                    <DeleteCategory onClose={closeDelete} category={deltePopUpIsOpen} />
                </div>}

            </div >
        )
    }
    else if (categories.length = 0) {
        return (
            <div className="events-none">
                <p> No Categories Found </p>
            </div>
        );
    }
    else {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }
}

export default CategoriesMangment