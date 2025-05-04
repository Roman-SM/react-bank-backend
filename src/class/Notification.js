const { getDate } = require('./getDate')

class Notification {
  static #list = []
  static #count = 1
  static #date = new Date()

  static login = 'New login'
  static recovery = 'Account Recovery'
  static changePassword = 'Password Change'
  static changeEmail = 'Email Change'
  static depositCoinbase = 'Deposit Coinbase'
  static depositStripe = 'Deposit Stripe'
  static transfer = 'Transfer'
  static announcement = 'Announcement'
  static warning = 'Warning'

  constructor(type, text, email) {
    this.id = Notification.#count++
    this.date = getDate(Notification.#date)
    this.type = type
    this.text = text
    this.email = email
  }
  static newEvent(type, text, email) {
    const notification = new Notification(type, text, email)
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
}

module.exports = {
  Notification,
}
