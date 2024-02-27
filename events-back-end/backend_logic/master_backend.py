
from backend_logic.backend_base import BackendBase

class MasterBackend(BackendBase):
    def __init__(self, token_filepath):
        # Inherts FacadeBase init, 
        # LoginToken class instanse to acsess getter setter funcs from the class
        super().__init__()