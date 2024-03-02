const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const nodemailer = require('nodemailer'); 

const regLayout = '../views/layouts/signin';
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});
router.get('/', async (req, res) => {
    try {
      const locals = {
        title: "Admin",
        description: "Platform portfolio"
      }
  
      res.render('admin/login', { locals, layout: regLayout });
    } catch (error) {
      console.log(error);
    }
  });
  
  
  router.post('/', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne( { username } );
  
      if(!user) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if(!isPasswordValid) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const token = jwt.sign({ userId: user._id}, jwtSecret );
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
  });
  
  router.get('/register', async (req, res) => {
    try {
  
      const locals = {
        title: "Registration",
        description: "You can registrate your account here",
      };
  
      res.render('admin/register', {
        locals,
        layout: regLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });


  router.post('/register', async (req, res) => {
    try {
        const { username, password, role, firstName, lastName, age, country, gender } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role,
            firstName,
            lastName,
            age,
            country,
            gender,
        });
        await newUser.save();

       
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.username, 
            subject: "Welcome to Our Website",
            text: "Thank you for registering on our website. We're glad to have you!",
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


  module.exports = router;