import { ROUTES_PATH } from '../constants/routes.js'
import Logout from './Logout.js'

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    )
    formNewBill.addEventListener('submit', this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener('change', this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    this.formData = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = (e) => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length - 1]
    //TODO: (mentor) A mettre ou non? Pas utile si la restriction d'extension sur l'input:file est suffisante
    const fileExtension = fileName.split('.').at(-1)
    const authorizedExtensions = ['jpg', 'png', 'jpeg']
    const fileHaveAuthorizedExtension = authorizedExtensions.some(
      (a) => a === fileExtension
    )
    if (!fileHaveAuthorizedExtension) {
      throw new Error('Accepted extensions: png, jpg, jpeg')
    }
    this.formData = new FormData()
    const email = JSON.parse(localStorage.getItem('user')).email
    this.formData.append('file', file)
    this.formData.append('email', email)
    this.fileName = fileName
    // TODO: (mentor) quand un fichier est déposé (bonne extension), ca envoie directement une requete au backend pour créer une nouvelle note de frais dans la base de données. On laisse ca comme ca? => Même si on annule le form d'une nouvelle note de frais, on se retrouve avec une ligne mal remplie dans la vue Bills...
    // this.store
    //   .bills()
    //   .create({
    //     data: formData,
    //     headers: {
    //       noContentType: true,
    //     },
    //   })
    //   .then(({ fileUrl, key }) => {
    //     this.billId = key
    //     this.fileUrl = fileUrl
    //     this.fileName = fileName
    //   })
    //   .catch((error) => console.error(error))
  }
  handleSubmit = (e) => {
    e.preventDefault()
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    )
    const email = JSON.parse(localStorage.getItem('user')).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      // fileUrl: this.fileUrl,
      // fileName: this.fileName,
      // status: 'pending',
    }

    //TODO: juste faire le create(), sans devoir faire le update() ensuite...
    this.store
      .bills()
      .create({
        data: this.formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        this.billId = key
        this.fileUrl = fileUrl
      })
      // Added
      .then(() => {
        bill.billId = this.billId
        bill.fileName = this.fileName
        bill.fileUrl = this.fileUrl
        bill.status = 'pending'
        this.updateBill(bill)
      })
      //Fin added
      .catch((error) => console.error(error))
    // this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch((error) => console.error(error))
    }
  }
}
