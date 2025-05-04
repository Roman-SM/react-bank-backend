const { getDate } = require('./getDate')

class Transaction {
  static #list = []
  static #count = 1
  static #date = new Date()

  constructor(email, sum, type, typeEvent, balance) {
    this.id = Transaction.#count++
    this.date = getDate(Transaction.#date)
    this.sum = Number(sum)
    this.type = type
    this.typeEvent = typeEvent
    this.email = email
    this.balance = balance
  }
  static newReceiving(
    email,
    sum,
    type,
    typeEvent,
    balance,
  ) {
    const receivingTransaction = new Transaction(
      email,
      sum,
      type,
      typeEvent,
      (balance += sum),
    )
    this.#list.push(receivingTransaction)
    return receivingTransaction
  }
  static newWithdrawal(
    email,
    sum,
    type,
    typeEvent,
    balance,
  ) {
    const withdrawalTransaction = new Transaction(
      email,
      sum,
      type,
      typeEvent,
      (balance -= sum),
    )
    this.#list.push(withdrawalTransaction)
    return withdrawalTransaction
  }
  static newRecive(email, sum, type, typeEvent, balance) {
    const reciveTransaction = new Transaction(
      email,
      sum,
      type,
      typeEvent,
      (balance += sum),
    )
    this.#list.push(reciveTransaction)
    return reciveTransaction
  }
  static getListByEmail(email) {
    return (
      this.#list.filter(
        (user) =>
          user.email === String(email).toLowerCase(),
      ) || null
    )
  }
  static getById(transactionId) {
    return (
      this.#list.find(
        (transaction) =>
          transaction.id === Number(transactionId),
      ) || null
    )
  }
  static getList = () => this.#list
}

module.exports = {
  Transaction,
}
