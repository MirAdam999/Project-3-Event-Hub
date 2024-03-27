
import { useState, useEffect } from 'react';
import { useToken } from '../../Token';
import Spinner from "../../Loading";

const ShowRegistrations = (props) => {
    const event = props.event
    const { storedToken } = useToken();
    const [registrations, setRegistrations] = useState('')
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [update, setUpdate] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetch(`http://127.0.0.1:5000/get_registrations/${event.event_id}`, {
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
                    setRegistrations(data.registrations);
                }
            } catch (error) {
                console.error('Error during fetch:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [update]);

    const handleApprove = async (registeration_id) => {
        try {
            const result = await fetch(`http://127.0.0.1:5000/approve_registration/${registeration_id}`, {
                method: 'PUT',
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
                setUpdate(!update);
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }

    const handleDecline = async (registeration_id) => {
        try {
            const result = await fetch(`http://127.0.0.1:5000/decline_registration/${registeration_id}`, {
                method: 'PUT',
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
                setUpdate(!update);
            }

        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }

    if (registrations) {
        return (
            <div className="event-registrations">
                <table>
                    <th> ID </th>
                    <th> User </th>
                    <th> Registered At </th>
                    {event.is_private === 'Private' && <>
                        <th> Status </th>
                        <th> Approve </th>
                        <th> Decline </th>
                    </>}
                    <tbody>
                        {registrations.map(register => (
                            <tr key={register.registeration_id}>
                                <td> {register.registeration_id} </td>
                                <td> {register.name} </td>
                                <td id='registration-datetime'> {register.date} {register.time} </td>
                                {event.is_private === 'Private' && <>
                                    <td style={{
                                        color: register.status === 'Declined' ? 'red' :
                                            (register.status === 'Approved' ? 'green' : 'black')
                                    }}>
                                        {register.status}
                                    </td>
                                    {register.status === 'Approved' &&
                                        <><td> <button id='approve' disabled>Approve</button> </td>
                                            <td> <button id='decline' onClick={() => handleDecline(register.registeration_id)}>Decline</button> </td></>}
                                    {register.status === 'Declined' &&
                                        <><td> <button id='approve' onClick={() => handleApprove(register.registeration_id)}>Approve</button> </td>
                                            <td> <button id='decline' disabled>Decline</button> </td></>}
                                    {register.status === 'Pending Approval' &&
                                        <><td> <button id='approve' onClick={() => handleApprove(register.registeration_id)}> Approve</button> </td>
                                            <td> <button id='decline' onClick={() => handleDecline(register.registeration_id)}>Decline</button> </td></>}
                                </>}
                            </tr>))}
                    </tbody>
                </table>

                {loading &&
                    <div className="registrations-loading">
                        <Spinner />
                    </div>
                }
                {errorMessage &&
                    <div className="events-err">
                        <p className="error-message">{errorMessage}</p>
                    </div>
                }
            </div >
        )
    } else if (!registrations) {
        return (
            <div className="event-registrations">
                <p> No Registrations Yet </p>
            </div>
        );
    } else {
        return (
            <div className="events-err">
                <p className="error-message">{errorMessage}</p>
            </div>
        );
    }
}

export default ShowRegistrations