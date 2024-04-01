
from app import bcrypt
from datetime import datetime

from backend_logic.backend_base import BackendBase
from backend_logic.authenticator import Authenticator

from modules.event_categories import EventCategories
from modules.event_images import EventImages
from modules.events import Events
from modules.feedback import Feedback
from modules.registrations import Registrations
from modules.users import Users

# 25.02.24
# Mir Shukhman
# Defining class UserBackend wich will inherits from BackendBase class.
# Every use of one of UserBackend's funcs will be logged in 'log.json' in format:
#       id(Auto-generated), dattime(Auto-generated), class_name, func_name, func_input, func_output

class UserBackend(BackendBase):
    def __init__(self, token_filepath):
        # Inherts FacadeBase init
        super().__init__()
        self.class_name=self.__class__.__name__
        # Instance of Authenticator class with recived token_filepath in init
        self.authenticator = Authenticator(token_filepath)
        # Calling Authenticator class funcs to get and save in init user's data.
        self.name = self.authenticator.get_user_fullname()
        self.id = self.authenticator.get_user_id()
        self.is_master = self.authenticator.get_master_approval()
        
    def _get_authentication(self,front_end_token):
        '''
        Mir Shukhman
        Inner func to get user authentication, calls authenticate_user func fron 
        authenticator class, passes it inputed front_end_token, Returns True/False.
        Input: front_end_token
        Output: True/False
        '''
        try:
            ok = self.authenticator.authenticate_user(front_end_token)
            if ok:
                self.logger.log(self.class_name,'_get_authentication', front_end_token, True)
                return True
            else:
                self.logger.log(self.class_name,'_get_authentication', front_end_token, False)
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'_get_authentication', front_end_token, str(e))
            return False 
        
           
    def get_user(self, front_end_token):
        '''
        Mir Shukhman
        Get current users info using self.id saved in init, gets ok from _get_authentication,
        calls get_by_id func from users_repo.
        Input: front_end_token
        Output: user obj/None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                user= self.users_repo.get_by_id(self.id)
                if user:
                    self.logger.log(self.class_name,'get_user', self.id, user)
                    return user

            else:
                self.logger.log(self.class_name,'get_user', (self.id,front_end_token), 'authentication fail/no user by id')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_user', (self.id,front_end_token), str(e))
            return None          
        
        
    def change_password(self, * ,front_end_token, old_pass, new_pass):
        '''
        Mir Shukhman
        Func to update password, gets ok from _get_authentication, calls get_user func,
        retrives db_pass from recived user obj, hashes new pass using bcrypt.generate_password_hash,
        returns (True, None). If err returns (False, err)
        Input: front_end_token, old_pass, new_pass
        Output: tupple (True/False,err_msg)
        '''
        err_msg = None
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                user=self.get_user(front_end_token)
                db_pass= user.PasswordHash
                if db_pass:
                    if self._check_password(db_pass, old_pass):
                        hashed_new_pass=bcrypt.generate_password_hash(new_pass).decode('utf-8')
                        update=self.users_repo.update(self.id,{'PasswordHash':hashed_new_pass})
                        if update:
                           return (True, err_msg)
                        else:
                            self.logger.log(self.class_name,'change_password', self.id, err_msg)
                            err_msg = 'Eror Updating. Try Again Later.'
                            return (False, err_msg)
                    else:
                        err_msg = 'Wrong Old Password.'
                        return (False, err_msg) 
            else:
                self.logger.log(self.class_name,'change_password', (self.id,front_end_token), err_msg)
                err_msg = 'Eror Updating. Try Again Later.'
                return (False, err_msg)
            
        except Exception as e:
            self.logger.log(self.class_name,'change_password', (self.id,front_end_token), str(e))
            return (False, str(e))
        
        
    def update_profile(self, * ,front_end_token, password, username,
                       email, fullname, profile_description):
        """
        27.02.24
        Mir Shukhman
        Update users profile, authenticates front end token against back end token using Authenticator class,
        calls get_user func to get users password from db, calls check_password from BackendBase class,
        calls check_if_user_exists sp to check if user with email or username given exists, and will with proceed
        with the update if either 1.user with such email and username dont exist; 
        or 2. if such user exists but it is the current user updating their own data.
        ;Logging of actions
        Input: front_end_token, password, username,email, fullname, profile_description
                [all params by name]
        Output: True; False
        """
        err_msg = None
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                user=self.get_user(front_end_token)
                db_pass= user.PasswordHash
                if db_pass:
                    if self._check_password(db_pass, password):
                        exists_with_credentials=self.users_repo.get_stored_procedure('check_if_user_exists',
                                                                                     {'username':username, 'email':email})
                        
                        if exists_with_credentials and exists_with_credentials[0][0] == self.id or not exists_with_credentials:
                            update=self.users_repo.update(self.id,{'Username':username,
                                                                    'Email':email,'FullName':fullname,
                                                                    'ProfileDescription':profile_description})
                            if update:
                                self.logger.log(self.class_name,'update_profile', self.id, 'update sucsess')
                                return (True, err_msg)
                            else:
                                self.logger.log(self.class_name,'update_profile', self.id, err_msg)
                                err_msg = 'Eror Updating. Try Again Later.'
                                return (False, err_msg)
                                   
                        else:
                            err_msg = 'User with given email/username exists. Pick differernt email/username.'
                            return (False,err_msg)
                    else:
                        err_msg = 'Wrong Old Password.'
                        return (False,err_msg)
                    
            else:
                self.logger.log(self.class_name,'update_profile', (self.id,front_end_token), err_msg)
                err_msg = 'Eror Updating. Try Again Later.'
                (False,err_msg)
            
        except Exception as e:
            self.logger.log(self.class_name,'update_profile', (self.id,front_end_token), str(e))
            return (False, str(e)) 
     
        
    def my_events(self, front_end_token):
        '''
        Mir Shukhman
        Get current users events using self.id saved in init, gets ok from _get_authentication,
        calls get_my_events db SP.
        Input: front_end_token
        Output: events (list of tupples)/ None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                my_events= self.events_repo.get_stored_procedure('get_my_events',{'organiserID':self.id})
                if my_events:
                    self.logger.log(self.class_name,'my_events', (self.id,front_end_token), my_events)
                    return my_events
                else:
                    self.logger.log(self.class_name,'my_events', (self.id,front_end_token), 'None found')
                    return None
                
            else:
                self.logger.log(self.class_name,'my_events', (self.id,front_end_token), 'authentication fail')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'my_events', (self.id,front_end_token), str(e))
            return None          
        
            
    def add_event(self, * ,front_end_token, title, description, 
                  location, date, time, image, cathegory_id, is_private):
        '''
        Mir Shukhman
        Add event, gets ok from _get_authentication, calls format_datetime func,
        calls add func from events_repo class.
        Input: front_end_token, title, description, 
                location, date, time, image, cathegory_id, is_private
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                datetime=self.format_datetime(date,time)
                private = 1 if is_private else 0
                new_event= self.events_repo.add(Events(Title=title,Description=description,
                                                       Location=location,EventDateTime=datetime,
                                                       EventImage=image,OrganizerID=self.id,
                                                       CategoryID=cathegory_id,IsPrivate=private))
                if new_event:
                    self.logger.log(self.class_name,'add_event', (front_end_token, title, description, 
                  location, date, time, image, cathegory_id, is_private), 'event added')
                    return True
                
            else:
                self.logger.log(self.class_name,'add_event', (self.id, front_end_token, title, description, 
                  location, date, time, image, cathegory_id, is_private), 'authentication fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'add_event', (self.id,front_end_token), str(e))
            return False 
        
        
    def update_event(self,*, front_end_token, event_id, title, description, 
                  location, date, time, image, cathegory_id, is_private):
        '''
        Mir Shukhman
        Update event, gets ok from _get_authentication, calls get_by_id from events_repo class,
        calls format_datetime func, calls update from events_repo class. If events privacy was changed
        from what is saved in db, will call get_registrations_by_event func and for each registration will
        change the Status accordingly ('Pending Approval' if changet to private, 'Approved' if changed to public).
        Input: front_end_token, event_id, title, description, 
                location, date, time, image, cathegory_id, is_private
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                event = self.events_repo.get_by_id(event_id)
                if event and event.OrganizerID == self.id:
                    private = 1 if is_private else 0
                    datetime=self.format_datetime(date,time)
                    updated_event= self.events_repo.update(event_id,{'Title':title,'Description':description,
                                                        'Location':location,'EventDateTime':datetime,
                                                        'EventImage':image,'OrganizerID':self.id,
                                                        'CategoryID':cathegory_id,'IsPrivate':private})
                    if is_private == True and event.IsPrivate==0:
                        registrered = self.get_registrations_by_event(front_end_token,event_id)
                        if registrered:
                            for registration in registrered:
                                self.registrations_repo.update(registration[0],{'Status':'Pending Approval'})
                                
                    if is_private == False and event.IsPrivate==1:
                        registrered = self.get_registrations_by_event(front_end_token,event_id)
                        if registrered:
                            for registration in registrered:
                                self.registrations_repo.update(registration[0],{'Status':'Approved'})
                        
                    if updated_event:
                        self.logger.log(self.class_name,'update_event', (front_end_token, event_id, title, description, 
                            location, date, time, image, cathegory_id, is_private), 'event updated')
                        return True
                    
            else:
                self.logger.log(self.class_name,'update_event', (self.id,front_end_token),
                                'authentication fail/userId != organiser id/No event found/update event err')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'update_event', (self.id,front_end_token), str(e))
            return False  
        
        
    def cancel_event(self, front_end_token,event_id):
        '''
        Mir Shukhman
        Cancel event, gets ok from _get_authentication, calls get_by_id from events_repo class,
        calls update from events_repo class and updates IsCanceled to True. Calls get_registrations_by_event func
        and for each registration will change the Status to 'Event Canceled'.
        Input: front_end_token, event_id
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                event = self.events_repo.get_by_id(event_id)
                if event and event.OrganizerID == self.id:
                    cancel_event= self.events_repo.update(event_id,{'IsCanceled':1})
            
                    registrered = self.get_registrations_by_event(front_end_token,event_id)
                    if registrered:
                        for registration in registrered:
                            self.registrations_repo.update(registration[0],{'Status':'Event Canceled'})
                    
                    if cancel_event:
                        self.logger.log(self.class_name,'cancel_event', (front_end_token, event_id), 'event canceled')
                        return True
                    
            else:
                self.logger.log(self.class_name,'cancel_event', (self.id,front_end_token),
                                'authentication fail/userId != organiser id or No event found/event canceled')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'cancel_event', (self.id,front_end_token), str(e))
            return False  
                 

    def get_registrations_by_event (self, front_end_token, event_id):
        '''
        Mir Shukhman
        Get registrations to certain event by event_id, for organiser use, gets ok from _get_authentication, calls my_events func,
        checks that event with given event_id is in my_events, calls get_registrations_by_event db SP.
        Input: front_end_token, event_id
        Output: registrations(list of tupples)/None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                my_events= self.my_events(front_end_token)
                for event in my_events:
                    if event[6] == self.id:
                        registrations=self.feedback_repo.get_stored_procedure('get_registrations_by_event',{'eventID':event_id})
                        if registrations:
                            self.logger.log(self.class_name,'get_registrations_by_event', (event_id,front_end_token), registrations)
                            return registrations
                
            else:
                self.logger.log(self.class_name,'get_registrations_by_event',(front_end_token,event_id), 'authentication fail/none found/not organiser')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_registrations_by_event', (front_end_token,event_id), str(e))
            return None 
        
    
    def my_registrations(self, front_end_token):
        '''
        Mir Shukhman
        Get current users registrations using self.id saved in init, gets ok from _get_authentication,
        calls get_my_registrations db SP.
        Input: front_end_token
        Output: registrations (list of tupples)/ None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                registrations=self.events_repo.get_stored_procedure('get_my_registrations',{'atendieeID':self.id})
                if registrations:
                    self.logger.log(self.class_name,'my_registrations', (self.id,front_end_token), registrations)
                    return registrations
                
                else:
                    self.logger.log(self.class_name,'my_registrations', (self.id,front_end_token), 'None found')
                    return None
            
            else:
                self.logger.log(self.class_name,'my_registrations', (self.id,front_end_token), 'authentication fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'my_registrations', (self.id,front_end_token), str(e))
            return False 
            
            
    def my_attended_events(self, front_end_token):
        '''
        Mir Shukhman
        Get current users attended events using self.id saved in init, gets ok from _get_authentication,
        calls get_my_attended db SP.
        Input: front_end_token
        Output: attended (list of tupples)/ None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                attended=self.events_repo.get_stored_procedure('get_my_attended',{'atendieeID':self.id})
                if attended:
                    self.logger.log(self.class_name,'my_attended_events', (self.id,front_end_token), attended)
                    return attended
                
                else:
                    self.logger.log(self.class_name,'my_attended_events', (self.id,front_end_token), 'None found')
                    return None
            
            else:
                self.logger.log(self.class_name,'my_attended_events', (self.id,front_end_token), 'authentication fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'my_attended_events', (self.id,front_end_token), str(e))
            return False 
            
       
    def register_to_event(self, front_end_token,event_id):
        '''
        Mir Shukhman
        Add registration to event, gets ok from _get_authentication, calls get_by_id from events_repo,
        checkes event not canceled, calls check_if_registered db SP, sets Status to Approved if event is public
        or to Pending Approval if event is private, calls add func from registrations_repo class.
        Input: front_end_token, event_id
        Output: tupple (status,err_msg)
        '''
        err_msg= None
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                event=self.events_repo.get_by_id(event_id)
                if event and event.IsCanceled==False:
                    is_registered= self.events_repo.get_stored_procedure('check_if_registered',
                                                                         {'userID':self.id,'eventID':event_id})
                    if is_registered:
                        err_msg= "You Are Already Registered for the Event!"
                        return (False, err_msg)
                    
                    status = 'Pending Approval' if event.IsPrivate else "Approved"
                    current_datetime = datetime.now()
                    registration= self.registrations_repo.add(Registrations(EventID=event_id,UserID=self.id,
                                                                            RegistrationDateTime=current_datetime,
                                                                            Status=status))
                    if registration:
                        self.logger.log(self.class_name,'register_to_event', (self.id,front_end_token,event_id),
                                        (status,'registered'))
                        return (status, err_msg)
                    else:
                        self.logger.log(self.class_name,'register_to_event', (self.id,front_end_token,event_id), err_msg)
                        err_msg = 'Eror Registering to the Event. Try Again Later.'
                        return (False, err_msg)
                else:
                    self.logger.log(self.class_name,'register_to_event', (self.id,front_end_token,event_id), err_msg)
                    err_msg = 'The event You wish to Register for is Canceled or Does Not Exist.'
                    return (False, err_msg)
            else:
                self.logger.log(self.class_name,'register_to_event', (self.id,front_end_token), err_msg)
                err_msg = 'Eror Registering to the Event. Try Again Later.'
                return (False, err_msg)
            
        except Exception as e:
            self.logger.log(self.class_name,'register_to_event', (self.id,front_end_token), str(e))
            return (False, str(e))
        
        
    def cancel_registration_to_event(self, front_end_token, event_id):
        '''
        Mir Shukhman
        Delete registration to event, gets ok from _get_authentication, calls my_registrations func, checks that there is 
        a registration with inputed event_id in my_registrations, calls remove func from registrations_repo.
        Input: front_end_token, event_id
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                registrations= self.my_registrations(front_end_token)
                if registrations:
                    for registration in registrations:
                        if registration.EventID == event_id:
                            cancel = self.registrations_repo.remove(registration.RegistrationID)
                            if cancel:
                                return True
            else:
                self.logger.log(self.class_name,'cancel_registration_to_event', (self.id,front_end_token,event_id),
                                'authentication fail/no registration/cancel fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'cancel_registration_to_event', (self.id,front_end_token), str(e))
            return False 
        
        
    def decline_registration(self,front_end_token, registration_id):
        '''
        Mir Shukhman
        Decline registration to private event, gets ok from _get_authentication, calls get_by_id from 
        registrations_repo class and get_by_id from events_repo, ensures organiserID matches self.id, 
        and that event is set to private, calls update from registrations_repo and sets Status to Declined.
        Input: front_end_token, registration_id
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                registration = self.registrations_repo.get_by_id(registration_id)
                event = self.events_repo.get_by_id(registration.EventID)
                if event.OrganizerID == self.id and event.IsPrivate:
                    decline = self.registrations_repo.update(registration_id,{'Status': 'Declined'})
                    if decline:
                        return True
            else:
                self.logger.log(self.class_name,'decline_registration', (self.id,front_end_token,registration_id),
                                'authentication fail/no registration/decline fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'decline_registration', (self.id,front_end_token), str(e))
            return False 
        
        
    def approve_registration(self,front_end_token, registration_id):
        '''
        Mir Shukhman
        Approve registration to private event, gets ok from _get_authentication, calls get_by_id from 
        registrations_repo class and get_by_id from events_repo, ensures organiserID matches self.id, 
        and that event is set to private, calls update from registrations_repo and sets Status to Approved.
        Input: front_end_token, registration_id
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                registration = self.registrations_repo.get_by_id(registration_id)
                event = self.events_repo.get_by_id(registration.EventID)
                if event.OrganizerID == self.id and event.IsPrivate:
                    approve = self.registrations_repo.update(registration_id,{'Status': 'Approved'})
                    if approve:
                        return True
            else:
                self.logger.log(self.class_name,'approve_registration', (self.id,front_end_token,registration_id),
                                'authentication fail/no registration/approve fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'approve_registration', (self.id,front_end_token), str(e))
            return False 
        
        
    def add_feedback(self, *,front_end_token, event_id, raiting, comment):
        '''
        Mir Shukhman
        Add feedback for attendiee after event, gets ok from _get_authentication,
        calls get_by_id func from events_repo, checks that event has passed and has not been canceled,
        calls my_attended_events func and checks the event with event_id given is in my_attended_events
        and that registration is Approved, calls add func from feedback_repo.
        Input: front_end_token, event_id, raiting, comment
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                event = self.events_repo.get_by_id(event_id)
                current_datetime = datetime.now()
                event_datetime = event.EventDateTime
                if event_datetime < current_datetime and not event.IsCanceled:
                    registrations = self.my_attended_events(front_end_token)
                    for registration in registrations:
                        if registration[1] == event_id and registration[4] == 'Approved':
                            feedback = self.feedback_repo.add(Feedback(RegistrationID= registration[0],
                                                                    Raiting=raiting, Comment=comment,
                                                                    SubmittionDateTime= current_datetime))
                            if feedback:
                                self.logger.log(self.class_name,'add_feedback', (self.id,front_end_token
                                                                                 ,event_id,raiting,comment), 'feedback added')
                                return True
                            
            else:
                self.logger.log(self.class_name,'add_feedback', (self.id,front_end_token,event_id), 
                                'authentication fail/event is yet to happen/canceled/adding fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'add_feedback', (self.id,front_end_token), str(e))
            return False 
        
        
    def update_feedback(self, *,front_end_token, feedback_id, raiting, comment):
        '''
        Mir Shukhman
        Change feedback for attendiee after event, gets ok from _get_authentication,
        calls get_by_id func from feedback_repo and my_attended_events func, checks 
        there is a registration with id matching one in the feedback, calls update func from feedback_repo class.
        Input: front_end_token, feedback_id, raiting, comment
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                feedback= self.feedback_repo.get_by_id(feedback_id)
                my_registrations= self.my_attended_events(front_end_token)
                for registration in my_registrations:
                    if registration[0] == feedback.RegistrationID:
                        current_datetime = datetime.now()
                        update_feedback = self.feedback_repo.update(feedback_id,{'Raiting':raiting, 'Comment':comment,
                                                                                'SubmittionDateTime':current_datetime})
                        if update_feedback:
                            self.logger.log(self.class_name,'update_feedback', (self.id,front_end_token,feedback_id,raiting,comment),
                                            'updated')
                            return True
            else:
                self.logger.log(self.class_name,'update_feedback', (self.id,front_end_token,feedback_id), 
                                'authentication fail/update fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'update_feedback', (self.id,front_end_token), str(e))
            return False 
        
        
    def delete_feedback(self,front_end_token, feedback_id):
        '''
        Mir Shukhman
        Delete feedback for attendiee after event, gets ok from _get_authentication,
        calls get_by_id func from feedback_repo and my_attended_events func, checks 
        there is a registration with id matching one in the feedback, calls remove func from feedback_repo class.
        Input: front_end_token, feedback_id
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                feedback= self.feedback_repo.get_by_id(feedback_id)
                my_registrations= self.my_attended_events(front_end_token)
                
                for registration in my_registrations:
                    if registration[0] == feedback.RegistrationID:
                        delete_feedback = self.feedback_repo.remove(feedback_id)

                        if delete_feedback:
                            self.logger.log(self.class_name,'delete_feedback', (self.id,front_end_token,feedback_id), 'removed')
                            return True
            else:
                self.logger.log(self.class_name,'delete_feedback', (self.id,front_end_token,feedback_id), 'authentication fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'delete_feedback', (self.id,front_end_token), str(e))
            return False 
        
        
    def add_event_image_attendee(self, *,front_end_token, event_id, image):
        '''
        Mir Shukhman
        Add event image for attendiee after event, gets ok from _get_authentication,
        calls get_by_id func from events_repo, cheks event has passed and wasnt canceled, calls
        my_attended_events and checks event with id given is in my_attended_events and registration
        status is Approved, calls add func from images_repo.
        Input: front_end_token, event_id, image
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                event = self.events_repo.get_by_id(event_id)
                current_datetime = datetime.now()
                event_datetime = event.EventDateTime
                if event_datetime < current_datetime and not event.IsCanceled:
                    attended = self.my_attended_events(front_end_token)
                    for event in attended:
                        if event[1] == event_id and event[4] == 'Approved':
                            add_image = self.images_repo.add(EventImages(EventID=event_id,
                                                                         Image=image,UserID=self.id,
                                                                         SubmittionDateTime=current_datetime))
                            if add_image:
                                self.logger.log(self.class_name,'add_event_image_attendee', (self.id,front_end_token
                                                                                 ,event_id), 'image added')
                                return True
                            
            else:
                self.logger.log(self.class_name,'add_event_image_attendee', (self.id,front_end_token,event_id), 
                                'authentication fail/event is yet to happen/canceled/adding fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'add_event_image_attendee', (self.id,front_end_token), str(e))
            return False
        
        
    def add_event_image_organiser(self, *,front_end_token, event_id, image):
        '''
        Mir Shukhman
        Add event image for organiser after event, gets ok from _get_authentication,
        calls get_by_id func from events_repo, cheks event has passed and wasnt canceled and organiser ID matches
        self.id, calls add func from images_repo.
        Input: front_end_token, event_id, image
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                event = self.events_repo.get_by_id(event_id)
                current_datetime = datetime.now()
                event_datetime = event.EventDateTime
                if event_datetime < current_datetime and not event.IsCanceled and event.OrganizerID == self.id:
                    add_image = self.images_repo.add(EventImages(EventID=event_id,
                                                                    Image=image,UserID=self.id,
                                                                    SubmittionDateTime=current_datetime))
                    if add_image:
                        self.logger.log(self.class_name,'add_event_image_organiser', (self.id,front_end_token
                                                                            ,event_id),  'image added')
                        return True
                            
            else:
                self.logger.log(self.class_name,'add_event_image_organiser', (self.id,front_end_token,event_id), 
                                'authentication fail/event is yet to happen/canceled/adding fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'add_event_image_organiser', (self.id,front_end_token), str(e))
            return False
        
        
    def delete_image(self,front_end_token, image_id):
        '''
        Mir Shukhman
        Delete event image, gets ok from _get_authentication, calls get_by_id func from images_repo, 
        checksuser ID matches self.id, calls remove func from images_repo.
        Input: front_end_token, image_id
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                image = self.images_repo.get_by_id(image_id)
                if image.UserID == self.id:
                    delete= self.images_repo.remove(image_id)
                    if delete:
                        self.logger.log(self.class_name,'delete_image', (self.id,front_end_token,image_id), 'deleted')
                        return True
            else:
                self.logger.log(self.class_name,'delete_image', (self.id,front_end_token,image_id), 'authentication fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'delete_image', (self.id,front_end_token), str(e))
            return False 
       
        
    def check_affiliation_to_event(self, front_end_token, event_id):
        '''
        Mir Shukhman
        Cheks if user has ary affiliation to the evnt with given id (regstrered, attended, organised). Gets ok from _get_authentication,
        first calls my_events func and if the evnt with given id is in my_events and if so returns "Organiser", if not calls my_registrations func and if
        the evnt with given id is in my_registrations and if so returns "Registered", if not calls my_attended_events func and if the evnt with given id is
        in my_attended_events and if so returns "Registered", if not returns str "None".
        Input: front_end_token, event_id
        Output: str("Organiser","Registered","Attended","None")/None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                my_events = self.my_events(front_end_token)
                if my_events:
                    for event in my_events:
                        if event[0] == event_id:
                            self.logger.log(self.class_name,'check_affiliation_to_event', (front_end_token,event_id),'Organiser')
                            return "Organiser"
                
                my_registrations = self.my_registrations(front_end_token)
                if my_registrations:
                    for event in my_registrations:
                        if event[1] == event_id:
                            self.logger.log(self.class_name,'check_affiliation_to_event', (front_end_token,event_id),'Registered')
                            return "Registered"
                        
                attended = self.my_attended_events(front_end_token)
                if attended:
                    for event in attended:
                        if event[1] == event_id:
                            self.logger.log(self.class_name,'check_affiliation_to_event', (front_end_token,event_id),'Attended')
                            return "Attended"

                else:
                    self.logger.log(self.class_name,'check_affiliation_to_event', (front_end_token,event_id),'None')
                    return "None"
                            
            else:
                self.logger.log(self.class_name,'check_affiliation_to_event', (front_end_token,event_id),'authentication fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'check_affiliation_to_event', (front_end_token), str(e))
            return False  
         
         
    # Master Functionality

    def get_all_users(self,front_end_token):
        '''
        Mir Shukhman
        Get all users, gets ok from _get_authentication and enshures self.is_master=True,
        calls get_all from users_repo class.
        Input: front_end_token
        Output: users(list of user obj)/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                users = self.users_repo.get_all()
                if users:
                    self.logger.log(self.class_name,'get_all_users', (self.id,front_end_token), users)
                    return users
                
            else:
                self.logger.log(self.class_name,'get_all_users', (self.id,front_end_token), 'authentication fail/none found')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'get_all_users', (self.id,front_end_token), str(e))
            return False 
        
      
    def get_user_by_params(self, *,front_end_token, user_id,username,
                           email,name):
        '''
        Mir Shukhman
        Get users by parameters, gets ok from _get_authentication and enshures self.is_master=True,
        calls custom_search from repo class.
        Input: front_end_token,user_id,username,email,name
        Output: users(list of tuples)/False
        '''      
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:     
                users=self.users_repo.custom_search("Users",{"UserID":user_id,"Username":username,"Email":email,
                                                                "FullName":name})
                if users:
                    self.logger.log(self.class_name,'get_user_by_params', (front_end_token, user_id,username,
                                                                        email,name), users)
                    return users
            else:
                self.logger.log(self.class_name,'get_user_by_params', (self.id,front_end_token), 'authentication fail/none found')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'get_user_by_params', (self.id,front_end_token), str(e))
            return False 
        
        
    def get_all_admins(self,front_end_token):
        '''
        Mir Shukhman
        Get all admins, gets ok from _get_authentication and enshures self.is_master=True,
        calls get_all from users_repo class, filters users by IsMasterUser=True.
        Input: front_end_token
        Output: users(list of user objs)/False
        '''      
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                users = self.users_repo.get_all()
                if users:
                    admins= [user for user in users if user.IsMasterUser]
                    if admins:
                        self.logger.log(self.class_name,'get_all_admins', (self.id,front_end_token), admins)
                        return admins
                
            else:
                self.logger.log(self.class_name,'get_all_admins', (self.id,front_end_token), 'authentication fail/none found')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'get_all_admins', (self.id,front_end_token), str(e))
            return False     
        
            
    def add_master_user(self,front_end_token, user_id):
        '''
        Mir Shukhman
        Add admin, gets ok from _get_authentication and enshures self.is_master=True,
        calls update func  from users_repo class, sets IsMasterUser to True.
        Input: front_end_token
        Output: True/False
        '''   
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                set_as_master = self.users_repo.update(user_id,{'IsMasterUser':True})
                if set_as_master:
                    self.logger.log(self.class_name,'add_master_user', (self.id,front_end_token,user_id), 'sucsess')
                    return True
                
            else:
                self.logger.log(self.class_name,'add_master_user', (self.id,front_end_token,user_id), 'authentication/add_master fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'add_master_user', (self.id,front_end_token), str(e))
            return False         
        
   
    def remove_master_user(self,front_end_token, user_id):
        '''
        Mir Shukhman
        Add admin, gets ok from _get_authentication and enshures self.is_master=True,
        calls update func  from users_repo class, sets IsMasterUser to False.
        Input: front_end_token
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                remove_master = self.users_repo.update(user_id,{'IsMasterUser':False})
                if remove_master:
                    self.logger.log(self.class_name,'remove_master_user', (self.id,front_end_token,user_id), 'sucsess')
                    return True
                
            else:
                self.logger.log(self.class_name,'remove_master_user', (self.id,front_end_token,user_id), 'authentication/remove_master_user fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'remove_master_user', (self.id,front_end_token), str(e))
            return False
        
         
    def disactivate_user(self,front_end_token, user_id):
        '''
        Mir Shukhman
        Add admin, gets ok from _get_authentication and enshures self.is_master=True and that the user being disacivated
        id is not self.id (to prevent user from disactivatig oneself), calls update func  from users_repo class, 
        sets IsActive to False.
        Input: front_end_token
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master and self.id != user_id:
                disactivate = self.users_repo.update(user_id,{'IsActive':False})
                if disactivate:
                    self.logger.log(self.class_name,'disactivate_user', (self.id,front_end_token,user_id), 'disactivated')
                    return True
                
            else:
                self.logger.log(self.class_name,'disactivate_user', 
                                (self.id,front_end_token,user_id), 'authentication/disactivate fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'disactivate_user', (self.id,front_end_token), str(e))
            return False      
   
        
    def reactivate_user(self,front_end_token, user_id):
        '''
        Mir Shukhman
        Add admin, gets ok from _get_authentication and enshures self.is_master=True and that the user being disacivated
        id is not self.id (to prevent user from reactivaing oneself), calls update func from users_repo class, 
        sets IsActive to True.
        Input: front_end_token
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master and self.id != user_id:
                reactivate = self.users_repo.update(user_id,{'IsActive':True})
                if reactivate:
                    self.logger.log(self.class_name,'reactivate_user', (self.id,front_end_token,user_id), 'reactivated')
                    return True
                
            else:
                self.logger.log(self.class_name,'reactivate_user', 
                                (self.id,front_end_token,user_id), 'authentication/reactivate fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'reactivate_user', (self.id,front_end_token), str(e))
            return False 
        
          
    def get_all_events(self,front_end_token):
        '''
        Mir Shukhman
        Get all users, gets ok from _get_authentication and enshures self.is_master=True,
        calls get_all from events_repo class.
        Input: front_end_token
        Output: events(list of event obj)/None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                all_events= self.events_repo.get_all()
                if all_events:
                    self.logger.log(self.class_name,'get_all_events', (self.id,front_end_token), all_events)
                    return all_events             
            else:
                self.logger.log(self.class_name,'get_all_events', (self.id,front_end_token), 'authentication fail/none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_all_events', (self.id,front_end_token), str(e))
            return None 
        

    def get_all_categories_admin(self,front_end_token):
        '''
        Mir Shukhman
        Get all categories and the amount to events for each cat, gets ok from _get_authentication and enshures 
        self.is_master=True, calls get_all from categories_repo class, and for each category calls count_events_by_category
        db SP, and creates a dict of category obj as keys and event count as vals : {'category obj': event count}.
        Input: front_end_token
        Output: dict of {'category obj': event count}/None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                all_categories= self.categories_repo.get_all()
                if all_categories:
                    categories_and_count={}
                    for cat in all_categories:
                        count = self.categories_repo.get_stored_procedure('count_events_by_category',{'cat_id':cat.CategoryID})
                        categories_and_count[cat]=count
                        
                    self.logger.log(self.class_name,'get_all_categories', (self.id,front_end_token), categories_and_count)
                    return categories_and_count             
            else:
                self.logger.log(self.class_name,'get_all_categories', (self.id,front_end_token), 'authentication fail/none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_all_categories', (self.id,front_end_token), str(e))
            return None 
        
        
    def get_events_by_category_admin(self,front_end_token,category_id):
        '''
        Mir Shukhman
        Get all events of certain category, gets ok from _get_authentication and enshures self.is_master=True,
        calls get_events_by_category db SP.
        Input: front_end_token
        Output: events_by_category(list of tupples)/None
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                events_by_category= self.categories_repo.get_stored_procedure('get_events_by_category',
                                                                              {'cat_id':category_id})
                
                if events_by_category:   
                    self.logger.log(self.class_name,'get_events_by_category_admin', 
                                    (self.id,front_end_token,category_id), events_by_category)
                    return events_by_category             
            else:
                self.logger.log(self.class_name,'get_events_by_category_admin', 
                                (self.id,front_end_token,category_id), 'authentication fail/none found')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_events_by_category_admin', (self.id,front_end_token), str(e))
            return None 

          
    def add_category(self, *, front_end_token, category, description):
        '''
        Mir Shukhman
        Add event category, gets ok from _get_authentication and enshures self.is_master=True,
        calls add func from categories_repo.
        Input: front_end_token, category, description
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                new_category = self.categories_repo.add(EventCategories(EventCategory=category,
                                                                        Description=description))
                if new_category:
                    self.logger.log(self.class_name,'add_category',
                                    (self.id,front_end_token,category,description), 'added')
                    return True
                
            else:
                self.logger.log(self.class_name,'add_category', (self.id,front_end_token), 'authentication/adding fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'add_category', (self.id,front_end_token), str(e))
            return False 
        
        
    def update_category(self, *, front_end_token, category_id, category, description):
        '''
        Mir Shukhman
        Update event category, gets ok from _get_authentication and enshures self.is_master=True,
        calls update func from categories_repo.
        Input: front_end_token, category_id, category, description
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                update = self.categories_repo.update(category_id,{'EventCategory':category,
                                                                  'Description':description})
                if update:
                    self.logger.log(self.class_name,'update_category',
                        (self.id,front_end_token,category_id,category,description), 'updated')
                    return True
                             
            else:
                self.logger.log(self.class_name,'update_category', (self.id,front_end_token, category_id), 'authentication/update fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'update_category', (self.id,front_end_token), str(e))
            return False 
        
        
    def delete_category(self, front_end_token, category_id):
        '''
        Mir Shukhman
        Delete event category, gets ok from _get_authentication and enshures self.is_master=True,
        calls get_events_by_category_admin to enshure there are no events under the category, 
        calls remove func from categories_repo.
        ***Cannot remove category if there are events under the category!!!***
        Input: front_end_token, category_id
        Output: True/False
        '''
        try:
            ok = self._get_authentication(front_end_token)
            if ok and self.is_master:
                are_events = self.get_events_by_category_admin(front_end_token,category_id)
                
                if are_events:
                    self.logger.log(self.class_name,'delete_category', (self.id,front_end_token,category_id), 'cannot delete cat-events under cat.')
                    return False
                
                else:
                    delete = self.categories_repo.remove(category_id)
                    if delete:
                        self.logger.log(self.class_name,'delete_category',
                            (self.id,front_end_token,category_id), 'deleted')
                        return True
                             
            else:
                self.logger.log(self.class_name,'delete_category', (self.id,front_end_token,category_id), 'authentication/delete fail')
                return False
            
        except Exception as e:
            self.logger.log(self.class_name,'delete_category', (self.id,front_end_token), str(e))
            return False 