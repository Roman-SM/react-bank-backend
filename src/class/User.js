class User {
  static #list = []
  static #count = 1

  constructor(email, password, isConfirm) {
    this.id = User.#count++
    this.email = String(email).toLowerCase()
    this.password = String(password)
    this.balance = 0
    this.isConfirm = isConfirm
  }
  static create(email, password, isConfirm) {
    const user = new User(email, password, isConfirm)
    this.#list.push(user)
    return user
  }
  static updatePassword = (user, password) => {
    return (user.password = password)
  }
  static getByEmail(email) {
    return (
      this.#list.find(
        (user) =>
          user.email === String(email).toLowerCase(),
      ) || null
    )
  }
  static getById(id) {
    return (
      this.#list.find((user) => user.id === Number(id)) ||
      null
    )
  }
  static withdrawal(email, sum) {
    return (email.balance -= Number(sum))
  }
  static deposit(email, sum) {
    return (email.balance += Number(sum))
  }
  static getList = () => this.#list
}

module.exports = {
  User,
}
