use EventHub

GO
CREATE PROCEDURE get_my_events
@organiserID bigint
AS
	select * from Events e
	where OrganizerID = @organiserID

GO
CREATE PROCEDURE count_my_events
@organiserID bigint
AS
    DECLARE @count INT;

    SELECT @count = COUNT(*)
    FROM Events e
    WHERE e.OrganizerID = @organiserID;

    SELECT @count AS EventCount;

GO
ALTER PROCEDURE get_my_registrations
@attendeeID bigint
AS
    SELECT * 
    FROM Registrations r
    INNER JOIN Events e ON e.EventID = r.EventID
    WHERE r.UserID = @attendeeID
    AND e.EventDateTime >= GETDATE(); 

GO
ALTER PROCEDURE get_my_attended
@attendeeID bigint
AS
    SELECT * 
    FROM Registrations r
    INNER JOIN Events e ON e.EventID = r.EventID
    WHERE r.UserID = @attendeeID
    AND e.EventDateTime < GETDATE()
	AND r.Status = 'Approved'; 

GO
CREATE PROCEDURE count_my_attended
@attendeeID bigint
AS
    DECLARE @count INT;

    SELECT @count = COUNT(*)
    FROM Registrations r
    INNER JOIN Events e ON e.EventID = r.EventID
    WHERE r.UserID = @attendeeID
    AND e.EventDateTime < GETDATE()
	AND r.Status = 'Approved'; 

	SELECT @count AS AttendedCount;

GO
CREATE PROCEDURE get_registrations_by_event
@eventID bigint
AS
	select * from Registrations r
	where EventID = @eventID 

GO
ALTER PROCEDURE get_feedback_by_event
@eventID bigint
AS
	select r.EventID, r.UserID, f.* from Feedback f
	INNER JOIN Registrations r
	ON f.RegistrationID=r.RegistrationID
	where r.EventID = @eventID

GO
CREATE PROCEDURE get_images_by_event
@eventID bigint
AS
	select * from EventImages i
	where EventID = @eventID 

GO
CREATE PROCEDURE get_user_by_username
@username varchar(50)
AS
	select * from Users u
	where u.Username = @username

GO
CREATE PROCEDURE get_user_by_fullname
@full_name varchar(100)
AS
	select * from Users u
	where u.FullName = @full_name

GO
CREATE PROCEDURE check_if_user_exists
@username varchar (50),
@email varchar (50)
AS
	SELECT * FROM Users u
	WHERE u.Username = @username
	OR u.Email = @email

GO
ALTER PROCEDURE check_if_registered
@userID bigint,
@eventID bigint
AS
	SELECT * FROM Registrations r
	WHERE r.EventID = @eventID
	AND r.UserID = @userID

GO
DROP TRIGGER Trigger_EventCancellation
ON Events
AFTER UPDATE
AS
BEGIN
    IF UPDATE(IsCanceled) 
    BEGIN
        UPDATE Registrations
        SET Status = 'Event Canceled'
        WHERE EventID IN (SELECT EventID FROM inserted WHERE IsCanceled = 1)
    END
END;

GO
DROP TRIGGER Trigger_EventMarkedPrivate
ON Events
AFTER UPDATE
AS
BEGIN
    IF UPDATE(IsPrivate) 
    BEGIN
        UPDATE Registrations
        SET Status = 'Pending Approval'
        WHERE EventID IN (SELECT EventID FROM inserted WHERE IsPrivate = 1)
    END
END;

GO
DROP TRIGGER Trigger_EventMarkedPublic
ON Events
AFTER UPDATE
AS
BEGIN
    IF UPDATE(IsPrivate) 
    BEGIN
        UPDATE Registrations
        SET Status = 'Approved'
        WHERE EventID IN (SELECT EventID FROM inserted WHERE IsPrivate = 0)
    END
END;


GO
CREATE PROCEDURE count_events_by_category
@cat_id INT
AS
    DECLARE @count INT;

    SELECT @count = COUNT(*)
    FROM Events
    WHERE CategoryID = @cat_id;

    SELECT @count AS EventCount;

GO
CREATE PROCEDURE get_events_by_category
@cat_id INT
AS
	SELECT * FROM Events e
	WHERE CategoryID = @cat_id




