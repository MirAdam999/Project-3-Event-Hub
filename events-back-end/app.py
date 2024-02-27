from flask import Flask
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt

from modules import db
from modules.event_categories import EventCategories
from modules.event_images import EventImages
from modules.events import Events
from modules.feedback import Feedback
from modules.registrations import Registrations
from modules.users import Users

bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('.config')
    db.init_app(app)
    migrate = Migrate(app, db)
    bcrypt.init_app(app)

    return app


if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        db.create_all()
    
        # are we gonna cry?
        
        from backend_logic.backend_base import BackendBase      
        backend=BackendBase()
        #backend.add_user(username='elisheva1', password='Elisheva1', email='elisheva@gmail.com',
                #name='Elisheva Cohen', description='I like to party')
        facade, err, front_end_token = backend.login(username="elisheva1",password='Elisheva1')
        print(facade.get_user(front_end_token))
        backend.logout()
        #print (backend.get_event_by_id(1))
        #print (backend.get_event_by_params(title=1, organiser=1, date=1, location=1, type=1))

        
    app.run(debug=app.config['DEBUG'], use_reloader=app.config['USE_RELOADER'], port=5000)
    