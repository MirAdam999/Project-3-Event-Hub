
import { useEffect, useState } from "react";
import { useToken } from "../../Token";
import Spinner from "../../Loading";

const AllUsers = (props) => {
    const { storedToken } = useToken();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        props.setSearched(false)
        const fetchData = async () => {
            try {
                const result = await fetch("http://127.0.0.1:5000/users", {
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
                        props.setErrorMessage(data.error);

                    } else {
                        throw new Error(`HTTP error! Status: ${result.status}`);
                    }
                } else {
                    const data = await result.json();
                    props.setUsers(data.users);
                }
            } catch (error) {
                console.error('Error during fetch:', error);

            } finally {
                setLoading(false);
                props.setShow(false)
            }
        };

        fetchData();
    }, [props.showAll, props.userUpdate]);

    if (loading) {
        return (
            <div className="events-loading">
                <Spinner />
            </div>
        );
    } else {
        return (<></>)
    }
}
//props.showAll && props.userUpdate
export default AllUsers