
from flask import Flask, Blueprint, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from base64 import b64decode
import base64

from backend_logic.backend_base import BackendBase
from backend_logic.user_backend import UserBackend

class Routes(Blueprint):
    def __init__(self, name, import_name):
        super().__init__(name, import_name)
        self.route('/login', methods=['POST'])(self.login)
        self.route('/signup', methods=['POST'])(self.signup)
        self.route('/logout', methods=['POST'])(self.logout)
        self.route('/search_event', methods=['POST'])(self.search_event)
        self.route('/get_event_by_id/<int:event_id>', methods=['POST'])(self.get_event_by_id)
        self.route('/get_registrations/<int:event_id>', methods=['POST'])(self.get_registrations)
        self.route('/get_reviews/<int:event_id>', methods=['GET'])(self.get_reviews)
        self.route('/delete_review/<int:review_id>', methods=['DELETE'])(self.delete_review)
        self.route('/add_review/<int:event_id>', methods=['POST'])(self.add_review)
        self.route('/reviews/<int:review_id>', methods=['PUT'])(self.update_review)
        self.route('/get_images/<int:event_id>', methods=['GET'])(self.get_images)
        self.route('/delete_image/<int:image_id>', methods=['DELETE'])(self.delete_image)
        self.route('/add_image/<int:event_id>', methods=['POST'])(self.add_image)
        self.route('/my_events', methods=['POST'])(self.my_events)
        self.route('/add_event', methods=['POST'])(self.add_event)
        self.route('/cancel_event/<int:event_id>', methods=['PUT'])(self.cancel_event)
        self.route('/update_event/<int:event_id>', methods=['PUT'])(self.update_event)
        self.route('/approve_registration/<int:registeration_id>', methods=['PUT'])(self.approve_registration)
        self.route('/decline_registration/<int:registeration_id>', methods=['PUT'])(self.decline_registration)
        self.route('/my_registrations', methods=['POST'])(self.my_registrations)
        self.route('/attended', methods=['POST'])(self.attended_events)
        self.route('/get_categories', methods=['GET'])(self.get_categories)
        self.route('/get_user', methods=['POST'])(self.get_user)
        self.route('/get_user_by_id/<int:user_id>', methods=['GET'])(self.get_user_profile_by_id)
        self.route('/update_user', methods=['PUT'])(self.update_user)
        self.route('/change_password', methods=['PUT'])(self.change_password)
        self.route('/register/<int:event_id>', methods=['POST'])(self.register_to_event)
        self.route('/cancel_registeration/<int:event_id>', methods=['POST'])(self.cancel_registration)
        # Master User
        self.route('/all_events', methods=['POST'])(self.all_events)
        self.route('/categories', methods=['POST'])(self.all_categories)
        self.route('/add_category', methods=['POST'])(self.add_category)
        self.route('/get_events_by_category/<int:cat_id>', methods=['POST'])(self.get_events_by_category)
        self.route('/categories/<int:cat_id>', methods=['PUT'])(self.update_category)
        self.route('/categories/<int:cat_id>', methods=['DELETE'])(self.delete_category)
        self.route('/users', methods=['POST'])(self.all_users)
        self.route('/search_user', methods=['POST'])(self.search_user)
        self.route('/disactivate_user/<int:user_id>', methods=['PUT'])(self.disactivate_user)
        self.route('/activate_user/<int:user_id>', methods=['PUT'])(self.activate_user)
        self.route('/admins', methods=['POST'])(self.all_admins)
        self.route('/make_admin/<int:user_id>', methods=['PUT'])(self.add_admin)
        self.route('/revoke_admin/<int:user_id>', methods=['PUT'])(self.revoke_admin)
        self.backend_base = BackendBase()
        self._facade= None
        
    @property
    def facade(self):
        return self._facade
     
    @facade.setter
    def facade(self, new_facade):
        self._facade = new_facade
        
    def login(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided for login'}), 400
            
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return jsonify({'error': 'Incomplete or no data provided for login'}), 400

            user_facade, err, front_end_token = self.backend_base.login(username=username, password=password)           
            
            if err:
                return jsonify({'error': err}), 401
            
            if user_facade and front_end_token:
                self.facade = user_facade
                name = self.facade.name
                is_master= self.facade.is_master
                user_id= self.facade.id
                return jsonify({'front_end_token':front_end_token,'user_id':user_id,'users_name':name,'is_master':is_master}), 201

        except Exception as e:
            return jsonify({'error':str(e)}), 500
      
        
    def signup(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided for signup'}), 400
            
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            name = data.get('name')
            description = data.get('description')

            if not username or not password or not email or not name:
                return jsonify({'error': 'Incomplete or no data provided for signup'}), 400

            add, err = self.backend_base.add_user(username=username, password=password,
                                                  email=email, name=name, description=description)           
            
            if err:
                return jsonify({'error': err}), 400
            
            if add:
                return jsonify({'signup':add}), 201

        except Exception as e:
            return jsonify({'error':str(e)}), 500
        
    
    def logout(self):
        try:
            logout = self.backend_base.logout()
            if logout:
                self.facade = None
                return jsonify({'logged_out':logout}), 201
            else:
                return jsonify({'logged_out': logout}), 400

        except Exception as e:
            return jsonify({'error':str(e)}), 500
    
    
    def search_event(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            event_id = data.get('event_id')
            title = data.get('title')
            organiser = data.get('organiser')
            location = data.get('location')
            date = data.get('date')
            category = data.get('category')

            events_found = self.backend_base.get_event_by_params(event_id=int(event_id) if event_id else None,
                                                                 title=title if title else None,
                                                                 organiser=organiser if organiser else None,
                                                                 date=date if date else None,
                                                                 location=location if location else None,
                                                                 type=int(category) if category else None)
            if events_found: 
                converted_events = []
                for event in events_found:
                    image_data = event[5]
                    organizer = self.backend_base.get_user_by_id(event[6])
                    categoty_name = self.backend_base.get_category_by_id(event[7]) 
                    converted_events.append({
                        'event_id': event[0],
                        'title': event[1],
                        'description': event[2],
                        'location': event[3],
                        'date': event[4].strftime('%d-%m-%Y') if event[4] is not None else None,
                        'time': event[4].strftime('%H:%M') if event[4] is not None else None,
                        'image':  base64.b64encode(image_data).decode('utf-8') if image_data is not None else None,
                        'organizer_id': event[6],
                        'organizer_name': organizer.FullName,
                        'category': categoty_name.EventCategory,
                        'is_private': 'Private' if event[8] else 'Public',
                        'is_canceled': 'Canceled' if event[9] else 'OK'
                    })  
                    
                return jsonify({'found_events':converted_events}), 201
            
            else:
                return jsonify({'found_events':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
    
    
    def get_event_by_id(self,event_id):
        try:   
            event = self.backend_base.get_event_by_id(event_id)
            if event: 
                categoty_name = self.backend_base.get_category_by_id(event.CategoryID)
                organizer = self.backend_base.get_user_by_id(event.OrganizerID)
                image_data = event.EventImage
                converted_event = {
                    'event_id': event.EventID,
                    'title': event.Title,
                    'description': event.Description,
                    'location': event.Location,
                    'date': event.EventDateTime.strftime('%d-%m-%Y') if event.EventDateTime is not None else None,
                    'time': event.EventDateTime.strftime('%H:%M') if event.EventDateTime is not None else None,
                    'image':  base64.b64encode(image_data).decode('utf-8') if image_data is not None else None,
                    'organizer_id': event.OrganizerID,
                    'organizer_name': organizer.FullName,
                    'category_id': event.CategoryID,
                    'category': categoty_name.EventCategory,
                    'category_description': categoty_name.Description,
                    'is_private': 'Private' if event.IsPrivate else 'Public',
                    'is_canceled': 'Canceled' if event.IsCanceled else 'OK'
                } 
                
                data= request.json
                front_end_token = data.get('token')
                if front_end_token:
                    affiliation = self.facade.check_affiliation_to_event(front_end_token, event_id)
                    if affiliation:
                        user_status = affiliation
                else:
                    user_status = 'None'
                
                return jsonify({'event':converted_event,"user_status":user_status}), 201
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       

    def get_registrations(self,event_id):
        try: 
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401 
            
            registrations = self.facade.get_registrations_by_event(front_end_token,event_id)
            if registrations: 
                converted_registrations = []
                for registration in registrations:
                    user = self.backend_base.get_user_by_id(registration[2]) 
                    converted_registrations.append({
                        'registeration_id': registration[0],
                        'name': user.FullName,
                        'date': registration[3].strftime('%d-%m-%Y')  if registration[3] is not None else None,
                        'time': registration[3].strftime('%H:%M') if registration[3] is not None else None,
                        'status': registration[4]
                    })  
                
                print(registrations)
                print(converted_registrations)
                return jsonify({'registrations':converted_registrations}), 201
            
            else:
                return jsonify({'registrations':None}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500 

    
    def get_reviews(self,event_id):
        try:         
            reviews = self.backend_base.get_feedback_by_event(event_id)
            
            if reviews: 
                converted_reviews = []
                for review in reviews:
                    user = self.backend_base.get_user_by_id(review[1])
                    converted_reviews.append({
                        'review_id': review[2],
                        'user': user.FullName,
                        'user_id': review[1],
                        'raiting': review[4],
                        'comment': review[5],
                        'date': review[6].strftime('%d-%m-%Y')  if review[6] is not None else None,
                        'time': review[6].strftime('%H:%M') if review[6] is not None else None
                    })  
                    
                return jsonify({'reviews':converted_reviews}), 201
            
            else:
                return jsonify({'reviews':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
       
    def get_images(self,event_id):
        try:         
            images = self.backend_base.get_images_by_event(event_id)
            
            if images: 
                converted_images = []
                for image in images:
                    user = self.backend_base.get_user_by_id(image[3])
                    image_data = image[2]
                    converted_images.append({
                        'image_id': image[0],
                        'user': user.FullName,
                        'user_id': image[3],
                        'image':  base64.b64encode(image_data).decode('utf-8') if image_data is not None else None,
                        'date': image[4].strftime('%d-%m-%Y')  if image[4] is not None else None,
                        'time': image[4].strftime('%H:%M') if image[4] is not None else None
                    })  
                    
                return jsonify({'images':converted_images}), 201
            
            else:
                return jsonify({'images':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
   
    def delete_review(self,review_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            delete = self.facade.delete_feedback(front_end_token,review_id)
            if delete: 
                return jsonify({'delete':True}), 204
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500  
   
   
    def delete_image(self,image_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            delete = self.facade.delete_image(front_end_token,image_id)
            if delete: 
                return jsonify({'delete':True}), 204
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500   
        
     
    def add_image(self,event_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            role = data.get('role')
            image = data.get('image')
            if not front_end_token and role and image:
                return jsonify({'error': 'Authentication Error'}), 401
              
            event_image_binary = b64decode(image)
            if role == 'Organiser':
                add = self.facade.add_event_image_organiser(front_end_token=front_end_token,
                                                            event_id=event_id,
                                                            image=event_image_binary)
            elif role == 'Attendee':
                add = self.facade.add_event_image_attendee(front_end_token=front_end_token,
                                                            event_id=event_id,
                                                            image=event_image_binary)
            if add: 
                return jsonify({'add':True}), 204
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500  
     
    
    def add_review(self, event_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            raiting = data.get('raiting')
            comment = data.get('comment')
            add = self.facade.add_feedback(front_end_token=front_end_token,
                                           event_id=event_id,
                                           raiting=raiting, comment=comment)
            if add: 
                return jsonify({'add':True}), 204
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500  
        
      
    def update_review(self,review_id):      
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            raiting = data.get('raiting')
            comment = data.get('comment')
            
            update = self.facade.update_feedback(front_end_token=front_end_token,
                                                 feedback_id=review_id,
                                                 raiting=raiting, comment=comment)
            if update: 
                return jsonify({'update':True}), 201
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500       
      
        
    def my_events(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            my_events = self.facade.my_events(front_end_token)
            if my_events: 
                converted_events = []
                for event in my_events:
                    categoty_name = self.backend_base.get_category_by_id(event[7])
                    image_data = event[5] 
                    converted_events.append({
                        'event_id': event[0],
                        'title': event[1],
                        'description': event[2],
                        'location': event[3],
                        'date': event[4].strftime('%d-%m-%Y')  if event[4] is not None else None,
                        'time': event[4].strftime('%H:%M') if event[4] is not None else None,
                        'image':  base64.b64encode(image_data).decode('utf-8') if image_data is not None else None,
                        'organizer': event[6],
                        'category': categoty_name.EventCategory,
                        'is_private': 'Private' if event[8] else 'Public',
                        'is_canceled': 'Canceled' if event[9] else 'OK'
                    })  
                    
                return jsonify({'my_events':converted_events}), 201
            
            else:
                return jsonify({'my_events':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
       
    def add_event(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            title = data.get('title')
            description = data.get('description')
            location = data.get('location')
            date = data.get('date')
            time = data.get('time')
            image = data.get('image')
            category = data.get('category')
            is_private = data.get('isPrivate')
            
            if image:
                event_image_binary = b64decode(image)
            else: 
                event_image_binary=None
                
            add = self.facade.add_event(front_end_token=front_end_token, title=title, 
                                        description=str(description), location=location,
                                        date=date, time=time, 
                                        image=event_image_binary, 
                                        cathegory_id=category, is_private=is_private)
            
            if add:  
                return jsonify({'add_event':add}), 201
            
            else:
                return jsonify({'error':'Authentication Error'}), 401

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       

    def cancel_event(self, event_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401

            cancel = self.facade.cancel_event(front_end_token,event_id)
            
            if cancel:  
                return jsonify({'cancel_event':cancel}), 201
            
            else:
                return jsonify({'error':'False'}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
   
    def update_event(self,event_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            title = data.get('title')
            description = data.get('description')
            location = data.get('location')
            date = data.get('date')
            time = data.get('time')
            image = data.get('image')
            category = data.get('category')
            isPrivate =  False if data.get('isPrivate')=='false' else True
           
            if image:
                event_image_binary = b64decode(image)
            else: 
                event_image_binary=None
                
            update_event = self.facade.update_event(front_end_token = front_end_token,
                                                    event_id=event_id, title = title,
                                                    description = str(description), 
                                                    location = location, date=date, 
                                                    time = time, image= event_image_binary,
                                                    cathegory_id=int(category),
                                                    is_private = isPrivate)
            
            if update_event: 
                return jsonify({'update_event':True}), 201
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
 
    def approve_registration(self, registeration_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401

            approve = self.facade.approve_registration(front_end_token,registeration_id)
            
            if approve:  
                return jsonify({'approve':approve}), 201
            
            else:
                return jsonify({'error':'Authentication Error'}), 401

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
        
        
    def decline_registration(self, registeration_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401

            decline = self.facade.decline_registration(front_end_token,registeration_id)
            
            if decline:  
                return jsonify({'decline':decline}), 201
            
            else:
                return jsonify({'error':'Authentication Error'}), 401

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
    
    def my_registrations(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            my_registrations = self.facade.my_registrations(front_end_token)
            if my_registrations:
                registrations_and_events=[]
                for registration in my_registrations:
                    event=self.backend_base.get_event_by_id(registration[1])
                    categoty_name = self.backend_base.get_category_by_id(event.CategoryID)
                    organizer = self.backend_base.get_user_by_id(event.OrganizerID)
                    image_data = event.EventImage
                    registrations_and_events.append({
                        'event_id': event.EventID,
                        'title': event.Title,
                        'description': event.Description,
                        'location': event.Location,
                        'date': event.EventDateTime.strftime('%d-%m-%Y')  if event.EventDateTime is not None else None,
                        'time': event.EventDateTime.strftime('%H:%M') if event.EventDateTime is not None else None,
                        'image':  base64.b64encode(image_data).decode('utf-8') if image_data is not None else None,
                        'organizer_name': organizer.FullName,
                        'category': categoty_name.EventCategory,
                        'is_private': 'Private' if event.IsPrivate else 'Public',
                        'is_canceled': 'Canceled' if event.IsCanceled else 'OK',
                        'registration_id': registration[0],
                        'registration_datetime': registration[3],
                        'registration_status': registration[4]
                    })

                if registrations_and_events:
                    return jsonify({'my_registrations':registrations_and_events}), 201
                    
            else:
                return jsonify({'my_registrations':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
    
    def attended_events(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            attended = self.facade.my_attended_events(front_end_token)
            if attended:
                registrations_and_events=[]
                for registration in attended:
                    event=self.backend_base.get_event_by_id(registration[1])
                    categoty_name = self.backend_base.get_category_by_id(event.CategoryID)
                    organizer = self.backend_base.get_user_by_id(event.OrganizerID)
                    image_data = event.EventImage
                    registrations_and_events.append({
                        'event_id': event.EventID,
                        'title': event.Title,
                        'description': event.Description,
                        'location': event.Location,
                        'date': event.EventDateTime.strftime('%d-%m-%Y')  if event.EventDateTime is not None else None,
                        'time': event.EventDateTime.strftime('%H:%M') if event.EventDateTime is not None else None,
                        'image':  base64.b64encode(image_data).decode('utf-8') if image_data is not None else None,
                        'organizer_name': organizer.FullName,
                        'category': categoty_name.EventCategory,
                        'is_private': 'Private' if event.IsPrivate else 'Public',
                        'is_canceled': 'Canceled' if event.IsCanceled else 'OK',
                        'registration_id': registration[0],
                        'registration_datetime': registration[3],
                    })

                if registrations_and_events:
                    return jsonify({'attended':registrations_and_events}), 201
                    
            else:
                return jsonify({'attended':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500        
        
        
    def get_categories(self):
        try:         
            categories = self.backend_base.get_all_event_categories()
            
            if categories: 
                converted_categories = []
                for category in categories:
                    converted_categories.append({
                        'category_id': category.CategoryID,
                        'category': category.EventCategory,
                        'description': category.Description,
                    })  
                    
                return jsonify({'categories':converted_categories}), 201
            
            else:
                return jsonify({'error':'Authentication Error'}), 401

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
        

    def get_user(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            my_data = self.facade.get_user(front_end_token)
            if my_data: 
                user_data={
                    'user_id': my_data.UserID,
                    'username': my_data.Username,
                    'email': my_data.Email,
                    'name': my_data.FullName,
                    'description': my_data.ProfileDescription 
                }
                    
                return jsonify({'user_data':user_data}), 201
            
            else:
                return jsonify({'error':'Incomplete or no data provided'}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 

    
    def get_user_profile_by_id(self,user_id):
        try:   
            user, events, events_count, attended_count = self.backend_base.get_user_profile_by_id(user_id)
            if user: 
                converted_user = {
                    'user_id': user.UserID,
                    'username': user.Username,
                    'email': user.Email,
                    'name': user.FullName,
                    'description': user.ProfileDescription,
                    'created': user.CreatedAt ,
                    'is_active': "Active" if user.IsActive else "Disactivated",
                    'is_master': "Admin" if user.IsMasterUser else "Regular"
                }
                
                if events:
                    converted_events=[]
                    for event in events:
                        categoty_name = self.backend_base.get_category_by_id(event[7])
                        converted_events.append({
                            'event_id': event[0],
                            'title': event[1],
                            'location': event[3],
                            'date': event[4].strftime('%d-%m-%Y')  if event[4] is not None else None,
                            'time': event[4].strftime('%H:%M') if event[4] is not None else None,
                            'category': categoty_name.EventCategory,
                            'is_private': 'Private' if event[8] else 'Public',
                            'is_canceled': 'Canceled' if event[9] else 'As Planned'
                        })
                        converted_events_count = {'events_count':events_count[0][0]}
                else:
                    converted_events=0
                    converted_events_count=0
                    
                if attended_count:
                    converted_attended_count = {'attended_count':attended_count[0][0]}
                else:
                    converted_attended_count = 0
                
                return jsonify({'user':converted_user,
                                'users_events':converted_events,
                                'users_events_count':converted_events_count,
                                'users_attended_count':converted_attended_count}), 201
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
    
       
    def update_user(self):    
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            username = data.get('username')
            email = data.get('email')
            name = data.get('name')
            description = data.get('description')
            password = data.get('password')

            update, err = self.facade.update_profile(front_end_token=front_end_token,
                                                password=password, username=username,
                                                email=email, fullname=name, 
                                                profile_description=description)
            
            if update:  
                return jsonify({'update_user':update}), 201
            
            else:
                return jsonify({'error':err}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500     
       
  
    def change_password(self):    
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            password = data.get('password')
            new_password = data.get('new_password')

            update_pass, err = self.facade.change_password(front_end_token=front_end_token,
                                                        old_pass=password, new_pass=new_password)         
            if update_pass:  
                return jsonify({'update_password':update_pass}), 201
            
            else:
                return jsonify({'error':err}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500  
  

    def register_to_event(self,event_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            register, err = self.facade.register_to_event(front_end_token,event_id)
            
            if register:  
                return jsonify({'register':register}), 201
            
            else:
                return jsonify({'error':err}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500     
       
       
    def cancel_registration(self,event_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            cancel = self.facade.cancel_registration_to_event(front_end_token,event_id)
            
            if cancel:  
                return jsonify({'cancel':cancel}), 201
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500         

  
    # Master Routes    
    def all_events(self):   
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            all_events = self.facade.get_all_events(front_end_token)
            if all_events: 
                converted_events = []
                for event in all_events:
                    categoty_name = self.backend_base.get_category_by_id(event.CategoryID)
                    organizer = self.backend_base.get_user_by_id(event.OrganizerID)
                    image_data = event.EventImage
                    converted_events.append({
                        'event_id': event.EventID,
                        'title': event.Title,
                        'description': event.Description,
                        'location': event.Location,
                        'date': event.EventDateTime.strftime('%d-%m-%Y')  if event.EventDateTime is not None else None,
                        'time': event.EventDateTime.strftime('%H:%M') if event.EventDateTime is not None else None,
                        'image':  base64.b64encode(image_data).decode('utf-8') if image_data is not None else None,
                        'organizer_id': event.OrganizerID,
                        'organizer_name': organizer.FullName,
                        'category': categoty_name.EventCategory,
                        'is_private': 'Private' if event.IsPrivate else 'Public',
                        'is_canceled': 'Canceled' if event.IsCanceled else 'OK'
                    })  
                    
                return jsonify({'all_events':converted_events}), 201
            
            else:
                return jsonify({'all_events':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500
       
      
    def all_categories(self):     
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            all_categories = self.facade.get_all_categories_admin(front_end_token)
            if all_categories: 
                categories = []
                for category, count in all_categories.items():
                    categories.append({
                        'category_id': category.CategoryID,
                        'name': category.EventCategory,
                        'description': category.Description,
                        'count': count[0][0]
                    })  
                    
                return jsonify({'categories':categories}), 201
            
            else:
                return jsonify({'categories':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
 
 
    def add_category(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            name = data.get('name')
            description = data.get('description')
            
            add = self.facade.add_category(front_end_token=front_end_token,
                                                category=name, description=description)
            if add: 
                return jsonify({'add':True}), 201
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500  
 
 
    def get_events_by_category(self, cat_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            events_by_cat = self.facade.get_events_by_category_admin(front_end_token, cat_id)
            if events_by_cat: 
                converted_events = []
                for event in events_by_cat:
                    image_data = event[5]
                    organizer = self.backend_base.get_user_by_id(event[6])
                    converted_events.append({
                        'event_id': event[0],
                        'title': event[1],
                        'description': event[2],
                        'location': event[3],
                        'date': event[4].strftime('%d-%m-%Y') if event[4] is not None else None,
                        'time': event[4].strftime('%H:%M') if event[4] is not None else None,
                        'image':  base64.b64encode(image_data).decode('utf-8') if image_data is not None else None,
                        'organizer_id': event[6],
                        'organizer_name': organizer.FullName,
                        'is_private': 'Private' if event[8] else 'Public',
                        'is_canceled': 'Canceled' if event[9] else 'OK'
                    })  
                    
                return jsonify({'events_by_cat':converted_events}), 201
            
            else:
                return jsonify({'events_by_cat':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
 
 
    def update_category(self, cat_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            name = data.get('name')
            description = data.get('description')
            
            update_category = self.facade.update_category(front_end_token=front_end_token, category_id=cat_id,
                                                          category=name, description=description)
            if update_category: 
                return jsonify({'update_category':True}), 201
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
       
    def delete_category(self, cat_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            delete_category = self.facade.delete_category(front_end_token=front_end_token, category_id=cat_id)
            if delete_category: 
                return jsonify({'delete_category':True}), 204
            
            else:
                return jsonify({'error':False}), 400

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
 
       
    def all_users(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            all_users = self.facade.get_all_users(front_end_token)
            if all_users: 
                users = []
                for user in all_users:
                    users.append({
                        'user_id': user.UserID,
                        'username': user.Username,
                        'email': user.Email,
                        'name': user.FullName,
                        'description': user.ProfileDescription,
                        'created': user.CreatedAt,
                        'is_active': "Active" if user.IsActive else "Disactivated",
                        'is_master': "Admin" if user.IsMasterUser else "Regular"
                    })  
                    
                return jsonify({'users':users}), 201
            
            else:
                return jsonify({'users':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500
       
      
    def search_user(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            user_id = data.get('user_id')
            username = data.get('username')
            email = data.get('email')
            name = data.get('name')

            users_found = self.facade.get_user_by_params(front_end_token=front_end_token,
                                                               user_id=int(user_id) if user_id else None,
                                                                 username=username if username else None,
                                                                 email=email if email else None,
                                                                 name=name if name else None)
            if users_found: 
                users = []
                for user in users_found:
                    users.append({
                        'user_id': user[0],
                        'username': user[1],
                        'email': user[3],
                        'name': user[4],
                        'description': user[5],
                        'created': user[6],
                        'is_active': "Active" if user[7] else "Disactivated",
                        'is_master': "Admin" if user[8] else "Regular"
                    })  
                    
                return jsonify({'users':users}), 201
            
            else:
                return jsonify({'users':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500
            
       
    def disactivate_user(self, user_id):       
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            disactivate = self.facade.disactivate_user(front_end_token,user_id)
            if disactivate:   
                return jsonify({'disactivate':disactivate}), 201
            
            else:
                return jsonify({'disactivate':False}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500
             
       
    def activate_user(self, user_id):       
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            activate = self.facade.reactivate_user(front_end_token,user_id)
            if activate:   
                return jsonify({'activate':activate}), 201
            
            else:
                return jsonify({'activate':False}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500       
       
       
    def all_admins(self):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            all_admins = self.facade.get_all_admins(front_end_token)
            if all_admins: 
                admins = []
                for admin in all_admins:
                    admins.append({
                        'user_id': admin.UserID,
                        'username': admin.Username,
                        'email': admin.Email,
                        'name': admin.FullName,
                        'description': admin.ProfileDescription,
                        'created': admin.CreatedAt,
                        'is_active': "Active" if admin.IsActive else "Disactivated"
                    })  
                    
                return jsonify({'admins':admins}), 201
            
            else:
                return jsonify({'admins':None}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500 
       
    
    def add_admin(self, user_id):
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            add_admin = self.facade.add_master_user(front_end_token,user_id)
            if add_admin:   
                return jsonify({'add_admin':add_admin}), 201
            
            else:
                return jsonify({'err':False}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500  
          
       
    def revoke_admin(self, user_id):       
        try:
            data= request.json
            if not data:
                return jsonify({'error': 'Incomplete or no data provided'}), 400
            
            front_end_token = data.get('token')
            if not front_end_token:
                return jsonify({'error': 'Authentication Error'}), 401
            
            revoke = self.facade.remove_master_user(front_end_token,user_id)
            if revoke:   
                return jsonify({'revoke':revoke}), 201
            
            else:
                return jsonify({'err':False}), 201

        except Exception as e:
           return jsonify({'error':str(e)}), 500     