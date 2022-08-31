/**
 * @jest-environment jsdom
 */
import $ from 'jquery'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, waitFor, prettyDOM } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from './../__mocks__/store'
import router from '../app/Router.js'
import Bills from '../containers/Bills.js'

jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee', () => {
  // Pour effacer le HTML pour les test d'ingégration
  afterEach(() => {
    document.body.innerHTML = ''
  })
  describe('When I click on the New Bill button', () => {
    test('Then I should render the New Bill form', async () => {
      document.body.innerHTML = BillsUI({ data: bills })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Ajoute la logique à BillsUI
      new Bills({ document, onNavigate, store: null, localStorage: null })
      // Mime un clic sur le btn 'nouvelle note de frais'
      const btnNewBill = screen.getByTestId('btn-new-bill')
      fireEvent.click(btnNewBill)
      // Vérifie que le formulaire s'est ouvert
      const formNewBill = screen.getByTestId('form-new-bill')
      expect(formNewBill).toBeTruthy()
    })
  })

  describe('When I click on the eye icon on a bill row', () => {
    test('Then it should render the modal filled with the correct picture', async () => {
      document.body.innerHTML = BillsUI({ data: [bills[0]] })

      const onNavigate = () => {}

      $.fn.modal = jest.fn()

      new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: null,
      })

      const iconEye = screen.getByTestId('icon-eye')
      userEvent.click(iconEye)

      const modalImg = screen.getByTestId('employee-modal')
      const imgURL = modalImg.getAttribute('src')

      expect(imgURL).toEqual(bills[0].fileUrl)
    })
  })

  describe('When I am on Bills page, there are 4 bills', () => {
    test('Then getBills should return 4 bills', async () => {
      const onNavigate = () => {}

      const billsModel = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: null,
      })

      const billsArray = await billsModel.getBills()

      expect(billsArray.length).toEqual(4)
    })
  })
})

// Test t'intégration GET
describe('Given I am a user connected as employee', () => {
  describe('When I navigate to Bills view', () => {
    test('fetches bills from mock API GET', async () => {
      const nbrBillsInMockStore = (await mockStore.bills().list()).length

      localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'a@a' })
      )

      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText('Mes notes de frais'))

      const trows = screen.getAllByTestId('trow')

      expect(trows).toBeTruthy()
      expect(trows.length).toEqual(nbrBillsInMockStore)
    })
  })

  describe('When an error occurs on API', () => {
    beforeEach(() => {
      // .bills doit être mocker pour pouvoir ensuite utilisé .mockImplementationOnce dans chaque test
      jest.spyOn(mockStore, 'bills')
      localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'a@a' })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
    })

    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'))
          },
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test('fetches bills from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
