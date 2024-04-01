import { useNavigate } from 'react-router-dom';
import { useToken } from '../Token';
import '../../style/Home.css';
import '@fortawesome/fontawesome-free/css/all.css';

const LandingPage = (props) => {
    const { storedToken } = useToken();
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="landing-page">

            <div className="landing-page-hero">
                <div className='landing-page-hero-txt'>
                    <p id='hero-header'> Welcome to EventHub </p>
                    <p id='hero-text'> Your go-to destination for discovering,
                        joining, and hosting vibrant community events! Whether you're passionate about arts,
                        culture, technology, or wellness, EventHub connects you with a diverse array of
                        gatherings tailored to your interests. Sign up now to explore a world of
                        exciting opportunities, from workshops to networking sessions, and share your
                        experiences by providing valuable ratings and feedback. Join our thriving community
                        today and let's make every event unforgettable together!</p>
                </div>
                <div className='landing-page-hero-btn'>
                    <button id='hero-search' onClick={() => handleNavigation('/search_event')}> Find Event!</button>
                </div>
            </div>

            <div className="landing-page-organiser">
                <div className='landing-page-organiser-img'></div>
                <div className='landing-page-organiser-txt'>
                    <p id='for-organisers-call'>Organiser?</p>
                    <p id='for-organisers-header'>Empower your event planning journey with EventHub! </p>
                    <p id='for-organisers-text'>Seamlessly create, manage, and promote your gatherings
                        to an eager audience of enthusiasts and attendees.
                        With our intuitive platform, you can effortlessly host
                        events tailored to your vision, whether it's a workshop,
                        conference, or social gathering. From registration to feedback
                        collection, EventHub streamlines every aspect of event management,
                        allowing you to focus on delivering an exceptional experience.
                        Join us today and let's bring your event ideas to life with ease and efficiency!</p>
                    <button id='button-to-plan' onClick={storedToken ? (() => handleNavigation('/add_event')) : (props.onLogIn)}> Create Event!</button>
                </div>
            </div>

            <div className="landing-page-about">
                <p id='about-header'>About EventHub:</p>
                <p>EventHub was born out of a passion for community engagement and the belief that every
                    gathering has the potential to inspire, educate, and connect individuals. Our platform
                    serves as a dynamic hub where event organizers and attendees come together to create
                    unforgettable experiences.</p>
                < br />
                <p id='about-attendiees-header'>For Attendees:</p>
                <p id='about-attendiees'>Discovering meaningful events shouldn't be a hassle. That's why EventHub provides a user-friendly
                    interface for attendees to explore a diverse range of gatherings tailored to their interests.
                    Whether you're seeking professional development opportunities, cultural experiences, or simply
                    looking to connect with like-minded individuals, EventHub offers a comprehensive directory of
                    events at your fingertips. Sign up today and embark on a journey of discovery and enrichment.</p>
                < br />
                <p id='about-arganisers-header'>For Organizers:</p>
                <p id='about-arganisers'>We understand the challenges of event planning, which is why EventHub is designed to streamline the
                    process from start to finish. Our intuitive platform empowers organizers to effortlessly create, manage,
                    and promote their events to a wide audience. With robust features for registration, communication, and
                    feedback collection, EventHub simplifies every aspect of event management, allowing organizers to
                    focus on delivering exceptional experiences for their attendees.</p>
                < br />
                <p id='about-summary'>At EventHub, we're committed to fostering vibrant communities and facilitating meaningful
                    connections. Join us in our mission to make every event a success, one gathering at a time.</p>
            </div>

            <div className="landing-page-contact">
                <i onClick={() => window.open('https://www.instagram.com', '_blank')} class="fa-brands fa-square-instagram"></i>
                <i onClick={() => window.open('https://twitter.com', '_blank')} class="fa-brands fa-square-twitter"></i>
                <i onClick={() => window.open('https://www.facebook.com', '_blank')} class="fa-brands fa-square-facebook"></i>
            </div>

        </div>
    )
}

export default LandingPage