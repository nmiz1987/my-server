const express = require("express");
const router = express.Router();
const { faker } = require("@faker-js/faker/locale/he");

function generateID() {
  const min = 100000000;
  const max = 999999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

function generatePhoneNumber() {
  const threeDigitNumber = Math.floor(Math.random() * 900) + 100;
  const sevenDigitNumber = Math.floor(Math.random() * 9000000) + 1000000;
  const result = `${threeDigitNumber}-${sevenDigitNumber}`;
  return result;
}

router.get("/", async (req, res) => {
  try {
    const data = {
      name: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        fullName: faker.person.fullName(),
      },
      gender: faker.person.sex(),
      avatar: faker.image.avatar(),
      id: generateID(),
      phone: generatePhoneNumber(),
      location: {
        country: faker.location.country(),
        city: faker.location.city(),
        street: faker.location.street(),
        buildingNumber: faker.location.buildingNumber(),
        zipCode: faker.location.zipCode(),
      },
    };
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
