const { getDate } = require('./getDate')

class Notification {
  static #list = []
  static #count = 1
  static #date = new Date()

  static text = 'New login'
  static typeRecive = 'Recive'
  static typeSend = 'Send'
  static changePassword = 'Password Change'
  static changeEmail = 'Email Change'
  static depositStripe = 'Deposit Stripe'
  static depositCoinbase = 'Deposit Coinbase'
  static transfer = 'Transfer'
  static announcement = 'Announcement'
  static deposit = 'Deposit'
  static recoveryEmail = 'Recovery Email'
  static recoveryPassword = 'Recovery Password'
  static warning = 'Warning'
  static status = 'Complete'

  constructor(
    status,
    typeNotification,
    type,
    text,
    email,
    emailSender,
    emailRecipient,
    sum,
    typeTransfer,
  ) {
    this.id = Notification.#count++
    this.date = getDate(Notification.#date)
    this.status = status
    this.typeNotification = typeNotification
    this.type = type
    this.text = text
    this.email = email
    this.emailSender = emailSender
    this.emailRecipient = emailRecipient
    this.sum = sum
    this.typeTransfer = typeTransfer
  }
  static newEvent(
    status,
    typeNotification,
    type,
    text,
    email,
    sum,
    emailSender,
    emailRecipient,
    typeTransfer,
  ) {
    const notification = new Notification(
      status,
      typeNotification,
      type,
      text,
      email,
      emailSender,
      emailRecipient,
      sum,
      typeTransfer,
    )
    this.#list.push(notification)
    return notification
  }
  static getListByEmail(email) {
    return (
      this.#list.filter(
        (user) =>
          user.email === String(email).toLowerCase(),
      ) || null
    )
  }
  static getById(notificationId) {
    return (
      this.#list.find(
        (notification) =>
          notification.id === Number(notificationId),
      ) || null
    )
  }
}

module.exports = {
  Notification,
}
