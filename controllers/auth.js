// Importing modules
const express = require('express');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const User = require('@model/user');

const app = express();

app.use(express.json());

// Handling post request
app.post('/login',
    async (req, res, next) => {
        let { email, password } = req.body;

        let existingUser;
        try {
            existingUser =
				await User.findOne({ email: email });
        } catch {
            const error =
				new Error(
				    'Error! Something went wrong.'
				);
            return next(error);
        }
        if (!existingUser
			|| existingUser.password
			!= password) {
            const error =
				Error(
				    'Wrong details please check at once'
				);
            return next(error);
        }
        let token;
        try {
            //Creating jwt token
            token = jwt.sign(
                {
                    userId: existingUser.id,
                    email: existingUser.email
                },
                'secretkeyappearshere',
                { expiresIn: '1h' }
            );
        } catch (err) {
            console.log(err);
            const error =
				new Error('Error! Something went wrong.');
            return next(error);
        }

        res
            .status(200)
            .json({
                success: true,
                data: {
                    userId: existingUser.id,
                    email: existingUser.email,
                    token: token,
                },
            });
    });

// Handling post request
app.post('/signup',
    async (req, res, next) => {
        const {
            name,
            email,
            password
        } = req.body;
        const newUser =
			User({
			    name,
			    email,
			    password,
			});

        try {
            await newUser.save();
        } catch {
            const error =
				new Error('Error! Something went wrong.');
            return next(error);
        }
        let token;
        try {
            token = jwt.sign(
                {
                    userId: newUser.id,
                    email: newUser.email
                },
                'secretkeyappearshere',
                { expiresIn: '1h' }
            );
        } catch (err) {
            const error =
				new Error('Error! Something went wrong.');
            return next(error);
        }
        res
            .status(201)
            .json({
                success: true,
                data: {
                    userId: newUser.id,
                    email: newUser.email,
                    token: token
                },
            });
    });

