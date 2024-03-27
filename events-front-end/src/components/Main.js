
import React from 'react';
import { Outlet } from 'react-router-dom';
import '../style/Backround.css'

function Main() {

    return (
        <div className="main-comp">

            <Outlet />

        </div>
    )
}

export default Main