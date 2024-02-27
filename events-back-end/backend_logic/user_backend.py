
from backend_logic.backend_base import BackendBase
from backend_logic.authenticator import Authenticator

class UserBackend(BackendBase):
    def __init__(self, token_filepath):
        # Inherts FacadeBase init, 
        # LoginToken class instanse to acsess getter setter funcs from the class
        super().__init__()
        self.class_name=self.__class__.__name__
        self.authenticator = Authenticator(token_filepath)
        self.name = self.authenticator.get_user_fullname()
        self.id = self.authenticator.get_user_id()
        
    def _get_authentication(self,front_end_token):
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
        try:
            ok = self._get_authentication(front_end_token)
            if ok:
                user= self.users_repo.get_by_id(self.id)
                if user:
                    self.logger.log(self.class_name,'get_user', self.id, user)
                    return user
                else:
                    self.logger.log(self.class_name,'get_user', self.id, 'none found')
                    return None
            else:
                self.logger.log(self.class_name,'get_user', (self.id,front_end_token), 'authentication fail')
                return None
            
        except Exception as e:
            self.logger.log(self.class_name,'get_user', (self.id,front_end_token), str(e))
            return False           