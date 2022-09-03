/**
 * @jest-environment jsdom
 */
import $ from 'jquery'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import mockStore from './../__mocks__/store'
import router from '../app/Router.js'
import Bills from '../containers/Bills.js'

jest.mock('../app/store', () => mockStore)

describe('Given I am on the Bills view', () => {
  describe('When I click on the New Bill button', () => {
    test('Then I should go to the NewBill view', async () => {
      document.body.innerHTML = BillsUI({ data: bills })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      new Bills({ document, onNavigate, store: null, localStorage: null })

      const btnNewBill = screen.getByTestId('btn-new-bill')
      userEvent.click(btnNewBill)

      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
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

  describe('When 4 bills are available in the store', () => {
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
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  describe('When I navigate to Bills view', () => {
    test('Then it should fetches bills from mock API GET', async () => {
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

    test('Then it should fetches bills from an API and fails with 404 message error', async () => {
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

    test('Then it should fetches bills from an API and fails with 500 message error', async () => {
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
