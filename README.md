# Lucky7tattoo
Lucky7Project
This proyect was made with Node.js, Express.js, Bootstrap 5, mySQL, XAMPP, Visual Studio Code.

To run file just incert into console:

npm install

set your mySQL settings creating a keys.js file like this:

module.exports = {

    database: {
        connectionLimit: 10,
        host: 'your_host',
        user: 'your_username',
        password: 'your_password',
        database: 'database_name'
    }

};

Also need to add a 'uploaded' folder inside your public folder.

npm run dev

And you are good to go just open your browser at http://localhost:3000

And you can always visit:

https://lucky7.bss.design/
