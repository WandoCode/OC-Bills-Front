/**
 * @jest-environment jsdom
 */

import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import mockStore from '../__mocks__/store'
import router from '../app/Router'

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
  beforeEach(() => {
    jest.clearAllMocks()

    localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    )
    document.body.innerHTML = NewBillUI()
  })

  describe('When I submit the form', () => {
    test('Then it should trigger handleSubmit', () => {
      const mockEvent = {
        target: { querySelector: jest.fn() },
        preventDefault: jest.fn(),
      }
      mockEvent.target.querySelector.mockReturnValue('test value')

      const onNavigate = () => {}

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
    })
    test('Then it should trigger updateBill to update(POST) API and redirect me to the Bills view', () => {
      const mockEvent = {
        target: { querySelector: jest.fn() },
        preventDefault: jest.fn(),
      }

      mockEvent.target.querySelector.mockReturnValue('test value')

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
    test('Then it should trigger handleChangeFile', async () => {
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
        mockEvent.target = { value: 'OK.png' }
        newBillContainer.handleChangeFile(mockEvent)
      })

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      fileInput.addEventListener('change', handleChangeFile)

      await userEvent.upload(fileInput, file)

      expect(handleChangeFile).toHaveBeenCalled()

      // Check fct executed correctly
      expect(newBillContainer.billId).not.toBeNull()
      expect(newBillContainer.fileUrl).not.toBeNull()
      expect(newBillContainer.fileName).not.toBeNull()
    })
    test('Then it should POST to the API', async () => {
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

  describe('When I fill the file input incorrectly (wrong file extension)', () => {
    test('Then it should not call for a bill creation via store', async () => {
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

      expect(newBillContainer.billId).toBeNull()
      expect(newBillContainer.fileUrl).toBeNull()
      expect(newBillContainer.fileName).toBeNull()
    })
  })
})
