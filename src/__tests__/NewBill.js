/**
 * @jest-environment jsdom
 */

import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import DashboardFormUI from '../views/DashboardFormUI.js'
import DashboardUI from '../views/DashboardUI.js'
import Dashboard, { filteredBills, cards } from '../containers/Dashboard.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import { bills } from '../fixtures/bills'
import router from '../app/Router'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
      onNavigate(ROUTES_PATH.NewBill)
    })

    test('Then the letter icon in vertical menu should be hilghlighted', async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains('active-icon')).toBeTruthy()
    })

    test('Then the FormNewBill should be rendered', async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const formNewBill = screen.getByTestId('form-new-bill')
      expect(formNewBill).toBeDefined()

      const expenseType = screen.getByTestId('expense-type')
      expect(expenseType).toBeDefined()

      const expenseName = screen.getByTestId('expense-name')
      expect(expenseName).toBeDefined()

      const datepicker = screen.getByTestId('datepicker')
      expect(datepicker).toBeDefined()

      const amount = screen.getByTestId('amount')
      expect(amount).toBeDefined()

      const vat = screen.getByTestId('vat')
      expect(vat).toBeDefined()

      const pct = screen.getByTestId('pct')
      expect(pct).toBeDefined()

      const commentary = screen.getByTestId('commentary')
      expect(commentary).toBeDefined()

      const file = screen.getByTestId('file')
      expect(file).toBeDefined()
    })
  })
})

describe('Given I am on the NewBillForm', () => {
  describe('When I submit the form', () => {
    test('Then it should trigger handleSubmit and I should be redirected to Bills view', () => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )

      const mockEvent = {
        target: { querySelector: jest.fn() },
        preventDefault: jest.fn(),
      }
      mockEvent.target.querySelector.mockReturnValue('test value')

      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      })

      const handleSubmit = jest.fn(() =>
        newBillContainer.handleSubmit(mockEvent)
      )

      const sendBtn = screen.getByText('Envoyer')
      sendBtn.addEventListener('click', handleSubmit)
      userEvent.click(sendBtn)

      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
    })
  })

  describe('When I fill the file input correctly', () => {
    test('Then it should trigger handleChangeFile', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      document.body.innerHTML = NewBillUI()

      const onNavigate = () => {}
      // const billsSpy = jest.spyOn(mockStore, 'bills')
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      })
      const handleChangeFile = jest.fn(() => {
        const mockEvent = {}
        mockEvent.preventDefault = jest.fn()
        mockEvent.target = { value: 'OK.png' }
        newBillContainer.handleChangeFile(mockEvent)
      })

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      fileInput.addEventListener('change', handleChangeFile)

      await userEvent.upload(fileInput, file)

      expect(handleChangeFile).toHaveBeenCalled()
      // expect(billsSpy).toHaveBeenCalled()
    })
  })

  describe('When I fill the file input incorrectly (wrong file extension)', () => {
    test('Then it should not call for a bill creation via store', async () => {
      jest.clearAllMocks()

      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      document.body.innerHTML = NewBillUI()

      const billsSpy = jest.spyOn(mockStore, 'bills')

      const onNavigate = () => {}

      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      })

      const handleChangeFile = jest.fn(() => {
        const mockEvent = {}
        mockEvent.preventDefault = jest.fn()
        mockEvent.target = { value: 'NOK.txt' }
        newBillContainer.handleChangeFile(mockEvent)
      })

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      fileInput.addEventListener('change', handleChangeFile)

      await userEvent.upload(fileInput, file)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(billsSpy).not.toHaveBeenCalled()
    })
  })

  describe('When I submit the form', () => {
    test('Then it should trigger updateBill to upadte bill via store and redirect to Bills view', () => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )

      const mockEvent = {
        target: { querySelector: jest.fn() },
        preventDefault: jest.fn(),
      }
      mockEvent.target.querySelector.mockReturnValue('test value')

      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      })
      const spyUpdate = jest.spyOn(newBillContainer, 'updateBill')

      const handleSubmit = jest.fn(() =>
        newBillContainer.handleSubmit(mockEvent)
      )

      const sendBtn = screen.getByText('Envoyer')
      sendBtn.addEventListener('click', handleSubmit)
      userEvent.click(sendBtn)

      expect(handleSubmit).toHaveBeenCalled()
      expect(spyUpdate).toHaveBeenCalled()
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
    })
  })

  describe('When I fill the file input correctly', () => {
    test('Then it should POST to the API', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      document.body.innerHTML = NewBillUI()

      const onNavigate = () => {}

      const billsSpy = jest.spyOn(mockStore, 'bills')

      const spyCreate = jest.fn(() => {
        return Promise.resolve({})
      })

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: spyCreate,
        }
      })

      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      })

      const handleChangeFile = jest.fn(() => {
        const mockEvent = {}
        mockEvent.preventDefault = jest.fn()
        mockEvent.target = { value: 'OK.png' }
        newBillContainer.handleChangeFile(mockEvent)
      })

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fileInput.addEventListener('change', handleChangeFile)

      await userEvent.upload(fileInput, file)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(billsSpy).toHaveBeenCalled()
      expect(spyCreate).toHaveBeenCalled()
    })
  })
})

// TODO: POST test????
