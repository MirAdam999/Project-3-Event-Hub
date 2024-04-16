
import { useEffect } from "react";
import { useToken } from "../../Token";
import { useURL } from "../../URL";

const AllUsers = (props) => {
    const { storedToken } = useToken();
    const { storedURL } = useURL();
    const { setLoading } = props;

    useEffect(() => {
        props.setSearched(false)
        setLoading(true);
        const fetchData = async () => {
            try {
                const result = await fetch(`${storedURL}/users`, {
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

    return (<></>)

}

export default AllUsers