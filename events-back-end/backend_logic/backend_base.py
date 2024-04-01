
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
# Defining class BackendBase wich will be parent class for  UserBackend class
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
        '''
        Mir Shukhman
        Check password matching.
        Input: hashed_password, password
        Output: True/False
        '''
        result= bcrypt.check_password_hash(hashed_password, password)
        self.logger.log(self.class_name,'_check_password', hashed_password, result)
        return result


    def login (self,*, username, password):
        '''
        Mir Shukhman
        Login func, looks for user by username(db SP), extracts user data, calls _check_password
        to check inputedd pass matches db pass, cheks user active, calling token_data login token 
        class setter func to create new token, calls login_token login token class getter func to
        get token filepath and frontend token, creates instanse of UserBackend facade and passes it token filepath in init, 
        returns facade (err_msg=None) and front_end_token. If err, will return (None, err_msg ,None)
        Input: username, password
        Output: tupple(facade,err_msg,front_end_token)
        '''
        err_msg = None
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
        
                        self.lt_instance.token_data = (user_ID,name,is_master_user) # using setter
                        token_filepath, front_end_token = self.lt_instance.login_token # getting token path & encrypted token for front end
                        
                        if token_filepath and front_end_token:
                            from backend_logic.user_backend import UserBackend
                            self.logger.log(self.class_name,'login', username, 'logged in')
                            facade=UserBackend(token_filepath) 
                            return (facade, err_msg, front_end_token)  # returning facade with the token path in init & encrypted token for front end
                    else:
                        self.logger.log(self.class_name,'login', username, err_msg)
                        err_msg= 'Your User Has Been Disactivated. Contact Customer Support For More Information.'
                        return (None, err_msg, None)
            else:
                self.logger.log(self.class_name,'login', username, err_msg)
                err_msg= 'Wrong Username/Passwod'
                return (None, err_msg, None)
            
        except Exception as e:
            self.logger.log(self.class_name,'login', username, str(e))
            return (None, str(e), None)
        
    
    def logout(self):
        '''
        Mir Shukhman
        Logout func, calls delete_token_file fron logintoken class to delete
        backend toke, returens true or false.
        Output: True/False
        '''
        try:
            self.lt_instance.delete_token_file()
            self.logger.log(self.class_name,'logout', None, 'logout sucsess')
            return True
        
        except Exception as e:
            self.logger.log(self.class_name,'logout', None, str(e))
            return False
        
            
    def add_user(self,*,username, password, email,
                 name, description):
        '''
        Mir Shukhman
        Signup fenc, calls check_if_user_exists db SP to ensure there is no user by inputed email/username,
        hashes inputed password using bcrypt.generate_password_hash, creates new user useing users_repo add
        func. Returns (True, None)/ If err, returns (False, err)
        Input: username, password, email, name, description
        Output: tupple (True/False,err_msg)
        '''
        err_msg = None
        try:
            if self.users_repo.get_stored_procedure('check_if_user_exists',{'username':username, 'email':email}):
                err_msg = 'User with given email/username exists. Pick differernt email/username.'
                return (False,err_msg)
            
            else:
                hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
                current_datetime = datetime.now()
                new_user = self.users_repo.add(Users(Username=username,PasswordHash=hashed_password,
                                                    Email=email, FullName=name, 
                                                    ProfileDescription=description, CreatedAt=current_datetime))
                if new_user:    # creation user sucsess
                    self.logger.log(self.class_name,'add_user', (username, email, name, description), True)
                    return (True, err_msg) 
                        
                else:   #user creation err
                    self.logger.log(self.class_name,'add_user', (username, email, name, description), err_msg)
                    err_msg = 'Error Signing Up. Try Again Later.'
                    return (False, err_msg)
                
        except Exception as e:
            self.logger.log(self.class_name,'add_user', (username, email, name, description), str(e))
            return (False,str(e))
    
    
    def format_datetime(self, date, time):
        '''
        Mir Shukhman
        Formats datetime from sepprate date and time to combined str for DB.
        Input: date, time
        Output: formated_datetime/none
        '''
        combined_datetime_str = f"{date} {time}"
        try:
            formated_datetime = datetime.strptime(combined_datetime_str, '%Y-%m-%d %H:%M')
            self.logger.log(self.class_name,'format_datetime', (date,time), formated_datetime)
            return formated_datetime
        
        except Exception as e:
            self.logger.log(self.class_name,'format_datetime', (date,time), str(e))
            return None         
        
        
    def get_event_by_id (self, event_id):
        '''
        Mir Shukhman
        Get event obj by event_id, calls get_by_id from events_repo class.
        Input: event_id
        Output: event obj/none
        '''
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

    
    def get_event_by_params (self, *, event_id, title, organiser, date, location, type):
        '''
        Mir Shukhman
        Find events by params, if date calls format_datetime func, if organiser calls get_user_by_fullname db SP
        and exstracts user ID, calls custom_search func from repository. Returns list of events found or None.
        Input: event_id,title, organiser, date, location, type
        Output: List of event obj/none
        '''
        try:
            if date:
                formatted_date= self.format_datetime(date,"00:00")
            
            if organiser:
                organiser_data = self.users_repo.get_stored_procedure("get_user_by_fullname",{"full_name":organiser})
                organiser_id =organiser_data[0][0]
                   
            events=self.events_repo.custom_search("Events",{"EventID":event_id,"Title":title,"OrganizerID":organiser_id if organiser else None,
                                                            "EventDateTime":formatted_date if date else None, "Location":location,
                                                            "CategoryID":type})
            if events:
                self.logger.log(self.class_name,'get_event_by_params', (event_id,title, organiser, date, location, type), events)
                return events
            
            else:
                self.logger.log(self.class_name,'get_event_by_params', (event_id,title, organiser, date, location, type), 'none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_event_by_params', (event_id,title, organiser, date, location, type), str(e))
            return None 
        
                
    def get_feedback_by_event (self, event_id):
        '''
        Mir Shukhman
        Get all feedabcks for certain event, calls get_feedback_by_event db SP, returns list of 
        feedback objs or none.
        Input: event_id
        Output: List of feedback obj/none
        '''
        try:
            feedbacks=self.feedback_repo.get_stored_procedure('get_feedback_by_event',{'eventID':event_id})
            if feedbacks:
                self.logger.log(self.class_name,'get_feedback_by_event', event_id, feedbacks)
                return feedbacks
            
            else:
                self.logger.log(self.class_name,'get_feedback_by_event', event_id, 'none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_feedback_by_event', event_id, str(e))
            return None 
        

    def get_images_by_event (self, event_id):
        '''
        Mir Shukhman
        Get all images for certain event, calls get_images_by_event db SP, returns list of 
        image objs or none.
        Input: event_id
        Output: List of image obj/none
        '''
        try:
            images=self.feedback_repo.get_stored_procedure('get_images_by_event',{'eventID':event_id})
            if images:
                self.logger.log(self.class_name,'get_images_by_event', event_id, images)
                return images
            
            else:
                self.logger.log(self.class_name,'get_images_by_event',event_id, 'none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_images_by_event', event_id, str(e))
            return None         

    
    def get_all_event_categories(self):
        '''
        Mir Shukhman
        Get all event cats, calls get_all func from categories_repo class.
        Output: List of category obj/none
        '''
        try:
            categories= self.categories_repo.get_all()
            if categories:
                self.logger.log(self.class_name,'get_all_event_categories', None, categories)
                return categories
            
            else:
                self.logger.log(self.class_name,'get_all_event_categories', None, 'none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_all_event_categories', None, str(e))
            return None
        
        
    def get_category_by_id(self, category_id):
        '''
        Mir Shukhman
        Get event cat by id, calls get_by_id func from categories_repo class.
        Input: category_id
        Output: categry obj/none
        '''
        try:
            category= self.categories_repo.get_by_id(category_id)
            if category:
                self.logger.log(self.class_name,'get_category_by_id', None, category)
                return category
            
            else:
                self.logger.log(self.class_name,'get_category_by_id', None, 'none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_category_by_id', None, str(e))
            return None
        
     
    def get_user_by_id(self, user_id):
        '''
        Mir Shukhman
        Get user by id, calls get_by_id func from users_repo class.
        Input: user_id
        Output: user obj/none
        '''
        try:
            user= self.users_repo.get_by_id(user_id)
            if user:
                self.logger.log(self.class_name,'get_user_by_id', user_id, user)
                return user

            else:
                self.logger.log(self.class_name,'get_user_by_id', user_id, 'no user by id')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_user_by_id', user_id, str(e))
            return None     
     
        
    def get_user_profile_by_id(self, user_id):
        '''
        Mir Shukhman
        Get user and user info by id, calls get_by_id func from users_repo class, calls get_my_events db SP,
        calls count_my_events db SP, calls count_my_attended db SP, returns all or None.
        Input: user_id
        Output: user obj, list of event tupples, list with event_count tupple,
                list with attended_count tupple/none
        '''
        try:
            user= self.users_repo.get_by_id(user_id)
            if user:
                events = self.events_repo.get_stored_procedure('get_my_events',{'organiserID':user_id}) 
                events_count = self.events_repo.get_stored_procedure('count_my_events',{'organiserID':user_id}) 
                attended_count = self.events_repo.get_stored_procedure('count_my_attended',{'atendieeID':user_id}) 
                self.logger.log(self.class_name,'get_user_profile_by_id',
                                (user_id), (user, events, events_count, attended_count))
                return user, events, events_count, attended_count           
            else:
                self.logger.log(self.class_name,'get_user_profile_by_id', (user_id), 'none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_user_profile_by_id', (user_id), str(e))
            return None 
        
        