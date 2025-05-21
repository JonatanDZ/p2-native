# READ ME Make Local Great Again #

## how to run the project? ###

### **STEP 1** Creating the data base ###

Navigate to: 'https://dev.mysql.com/doc/mysql-getting-started/en/'
And follow the instructions on the page and install MySQL.
Make sure you remember the password as you will need it when creating the .env file in step 2.

In the folder called 'DB - setup' a sql file called 'table.sql' exists
Open the MySQL Command Line Client and run the code in the file.

#### *Optional step for mock data:* #### 
From the same 'DB - setup' folder run the file called 'dummy-data.sql'

### **STEP 2** Creating a .env file ###

You need to create a .env file in the project folder. The .env file should contain this following data: (*remember to change the db_password*)

got to 'https://dashboard.stripe.com/test/apikeys' create and account if you haven't already and find the keys and input them under.

```
STRIPE_SECRET_KEY=*insert your stripe keys here*
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=*insert your stripe keys here*
DB_HOST =127.0.0.1
DB_USER = root
DB_PASSWORD=*insert your database password here*
DB_NAME = p2_database
```

### **STEP 3** Running the server ###

Open the project in Visual Studio Code, then open the terminal and type 'npm install' to install all required packages.
Now run the server file. Navigate to the output and a link to 'http://localhost:3000/' should have appeared along with a 'Connected to MySQL' if the database is properly connected.


## Credits and License ##

This is the 2. semester project for group 3 on AAU Software.
20/05/2025

*We reserve all the rights to the project*
