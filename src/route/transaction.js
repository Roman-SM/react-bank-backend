// Підключаємо роутер до бек-енду
const express = require('express')
const router = express.Router()

const { User } = require('../class/User')
const { Transaction } = require('../class/Transaction')
const { Notification } = require('../class/Notification')

const eventType = {
  deposit: 'Receipt',
  withdrawal: 'Sending',
  sendUser: 'User',
  sendStripe: 'Stripe',
  sendCoinbace: 'Coinbace',
}

const users = {
  user1: {
    email: 'user@mail.com',
    password: '123QWEqwe',
  },
  user2: {
    email: 'admin@mail.com',
    password: '123QWEqwe',
  },
  user3: {
    email: 'developer@mail.com',
    password: '123QWEqwe',
  },
}

User.create(users.user1.email, users.user1.password)
User.create(users.user2.email, users.user2.password)
User.create(users.user3.email, users.user3.password)

router.post('/send', function (req, res) {
  const { senderEmail, recipientEmail, sum } = req.body

  if (!sum) {
    return res.status(400).json({
      message:
        'Error: All data must be provided to create the payment',
    })
  }

  try {
    const senderUser = User.getByEmail(senderEmail)
    if (senderEmail === recipientEmail) {
      return res.status(400).json({
        message:
          'Error: You cannot send a payment to yourself',
      })
    }
    if (!senderUser) {
      return res.status(400).json({
        message:
          'Error: A sender with this email does not exist',
      })
    }
    if (senderUser.balance < sum) {
      return res.status(400).json({
        message:
          'Error: Insufficient funds for the transfer',
      })
    }
    const recipientUser = User.getByEmail(recipientEmail)
    if (!recipientUser) {
      return res.status(400).json({
        message:
          'Error: A recipient with this email does not exist',
      })
    }
    Transaction.newWithdrawal(
      senderEmail,
      Number(sum),
      eventType.withdrawal,
      eventType.sendUser,
      senderUser.balance,
    )
    Transaction.newReceiving(
      recipientEmail,
      Number(sum),
      eventType.deposit,
      eventType.sendUser,
      recipientUser.balance,
    )

    User.withdrawal(senderUser, sum)
    User.deposit(recipientUser, sum)

    Notification.newEvent(
      Notification.status,
      Notification.transfer,
      Notification.announcement,
      Notification.transfer,
      senderEmail,
      sum,
      senderEmail,
      recipientEmail,
      Notification.typeSend,
    )
    Notification.newEvent(
      Notification.status,
      Notification.transfer,
      Notification.announcement,
      Notification.transfer,
      recipientEmail,
      sum,
      senderEmail,
      recipientEmail,
      Notification.typeRecive,
    )

    return res.status(200).json({
      message: 'The transfer was completed successfully',
    })
  } catch (e) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/recive-coinbase', function (req, res) {
  const { sum, email } = req.body
  if (!sum) {
    return res.status(400).json({
      message: 'Error: Please enter the payment amount',
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

    Transaction.newRecive(
      email,
      Number(sum),
      eventType.deposit,
      eventType.sendCoinbace,
      user.balance,
    )

    User.deposit(user, Number(sum))

    Notification.newEvent(
      Notification.status,
      Notification.deposit,
      Notification.announcement,
      Notification.depositCoinbase,
      email,
      sum,
    )

    return res.status(200).json({
      message: 'Funds have been credited to your account',
    })
  } catch (e) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/recive-stripe', function (req, res) {
  const { sum, email } = req.body

  if (!sum) {
    return res.status(400).json({
      message: 'Error: Please enter the payment amount',
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

    Transaction.newRecive(
      email,
      Number(sum),
      eventType.deposit,
      eventType.sendStripe,
      user.balance,
    )

    User.deposit(user, sum)

    Notification.newEvent(
      Notification.status,
      Notification.deposit,
      Notification.announcement,
      Notification.depositStripe,
      email,
      sum,
    )

    return res.status(200).json({
      message: 'Funds have been credited to your account',
    })
  } catch (e) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.get('/balance', function (req, res) {
  try {
    const userEmail = req.headers.authorization

    const email = User.getByEmail(userEmail)
    if (!email) {
      return res.status(400).json({
        message:
          'Error: A user with this email does not exist',
      })
    }
    const balance = email.balance

    return res.status(200).json({
      balance,
    })
  } catch (e) {
    return res.status(400).json({ message: e.message })
  }
})

router.get('/transactions-list', function (req, res) {
  try {
    const userEmail = req.headers.authorization

    const email = User.getByEmail(userEmail)
    if (!email) {
      return res.status(400).json({
        message:
          'Error: A user with this email does not exist',
      })
    }
    const transactions =
      Transaction.getListByEmail(userEmail)

    return res.status(200).json({
      transactions: transactions.map(
        ({ id, date, sum, type, img, typeEvent }) => ({
          id,
          date,
          sum,
          type,
          typeEvent,
        }),
      ),
    })
  } catch (e) {
    return res.status(400).json({ message: e.message })
  }
})

router.get('/transaction-info/:id', function (req, res) {
  try {
    const transactionId = req.params.id
    if (!transactionId) {
      return res.status(400).json({
        message: 'Error: Transaction ID was not provided',
      })
    }

    const transaction = Transaction.getById(
      Number(transactionId),
    )

    if (!transaction) {
      return res.status(400).json({
        message:
          'Error: A transaction with this ID does not exist',
      })
    }

    return res.status(200).json({
      transaction: {
        id: transaction.id,
        date: transaction.date,
        email: transaction.email,
        sum: transaction.sum,
        type: transaction.type,
      },
    })
  } catch (e) {
    return res.status(400).json({ message: e.message })
  }
})

router.get('/notifications-list', function (req, res) {
  try {
    const userEmail = req.headers.authorization

    const email = User.getByEmail(userEmail)
    if (!email) {
      return res.status(400).json({
        message:
          'Error: A user with this email does not exist',
      })
    }

    const notifications =
      Notification.getListByEmail(userEmail)

    return res.status(200).json({
      notifications: notifications.map(
        ({ id, date, type, text }) => ({
          id,
          date,
          type,
          text,
        }),
      ),
    })
  } catch (e) {
    return res.status(400).json({ message: e.message })
  }
})

router.get('/notification-info/:id', function (req, res) {
  try {
    const notificationId = req.params.id

    if (!notificationId) {
      return res.status(400).json({
        message: 'Error: Transaction ID was not provided',
      })
    }

    const notification = Notification.getById(
      Number(notificationId),
    )

    if (!notification) {
      return res.status(400).json({
        message:
          'Error: A transaction with this ID does not exist',
      })
    }

    return res.status(200).json({
      notification: {
        id: notification.id,
        date: notification.date,
        status: notification.status,
        typeNotification: notification.typeNotification,
        type: notification.type,
        text: notification.text,
        email: notification.email,
        emailSender: notification.emailSender,
        emailRecipient: notification.emailRecipient,
        sum: notification.sum,
        typeTransfer: notification.typeTransfer,
      },
    })
  } catch (e) {
    return res.status(400).json({ message: e.message })
  }
})
// Експортуємо глобальний роутер
module.exports = router
