
import jwt
import json
from app import create_app
from app import bcrypt

# 25.02.24
# Mir Shukhman
# Defining class Authenticator witch will authenticate users using encryptted and jwt encoded token
# saved in frontend, and jwt encoded token saved in json file in backend.
# Also will retrive user data from the encoded backend token (ID, name, role) for backend use.

class Authenticator:
    def __init__(self, file_path):
        # Saves file path of json with encoded backend token as part of init
        self.file_path = file_path
    
    
    def _read_and_decode_jwt(self):
        '''
        Mir Shukhman
        Func to decode jwt token from init file path
        Output: decoded token 
        '''
        try:
            with open(self.file_path, 'r') as json_file:
                token = json.load(json_file)
                secret_key = create_app().config['SECRET_KEY']
                decoded_data = jwt.decode(token, secret_key, algorithms=['HS256'])
                return decoded_data
            
        except Exception as e:
            return None
        
    
    def authenticate_user(self, front_end_token):
        '''
        Mir Shukhman
        Func to recive user authentication. Gets the backend token from init filepath,
        compares the frontend and backend token using bcrypt check_password_hash func, 
        returns True or False.
        Input: front end token (encrypted, encoded)
        Output: True/False
        '''
        try:
            with open(self.file_path, 'r') as json_file:
                token = json.load(json_file)
            if token:
                authentication=bcrypt.check_password_hash(front_end_token, token)
                if authentication:
                    return True
            else:
                return False
                    
        except Exception as e:
            return False
        
           
    def get_user_id(self):
        '''
        Mir Shukhman
        Func to retrive user ID from backend token. Calls _read_and_decode_jwt
        to decode init file, extracts user ID from the decoded.
        Output: user_id/False
        '''
        try:
            decoded_token= self._read_and_decode_jwt()
            if decoded_token:
                user_id = decoded_token.get('ID', None)
                return user_id
            
            else:
                return False
            
        except Exception as e:
            return False
        
     
    def get_user_fullname(self):
        '''
        Mir Shukhman
        Func to retrive user name from backend token. Calls _read_and_decode_jwt
        to decode init file, extracts user name from the decoded.
        Output: fullname/False
        '''
        try:
            decoded_token= self._read_and_decode_jwt()
            if decoded_token:
                fullname = decoded_token.get('name', None)
                return fullname
            
            else:
                return False
            
        except Exception as e:
            return False
        
           
    def get_master_approval(self):
        '''
        Mir Shukhman
        Func to get master premissins from backend token. Calls _read_and_decode_jwt
        to decode init file, extracts user is_master (Binary:True/False) from the decoded.
        Output: isMaster(True/False)/False
        '''
        try:
            decoded_token= self._read_and_decode_jwt()
            if decoded_token:
                isMaster = decoded_token.get('is_master_user', None)
                return isMaster
            
            else:
                return False
            
        except Exception as e:
            return False
        
        
    