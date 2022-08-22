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
  describe('When I click on the New Bill button', () => {
    test('Then I should render the New Bill form', async () => {
      // Affiche l'ecran employee
      document.body.innerHTML = BillsUI({ data: bills })
      // Mime le comportement de window.onNavigate dans Router.js (avec juste ce qui est intéressant pour le test)
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
    test('Then I should render a modal ', async () => {
      // Affiche l'ecran bills employee
      document.body.innerHTML = BillsUI({ data: [bills[0]] })

      const onNavigate = (pathname) => {
        return
      }

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
      expect(modalImg).toBeDefined()
    })
  })
})
describe('When I am on Bills page but page is loading', () => {
  test('then it should render Loading page', () => {
    document.body.innerHTML = BillsUI({ loading: true })
    expect(screen.getAllByText('Loading...')).toBeTruthy()
  })
})

describe('When I am on Bills page, there are 4 bills', () => {
  test('Then getBills should return 4 bills', async () => {
    const onNavigate = (pathname) => {
      return
    }

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

// Test t'intégration GET
describe('Given I am a user connected as employee', () => {
  describe('When I navigate to Bills view', () => {
    test('fetches bills from mock API GET', async () => {
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
      const tBody = screen.getByTestId('tbody')
      expect(tBody.childNodes.length).not.toEqual(0)
    })
  })
})
