
import { useState, useEffect } from "react"
import LandingPage from './main_comps/Home'
import MyEvents from './main_comps/MyEvents'
import AddEvent from "./main_comps/AddEvent"
import AllEvents from "./main_comps/AllEvents"
import SearchEvent from "./main_comps/SearchEvent"

const Main = (props) => {
    const [mainComponentToDisplay, setMainComponentToDisplay] = useState('homepage')

    const mainComponentsDictionary = {
        "homepage": <LandingPage />,
        "my_events": <MyEvents />,
        'add_event': <AddEvent />,
        "all_events": <AllEvents />,
        "search_event": <SearchEvent />,
    };

    useEffect(() => {
        setMainComponentToDisplay(mainComponentsDictionary[props.main]);
    }, [props.main]);

    return (
        <div className="main-comp">
            {mainComponentToDisplay}
        </div>
    )
}

export default Main