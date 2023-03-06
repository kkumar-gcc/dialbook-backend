const router = require("express").Router();
const Contact = require("../models/Contact");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { name, number } = req.body;
    const newContact = new Contact({
      name,
      number,
      user: req.cookies.id,
    });

    const savedContact = await newContact.save();
    res.json(savedContact);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});
router.post("/edit", auth, async (req, res) => {
  try {
    const { name, number, contactId } = req.body;
    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, user: req.cookies.id },
      { name, number },
      { new: true }
    );
    if (!contact) {
      res.status(404).send("Contact not found");
      return;
    }
    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});
router.post("/delete", auth, async (req, res) => {
  try {
    const { contactId } = req.body;
    if (!contactId) {
      return res.status(400).json({ errorMessage: "Invalid request!" });
    }

    const contact = await Contact.findOne({ _id: contactId });
    if (!contact) {
      res.status(404).send("Contact not found");
      return;
    }

    if (contact.user.toString() !== req.cookies.id) {
      res.status(401).send("Unauthorized");
      return;
    }

    await contact.remove();
    res.send("Contact deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.cookies.id });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

module.exports = router;
