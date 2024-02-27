
from app import bcrypt
from datetime import datetime

from modules.event_categories import EventCategories
from modules.event_images import EventImages
from modules.events import Events
from modules.feedback import Feedback
from modules.registrations import Registrations
from modules.users import Users
from modules.repository import Repository
from logger import Logger
from backend_logic.login_token import LoginToken

# 25.02.24
# Mir Shukhman
# Defining class BackendBase wich will be parent class for all other backend classes
# Every use of one of Backend's funcs will be logged in 'log.json' in format:
#       id(Auto-generated), dattime(Auto-generated), class_name, func_name, func_input, func_output

class BackendBase:
    def __init__(self):
        self.class_name=self.__class__.__name__
        # Instance of logger to acsess the log func from Logger class
        self.logger = Logger()
        # Instances of Repository class with all the db.models as parameters 
        #       to utilise Repo's funcs in the backend classes' funcs
        self.categories_repo= Repository(EventCategories)
        self.images_repo= Repository(EventImages)
        self.events_repo= Repository(Events)
        self.feedback_repo= Repository(Feedback)
        self.registrations_repo= Repository(Registrations)
        self.users_repo= Repository(Users)
        self.lt_instance=LoginToken()


    def _check_password(self,hashed_password,password):
        result= bcrypt.check_password_hash(hashed_password, password)
        self.logger.log(self.class_name,'_check_password', hashed_password, result)
        return result


    def login (self,*, username, password):
        try:
            # look for user by username(SP)
            user=self.users_repo.get_stored_procedure(
                    'get_user_by_username',{'username':username})
            if user:
                db_pass= user[0][2] 
                is_master_user= user[0][8]
                user_ID = user[0][0]
                name = user[0][4]
                is_active = user[0][7]
                # check password correct
                if self._check_password(db_pass, password):
                    if is_active==True:
        
                        if is_master_user == True:  
                            self.lt_instance.token_data = (user_ID,name,is_master_user) # using setter
                            token, front_end_token = self.lt_instance.login_token # getting token path & encrypted token for front end
                            
                            if token and front_end_token:
                                from backend_logic.master_backend import MasterBackend
                                self.logger.log(self.class_name,'login', username, 'master user logged in')
                                facade=MasterBackend(token) 
                                return (facade, None, front_end_token)  # returning correct facade with the token path in init & encrypted token for front end

                            else:
                                self.logger.log(self.class_name,'login', username, 'err generating token')
                                return (None, 'err generating token')
                                
                        if is_master_user == False:
                            self.lt_instance.token_data = (user_ID,name,is_master_user) # using setter
                            token, front_end_token = self.lt_instance.login_token # getting token path & encrypted token for front end
                            
                            if token and front_end_token:
                                from backend_logic.user_backend import UserBackend
                                self.logger.log(self.class_name,'login', username, 'regular user logged in')
                                facade=UserBackend(token) 
                                return (facade, None, front_end_token) # returning correct facade with the token path in init & encrypted token for front end

                            else:
                                self.logger.log(self.class_name,'login', username, 'err generating token')
                                return (None, 'err generating token')
                            
                        else:
                            self.logger.log(self.class_name,'login', username, 'err role')
                            return (None, 'err role')
                        
                    else:
                        self.logger.log(self.class_name,'login', username, 'inactive user')
                        return (None, 'user inactive')
                    
                else:
                    self.logger.log(self.class_name,'login', username, 'wrong pass')
                    return (None, 'wrong pass')
                
            else:
                self.logger.log(self.class_name,'login', username, 'no user by username')
                return (None, 'no user by username')
            
        except Exception as e:
            self.logger.log(self.class_name,'login', username, str(e))
            return (None, str(e))
        
    
    def logout(self):
        try:
            self.lt_instance.delete_token_file()
            self.logger.log(self.class_name,'logout', None, 'logout sucsess')
            return True
        
        except Exception as e:
            self.logger.log(self.class_name,'logout', None, str(e))
            return False
        
            
    def add_user(self,*,username, password, email,
                 name, description):
        try:
            if self.users_repo.get_stored_procedure('check_if_user_exists',{'username':username, 'email':email}):
                return (False,'user exists')
            
            else:
                hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
                current_datetime = datetime.now()
                new_user = self.users_repo.add(Users(Username=username,PasswordHash=hashed_password,
                                                    Email=email, FullName=name, 
                                                    ProfileDescription=description, CreatedAt=current_datetime))
                if new_user:    # creation user sucsess
                    self.logger.log(self.class_name,'add_user', (username, email, name, description), True)
                    return (True, None) 
                        
                else:   #user creation err
                    self.logger.log(self.class_name,'add_user', (username, email, name, description), 'user sreation err')
                    return (False, 'user sreation err')
                
        except Exception as e:
            self.logger.log(self.class_name,'add_user', (username, email, name, description), str(e))
            return (None,str(e))
    
    
    def get_event_by_id (self, event_id):
        try:
            event=self.events_repo.get_by_id(event_id)
            if event:
                self.logger.log(self.class_name,'get_event_by_id', event_id, event)
                return event
            
            else:
                self.logger.log(self.class_name,'get_event_by_id', event_id, 'none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_event_by_id', event_id, str(e))
            return None

    
    def get_event_by_params (self, *, title, organiser, date, location, type):
        try:
            events=self.events_repo.get_stored_procedure('get_event_by_params',{'title':title,
                                                                                'organiser':organiser,
                                                                                'date':date,
                                                                                'location':location,
                                                                                'type':type})
            if events:
                self.logger.log(self.class_name,'get_event_by_params', (title, organiser, date, location, type), events)
                return events
            
            else:
                self.logger.log(self.class_name,'get_event_by_params', (title, organiser, date, location, type), 'none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_event_by_id', (title, organiser, date, location, type), str(e))
            return None 