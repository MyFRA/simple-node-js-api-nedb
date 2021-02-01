const express                   = require('express');
const bodyParser                = require('body-parser'); 
const Datastore                 = require('nedb');
const {check, validationResult} = require('express-validator');
const app                       = express();

// Database
const DB      = new Datastore({
    filename: 'Database.db',
});

DB.loadDatabase((err) => {
    if(err) throw err;
});

// Body Parser
app.use(bodyParser.json());

// Helper
const MSG_ERR_NOT_EMPTY     = 'can not be empty';
const MSG_ERR_IS_NUMERIC    = 'must be numeric';
function getMessage(body, MSG_ERR) {
    return `${body} ${MSG_ERR}`;
}

// Route
app.get('/', (req, res) => {
    res.status(200).json({
        code: 200,
        message: 'Welcome to the simple CRUD students app',
    });
});

app.get('/students', (req, res) => {
    DB.find({table_name: 'students'}, function(err, document) {
        if(err) {
            return res.status(500).json({
                code: 500,
                message: 'error, something wrong',
                error: err,
            });
        } else {
            return res.status(200).json({
                code: 200,
                message: 'successfully, students data is retrieved',
                data: {
                    students: document,
                }
            });
        } 
    });
});

app.post('/students',[
    check('name').notEmpty().withMessage(getMessage('name', MSG_ERR_NOT_EMPTY)),
    check('class').notEmpty().withMessage(getMessage('class', MSG_ERR_NOT_EMPTY)),
    check('no_absen').notEmpty().bail().withMessage(getMessage('no_absen', MSG_ERR_NOT_EMPTY)).isNumeric().withMessage(getMessage('no_absen', MSG_ERR_IS_NUMERIC)),
], (req, res) => {
   const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(401).json({
            code: 401,
            message: 'error validation',
            data: {
                errors: errors.array(),
            }
        });
    } else {
        DB.insert({
            table_name: 'students',
            name: req.body.name,
            class: req.body.class,
            no_absen: req.body.no_absen
        }, (err, document) => {
            if(err) throw err;
            return res.status(200).json({
                code: 200,
                message: 'successfully, data student has been inserted',
                data: {
                    student: document,
                }
            });
        });
    }
});

app.get('/students/:id', (req, res) => {
    DB.find({table_name: 'students', _id: req.params.id}, (err, document) => {
        if(err) throw err;

        if( document.length > 0) {
            return res.status(200).json({
                code: 200,
                message: `successfully, student with id ${req.params.id} is retrieved`,
                data: {
                    student: document[0],
                }
            });
        } else {
            return res.status(404).json({
                code: 404,
                message: `student with id ${req.params.id} is not found`,
            });
        }
    });
});

// Server Running
const port    = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('server is running on port' + port)
});