const express = require("express")
const User = require("../models/user")
const router = new express.Router()
const auth = require("../middleware/auth")
const multer = require("multer")
const sharp = require("sharp")
const { sendWelcomeEmail, sendGoodByeEmail } = require("../emails/account")

router.post("/users", async (req, res) => {
  const user = new User(req.body)
  try {
    const token = await user.generateAuthToken()
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    console.log("ok")
    const token = await user.generateAuthToken()
    return res.send({ user, token })
  } catch (e) {
    res.status(400).send()
  }
})

// logout from current device
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      token !== req.token
    })
    await req.user.save()
    return res.send()
  } catch (e) {
    return res.status(500).send()
  }
})

// logout from all devices
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = []
    req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// get profile
router.get("/users/me", auth, async (req, res) => {
  try {
    return res.send(req.user)
  } catch (e) {
    console.log(e)
    res.status(401).send()
  }
})

// update my profile
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["age", "password", "email", "name"]
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))
  if (!isValidOperation) {
    return res.status(500).send({ error: "Invalid Updates :(" })
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]))
    await req.user.save()
    return res.send(req.user)
  } catch (e) {
    return res.status(500).send()
  }
})

// delete my profile
router.delete("/users/me", auth, async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.user._id })
    sendGoodByeEmail(req.user.email, req.user.name)
    return res.send(req.user)
  } catch (e) {
    return res.status(500).send()
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("File should be jpg, jpeg or png only "))
    }
    cb(undefined, true)
  }
})

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message })
  }
)

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    res.set("Content-Type", "image/png")
    res.send(user.avatar)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
