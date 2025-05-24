// Підключаємо роутер до бек-енду
const express = require('express')
const router = express.Router()

const { User } = require('../class/User')
const { Confirm } = require('../class/Confirm')
const { Session } = require('../class/Sessions')
const { Notification } = require('../class/Notification')

const users = {
  user1: {
    email: 'user@mail.com',
    password: '123QWEqwe',
    isConfirm: true,
  },
  user2: {
    email: 'admin@mail.com',
    password: '123QWEqwe',
    isConfirm: true,
  },
  user3: {
    email: 'developer@mail.com',
    password: '123QWEqwe',
    isConfirm: true,
  },
}

User.create(
  users.user1.email,
  users.user1.password,
  users.user1.isConfirm,
)
User.create(
  users.user2.email,
  users.user2.password,
  users.user2.isConfirm,
)
User.create(
  users.user3.email,
  users.user3.password,
  users.user3.isConfirm,
)

router.post('/signup', function (req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      message:
        'Error: All data must be provided to create a user',
    })
  }

  try {
    const user = User.getByEmail(email)
    if (user) {
      return res.status(400).json({
        message:
          'Error: A user with this email is already registered',
      })
    }

    const isConfirm = false

    const newUser = User.create(email, password, isConfirm)

    const session = Session.create(newUser)

    Confirm.create(newUser.email)

    const code = Confirm.getCode(email)

    return res.status(200).json({
      message: 'User registered successfully',
      session,
      code,
    })
  } catch (e) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/signup-confirm', function (req, res) {
  const { code, token } = req.body

  if (!code || !token) {
    return res.status(400).json({
      message: 'Error: Required fields are missing',
    })
  }

  try {
    const session = Session.getByToken(token)
    if (!session) {
      return res.status(400).json({
        message: 'Error: You are not logged in',
      })
    }

    const email = Confirm.getData(code)

    if (!email) {
      return res.status(400).json({
        message: 'Error: Code does not exist',
      })
    }

    if (email !== session.user.email) {
      return res.status(400).json({
        message: 'Error: Code is invalid',
      })
    }

    const user = User.getByEmail(session.user.email)
    user.isConfirm = true
    session.user.isConfirm = true

    return res.status(200).json({
      message: 'Email confirmed successfully',
      session,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/signin', function (req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: 'Error: Required fields are missing',
    })
  }

  try {
    const user = User.getByEmail(email)
    if (!user) {
      return res.status(400).json({
        message:
          'Error: A user with this email does not exist',
      })
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: 'Error: Incorrect password',
      })
    }

    if (!user.isConfirm) {
      Confirm.create(user.email)
    }

    const code = Confirm.getCode(email)

    const session = Session.create(user)

    Notification.newEvent(
      Notification.status,
      Notification.warning,
      Notification.warning,
      Notification.text,
      email,
    )

    return res.status(200).json({
      message: 'You have logged in',
      session,
      code,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/recovery', function (req, res) {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      message: 'Error: Required fields are missing',
    })
  }

  try {
    const user = User.getByEmail(email)
    if (!user) {
      return res.status(400).json({
        message:
          'Error: A user with this email does not exist',
      })
    }

    Confirm.create(email)

    const code = Confirm.getCode(email)

    return res.status(200).json({
      message: 'Password recovery code has been sent',
      code,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/recovery-confirm', function (req, res) {
  const { password, code } = req.body

  if (!code || !password) {
    return res.status(400).json({
      message: 'Error: Required fields are missing',
    })
  }

  try {
    const email = Confirm.getData(Number(code))
    if (!email) {
      return res.status(400).json({
        message: 'Error: Code does not exist',
      })
    }

    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message:
          'Error: A user with this email does not exist',
      })
    }
    user.password = password

    const session = Session.create(user)

    Notification.newEvent(
      Notification.status,
      Notification.warning,
      Notification.warning,
      Notification.changePassword,
      email,
    )

    return res.status(200).json({
      message: 'Password successfully recovered',
      session,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/recovery-email', function (req, res) {
  const { email, password, newEmail } = req.body

  if (!password || !newEmail) {
    return res.status(400).json({
      message: 'Error: Required fields are missing',
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message:
          'Error: A user with this email does not exist',
      })
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: 'Error: Incorrect password',
      })
    }

    user.email = newEmail
    user.isConfirm = true

    const session = Session.create(user)

    Notification.newEvent(
      Notification.status,
      Notification.warning,
      Notification.warning,
      Notification.changeEmail,
      email,
    )

    return res.status(200).json({
      message: 'Email changed successfully',
      session,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/recovery-password', function (req, res) {
  const { oldPassword, newPassword, email } = req.body

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: 'Error: Required fields are missing',
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message:
          'Error: A user with this email does not exist',
      })
    }

    if (user.password !== oldPassword) {
      return res.status(400).json({
        message: 'Error: Incorrect password',
      })
    }

    User.updatePassword(user, newPassword)

    Notification.newEvent(
      Notification.status,
      Notification.warning,
      Notification.warning,
      Notification.changePassword,
      email,
    )

    return res.status(200).json({
      message: 'Password successfully changed',
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

// Експортуємо глобальний роутер
module.exports = router
