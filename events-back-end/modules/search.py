from sqlalchemy import text
from modules import db

def get_stored_procedure(self, sp_name, parameters):
    try:
        query = text(f"EXEC {sp_name} " + ", ".join([f":{param}" for param in parameters.keys()]))
        
        result = db.session.execute(query, parameters)
        result_set = result.fetchall()
        
        if result_set:
            return result_set
        else:
            return None

    except Exception as e:
        return None
    
    

def search(self, *, event_id=None, title=None, organiser=None, date=None, location=None, type=None):
    try:
        # Prepare the query parameters
        params = {'event_id': event_id,
            'title': title,
            'date': date,
            'location': location,
            'type': type}
        if organiser:
            # If organiser is provided, find its ID
            query = text("SELECT u.UserID FROM Users u WHERE u.FullName = :organiser")
            result = db.session.execute(query, {'organiser': organiser})
            organiser_id = result.scalar()  # Fetch a single value
            params['organiser_id'] = organiser_id
        
        columns_dict = {
            'event_id': 'EventID',
            'title': 'Title',
            'organiser_id': 'OrganizerID',
            'date': 'EventDateTime',
            'location': 'Location',
            'type': 'CategoryID'
        }
        
        # Constructing the WHERE clause for the SQL query
        conditions = []
        for param, value in params.items():
            if value is not None:
                # For each parameter that is not None, add it to the conditions list
                conditions.append(f"e.{columns_dict[param]} = :{param}")
        
        # Constructing the final SQL query
        where_clause = " AND ".join(conditions)
        query = text(f"SELECT * FROM Events e WHERE {where_clause}")

        # Executing the SQL query with parameters
        result = db.session.execute(query, params)
        events = result.fetchall()

        return events

    except Exception as e:
        # Handle exceptions
        print(f"An error occurred: {e}")
        return None
        
   
   
   
   
   
   """
	select * from Events e
    WHERE (@event_id IS NULL OR e.EventID = @event_id)
      AND (@title IS NULL OR e.Title = @title)
      AND (@organiserID IS NULL OR e.OrganizerID = @organiserID)
      AND (@date IS NULL OR CONVERT(DATE, e.EventDateTime) = @date)
      AND (@location IS NULL OR e.Location = @location)
      AND (@type IS NULL OR e.CategoryID = @type);"""   
        
