FROM python:3.10
RUN apt-get update && apt-get install -y \
    unixodbc \
    unixodbc-dev \
    g++ \
    gcc \
    curl \
    gnupg \
    iputils-ping 

# Download and install Microsoft ODBC Driver for SQL Server
# Add Microsoft repository key
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -

# Add Microsoft repository
RUN curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list

# Update apt and install ODBC Driver
RUN apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql17

COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE 8080
CMD ["python","app.py"]