const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Car = require('../models/Car');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const multer = require('multer');

const adminLayout = '../views/layouts/admin';

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;

      const user = await User.findById(decoded.userId);
      
      if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
      }

      req.userRole = user.role;

      next();
  } catch (error) {
      res.status(401).json({ message: 'Unauthorized' });
  }
}

const isAdmin = (req, res, next) => {
  if (req.userRole === "admin") {
      next(); 
  } else {
      res.status(403).json({ message: "Only admins can perform administrative actions" });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'C:\backend\Новая папка\Final\public\img') 
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname) 
  }
});

const upload = multer({ storage: storage });

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Portfolio platform',
      isAdmin: res.locals.isAdmin
    }

    const data = await Car.find(); 

    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/add-post', upload.single('image'), isAdmin, async (req, res) => {
  try {
    const { model, description, image } = req.body;
  
    if (!image) {
      return res.status(400).json({ message: 'Image URL is required' });
    }
  
    const newCar = new Car({
      image,
      model,
      description
    });
  
    await newCar.save();
  
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.get('/edit-post/1', async (req, res) => {
  try {
    // Fetch the car with the ID "1" from the database
    const car = await Car.findById("1");

    // If the car with the given ID is not found, return a 404 error
    if (!car) {
      return res.status(404).send("Car not found");
    }

    // Render the edit-post template with the fetched car data
    res.render('edit-post', { car });
  } catch (error) {
    // If an error occurs during the database query, return a 500 error
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


router.delete('/delete-post/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const carId = req.params.id;
    const deletedCar = await Car.findByIdAndDelete(carId);

    if (!deletedCar) {
      return res.status(404).send("Car not found");
    }

    res.redirect('/dashboard');

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});


module.exports = router;
