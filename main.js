const express = require('express');
const app = express();
const fs = require('fs');
const crypto = require('crypto');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/users', function(req, res) {
    fs.readFile('./data.storage', (err, data) => {
        if (err) {
            throw err;
        }
        let content = [];
        if (data.length > 0) {
            content = JSON.parse(data);
            content.forEach(el => {
                delete el.password;
            });
        }
        res.status(200).send(content);
    });
});

app.get('/users/:id', function(req, res) {
    fs.readFile('./data.storage', (err, data) => {
        if (err) {
            throw err;
        }
        let content = data.length > 0 ? JSON.parse(data) : [] ;
        let idToFind = parseInt(req.params.id);
        let filtered = content.filter(el => el.id === idToFind);
        if (filtered.length > 0) {
            delete filtered[0].password;
            res.status(200).send(filtered[0]);
        } else {
            res.status(404).send("user has been not found");
        }
    });
});

app.post('/users', function(req, res) {
    fs.readFile('./data.storage', (err, data) => {
        if (err) {
            throw err;
        }
        let content = data.length > 0 ? JSON.parse(data) : [] ;
        let userToAdd = req.body;
        let isConsist = false;
        for (let i = 0; i < content.length; i++) {
            if (content[i].email === userToAdd.email || content[i].id === userToAdd.id) {
                isConsist = true;
                break;
            }
        }
        if (isConsist) {
            res.status(409).send("User whith this id or email already exist");
            return;
        } else {
            userToAdd.password = encrypt(userToAdd.password);
            content.push(userToAdd);
        }

        fs.writeFile('data.storage', JSON.stringify(content), err => {
            if (err) {
                throw err;
            }
            res.status(201).send(`user was added whith id: ${userToAdd.id}`);
        });
    });
});

app.put('/users/:id', function(req, res) {
    fs.readFile('./data.storage', (err, data) => {
        if (err) {
            throw err;
        }
        let userToChange = req.body;
        let content = data.length > 0 ? JSON.parse(data) : [] ;
        let idToFind = parseInt(req.params.id);
        let isConsistEmail = false;
        let isFind = false;
        let numToReplace;
        for (var i = 0; i < content.length; i++) {
            if (content[i].id === idToFind) {
                numToReplace = i;
                isFind = true;
                break;
            }
        }
        if (!isFind) {
            res.status(404).send(`user whith id: ${idToFind}  has been not found`);
        } else {
            userToChange.password = encrypt(userToChange.password);
            userToChange.id = idToFind; // in my case I do, that u can update user info, but can not change his id
            content.splice(numToReplace, 1, userToChange);
            for (let i = 0; i < content.length; i++) {
                if (content[i].email === userToChange.email && i !== numToReplace) {
                    isConsistEmail = true;
                    break;
                }
            }
            if (isConsistEmail) {
                res.status(409).send("User whith this email already exist");
            } else {
                fs.writeFile('data.storage', JSON.stringify(content), err => {
                    if (err) {
                        throw err;
                    }
                    delete content[numToReplace].password;
                    res.status(200).send(content[numToReplace]);
                });
            }
        }
    });
});


app.delete('/users/:id', function(req, res) {
    fs.readFile('./data.storage', (err, data) => {
        if (err) {
            throw err;
        }
        let content = data.length > 0 ? JSON.parse(data) : [] ;
        let idToFind = parseInt(req.params.id);
        let isFind = false;
        let numToDel;
        for (var i = 0; i < content.length; i++) {
            if (content[i].id === idToFind) {
                isFind = true;
                numToDel = i;
                break;
            }
        }
        if (!isFind) {
            res.status(404).send("User has been not found");
        } else {
            content.splice(numToDel, 1);
            fs.writeFile('data.storage', JSON.stringify(content), err => {
                if (err) {
                    throw err;
                }
                res.status(200).send({
                    "message": "User has been successfully removed."
                });
            });
        }
    });
});


// encrypt helpful function

function encrypt(password) {
    let mykey = crypto.createCipher('aes-128-cbc', 'd6F3Efeq');
    let mystr = mykey.update(password, 'utf8', 'hex');
    mystr += mykey.final('hex');
    return mystr;
}

//

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
